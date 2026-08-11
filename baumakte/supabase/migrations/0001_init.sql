-- BaumAkte Grundschema
-- Prinzip: inspections ist append-only. Kein UPDATE, kein DELETE, technisch erzwungen.
-- Jede Kontrolle haengt per Hash an der Vorkontrolle desselben Baums.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- Betrieb
create table orgs (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  address              text,
  logo_path            text,
  inspector_name       text,
  certificate_no       text,

  -- Abonnement
  plan                 text,
  subscription_status  text not null default 'trial'
                       check (subscription_status in
                             ('trial','active','past_due','canceled','incomplete','none')),
  trial_ends_at        timestamptz not null default (now() + interval '14 days'),
  current_period_end   timestamptz,
  stripe_customer_id   text unique,
  stripe_subscription_id text unique,
  beta_until           date,

  created_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------- Nutzer
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  org_id     uuid not null references orgs(id) on delete cascade,
  full_name  text not null,
  created_at timestamptz not null default now()
);
create index on profiles (org_id);

-- ---------------------------------------------------------------- Objekt
create table sites (
  id          uuid primary key,
  org_id      uuid not null references orgs(id) on delete cascade,
  name        text not null,
  address     text,
  lat         double precision,
  lng         double precision,
  client_name text,
  created_at  timestamptz not null default now()
);
create index on sites (org_id, created_at desc);

-- ---------------------------------------------------------------- Baum
create table trees (
  id             uuid primary key,
  org_id         uuid not null references orgs(id) on delete cascade,
  site_id        uuid not null references sites(id) on delete cascade,
  number         text not null,
  species        text not null,
  height_class   text,
  dbh_cm         integer check (dbh_cm is null or dbh_cm between 1 and 900),
  lat            double precision not null,
  lng            double precision not null,
  gps_accuracy_m numeric,
  removed_at     timestamptz,
  created_at     timestamptz not null default now(),
  unique (site_id, number)
);
create index on trees (site_id);
create index on trees (org_id);

-- ---------------------------------------------------------------- Kontrolle (APPEND ONLY)
create table inspections (
  id                   uuid primary key,
  org_id               uuid not null references orgs(id) on delete cascade,
  tree_id              uuid not null references trees(id) on delete cascade,
  inspector_id         uuid not null references profiles(id),
  inspector_name       text not null,          -- eingefroren, bewusst nicht gejoint
  inspected_at         timestamptz not null,
  method               text not null default 'regelkontrolle_sicht',
  dev_phase            text not null check (dev_phase in ('jugend','reife','alterung')),

  -- Vitalitaet und Verkehrssicherheit sind getrennte Achsen.
  vitality             text not null default '0' check (vitality in ('0','1','2','3')),
  assessment           text not null check (assessment in ('gegeben','eingeschraenkt','nicht_gegeben')),

  findings             jsonb not null,
  habitat_features     jsonb not null default '[]'::jsonb,   -- Artenschutz

  next_interval_months integer not null check (next_interval_months between 0 and 60),
  next_due_on          date not null,
  note                 text,

  voids_inspection_id  uuid references inspections(id),
  void_reason          text,

  prev_hash            text,
  hash                 text not null,
  created_at           timestamptz not null default now(),

  constraint storno_braucht_begruendung
    check (voids_inspection_id is null or (void_reason is not null and length(void_reason) >= 5))
);
create index on inspections (tree_id, inspected_at desc);
create index on inspections (org_id, inspected_at desc);

-- ---------------------------------------------------------------- Massnahme
create table measures (
  id            uuid primary key,
  org_id        uuid not null references orgs(id) on delete cascade,
  tree_id       uuid not null references trees(id) on delete cascade,
  inspection_id uuid not null references inspections(id) on delete cascade,
  kind          text not null,
  urgency       text not null check (urgency in ('sofort','drei_monate','naechste_kontrolle')),
  due_on        date not null,
  note          text,
  status        text not null default 'offen' check (status in ('offen','erledigt')),

  -- Durchfuehrungsnachweis: wann und von wem ausgefuehrt
  done_at       timestamptz,
  done_by_name  text,
  done_note     text,

  created_at    timestamptz not null default now(),

  constraint erledigt_braucht_nachweis
    check (status = 'offen' or (done_at is not null and done_by_name is not null))
);
create index on measures (org_id, status, due_on);
create index on measures (tree_id);

-- ---------------------------------------------------------------- Foto
create table photos (
  id            uuid primary key,
  org_id        uuid not null references orgs(id) on delete cascade,
  inspection_id uuid not null references inspections(id) on delete cascade,
  tree_id       uuid not null references trees(id) on delete cascade,
  area          text,
  storage_path  text not null,
  taken_at      timestamptz not null,
  lat           double precision,
  lng           double precision,
  sha256        text not null,
  created_at    timestamptz not null default now()
);
create index on photos (inspection_id);

-- ---------------------------------------------------------------- Bericht
create table reports (
  id           uuid primary key,
  org_id       uuid not null references orgs(id) on delete cascade,
  site_id      uuid not null references sites(id) on delete cascade,
  created_by   uuid not null references profiles(id),
  title        text not null,
  period_from  date,
  period_to    date,
  tree_count   integer not null default 0,
  storage_path text not null,
  sha256       text not null,
  share_token  text unique,
  generated_at timestamptz not null default now(),   -- Erstellungszeitpunkt, von der App gesetzt
  created_at   timestamptz not null default now()
);
create index on reports (org_id, generated_at desc);
create index on reports (site_id, generated_at desc);

-- ================================================================ Unveraenderlichkeit

create or replace function set_inspection_hash() returns trigger as $$
declare last_hash text;
begin
  select hash into last_hash
    from inspections
   where tree_id = new.tree_id
   order by created_at desc, id desc
   limit 1;

  new.prev_hash := last_hash;
  new.hash := encode(digest(
      coalesce(last_hash,'') ||
      new.id::text || new.tree_id::text || new.inspector_id::text ||
      new.inspected_at::text || new.dev_phase || new.vitality || new.assessment ||
      new.findings::text || new.habitat_features::text || coalesce(new.note,'') ||
      coalesce(new.voids_inspection_id::text,'')
    , 'sha256'), 'hex');
  return new;
end $$ language plpgsql;

create trigger trg_inspection_hash
  before insert on inspections
  for each row execute function set_inspection_hash();

create or replace function block_write() returns trigger as $$
begin
  raise exception 'Kontrollen sind unveraenderlich. Korrektur nur per Storno-Datensatz.';
end $$ language plpgsql;

create trigger trg_inspections_immutable
  before update or delete on inspections
  for each row execute function block_write();

-- Fotos gehoeren zur Beweiskette und werden ebenfalls nicht veraendert.
create trigger trg_photos_immutable
  before update or delete on photos
  for each row execute function block_write();

-- ================================================================ Row Level Security

create or replace function current_org_id() returns uuid as $$
  select org_id from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

alter table orgs        enable row level security;
alter table profiles    enable row level security;
alter table sites       enable row level security;
alter table trees       enable row level security;
alter table inspections enable row level security;
alter table measures    enable row level security;
alter table photos      enable row level security;
alter table reports     enable row level security;

-- Betrieb: lesen und die Stammdaten pflegen. Abo-Felder aendert nur der Webhook
-- ueber den Service-Key, der RLS ohnehin umgeht.
create policy org_read   on orgs for select using (id = current_org_id());
create policy org_update on orgs for update using (id = current_org_id())
                                  with check (id = current_org_id());

create policy profile_read on profiles for select using (org_id = current_org_id());
create policy profile_self_update on profiles for update using (id = auth.uid())
                                  with check (id = auth.uid());

-- Objekte, Baeume, Massnahmen, Berichte: lesen und schreiben im eigenen Betrieb.
create policy site_read   on sites for select using (org_id = current_org_id());
create policy site_insert on sites for insert with check (org_id = current_org_id());
create policy site_update on sites for update using (org_id = current_org_id())
                                  with check (org_id = current_org_id());
create policy site_delete on sites for delete using (org_id = current_org_id());

create policy tree_read   on trees for select using (org_id = current_org_id());
create policy tree_insert on trees for insert with check (org_id = current_org_id());
create policy tree_update on trees for update using (org_id = current_org_id())
                                  with check (org_id = current_org_id());

-- Kontrollen: ausdruecklich nur select und insert. Keine update-, keine delete-Policy.
create policy inspection_read   on inspections for select using (org_id = current_org_id());
create policy inspection_insert on inspections for insert with check (org_id = current_org_id());

create policy measure_read   on measures for select using (org_id = current_org_id());
create policy measure_insert on measures for insert with check (org_id = current_org_id());
create policy measure_update on measures for update using (org_id = current_org_id())
                                     with check (org_id = current_org_id());

create policy photo_read   on photos for select using (org_id = current_org_id());
create policy photo_insert on photos for insert with check (org_id = current_org_id());

create policy report_read   on reports for select using (org_id = current_org_id());
create policy report_insert on reports for insert with check (org_id = current_org_id());
create policy report_update on reports for update using (org_id = current_org_id())
                                    with check (org_id = current_org_id());

-- ================================================================ Registrierung
-- Legt Betrieb und Profil in einer Transaktion an. security definer, damit die
-- orgs-Zeile entstehen kann, bevor ein Profil existiert, auf das RLS pruefen koennte.
create or replace function register_org(p_org_name text, p_full_name text)
returns uuid as $$
declare new_org uuid;
begin
  if auth.uid() is null then
    raise exception 'Nicht angemeldet';
  end if;
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Profil existiert bereits';
  end if;

  insert into orgs (name, inspector_name)
       values (nullif(trim(p_org_name), ''), nullif(trim(p_full_name), ''))
    returning id into new_org;

  insert into profiles (id, org_id, full_name)
       values (auth.uid(), new_org, nullif(trim(p_full_name), ''));

  return new_org;
end $$ language plpgsql security definer set search_path = public;

revoke all on function register_org(text, text) from public;
grant execute on function register_org(text, text) to authenticated;

-- ================================================================ Storage
insert into storage.buckets (id, name, public)
     values ('fotos', 'fotos', false), ('berichte', 'berichte', false), ('logos', 'logos', false)
on conflict (id) do nothing;

-- Dateien liegen unter <org_id>/... - der erste Pfadabschnitt ist die Betriebskennung.
create policy storage_read on storage.objects for select
  using (bucket_id in ('fotos','berichte','logos')
         and (storage.foldername(name))[1] = current_org_id()::text);

create policy storage_insert on storage.objects for insert
  with check (bucket_id in ('fotos','berichte','logos')
              and (storage.foldername(name))[1] = current_org_id()::text);

create policy storage_update on storage.objects for update
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = current_org_id()::text);
