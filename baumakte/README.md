# BaumAkte

Dokumentation von Baumkontrollen: Kataster, gefuehrte Regelkontrolle, gestempeltes Foto,
Massnahmen mit Frist und Durchfuehrungsnachweis, unveraenderliches Protokoll, Bericht als PDF.

Next.js 15 (App Router) · TypeScript strict · Tailwind · Supabase · Stripe · MapLibre.

## Einrichten

```bash
npm install
cp .env.example .env.local     # Werte eintragen
npm run dev
```

### 1. Supabase

Projekt in der Region Frankfurt anlegen, dann `supabase/migrations/0001_init.sql` im
SQL-Editor ausfuehren. Das legt an:

- alle Tabellen inklusive Vitalitaet, Artenschutzmerkmalen und Durchfuehrungsnachweis
- den Trigger fuer die Hash-Kette und die Sperre gegen UPDATE und DELETE auf `inspections`
- Row Level Security fuer jede Tabelle
- die Storage-Buckets `fotos`, `berichte`, `logos` samt Zugriffsregeln
- die Funktion `register_org`, die Betrieb und Profil in einer Transaktion anlegt

Aus den Projekteinstellungen in `.env.local` uebernehmen: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Der Service-Key umgeht RLS. Er wird ausschliesslich vom Stripe-Webhook und vom
oeffentlichen Berichtslink benutzt und darf nie in den Browser gelangen.

### 2. Stripe

Im Dashboard je ein Produkt fuer *Kontrolleur* und *Betrieb* anlegen, dazu je einen
Monats- und einen Jahrespreis in EUR. Die vier Preis-IDs in `.env.local` eintragen.

PayPal unter *Zahlungsmethoden* aktivieren — ohne das faellt der Checkout auf Karte zurueck.

Webhook auf `https://<domain>/api/stripe/webhook` einrichten, Ereignisse:

```
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed
```

Das Signaturgeheimnis als `STRIPE_WEBHOOK_SECRET` hinterlegen. Ohne gueltige Signatur
weist der Endpunkt jede Anfrage ab.

Lokal testen:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Landingpage

`public/landing/index.html` ist eine eigenstaendige Datei ohne Build-Schritt, ohne externe
Ressourcen und ohne Tracking. Sie laesst sich per Doppelklick oeffnen und wird von der App
unter `/` ausgeliefert (Rewrite in `next.config.ts`).

Die Fotoflaechen sind beschriftete Platzhalter; ueber jedem steht als HTML-Kommentar, welches
Motiv dorthin gehoert.

## Ablauf beim Abschluss eines Abos

```
Landingpage  →  /abo/start?paket=betrieb
                 └─ nicht angemeldet? Middleware leitet auf
                    /login?next=/abo/start?paket=betrieb
                 └─ angemeldet: Paket bestaetigen, Zahlungsweise waehlen
                     →  Stripe Checkout (Karte oder PayPal)
                         →  /app/abo?status=erfolg
                         →  Webhook schaltet das Paket frei
```

Der Betrag kommt immer aus der Preis-ID in der Umgebung, nie aus dem Formular.

## Hash-Kette pruefen

```bash
npm run verify -- <tree_id>
npm run verify -- --alle
```

Das Skript rechnet jede Pruefsumme aus dem Inhalt neu und vergleicht sie mit der
gespeicherten. Bei einer Abweichung meldet es die betroffene Kontrolle und endet mit
Code 1. Das ist das Verkaufsargument in vorfuehrbarer Form.

## Was gebaut ist

Anmeldung und Registrierung · Betriebsprofil mit Logo · Objekte · Karte mit MapLibre und
OSM-Kacheln · Baum setzen ueber GPS oder Fadenkreuz · Kontrolle in drei Schritten mit
getrennter Bewertung von Vitalitaet und Verkehrssicherheit · Artenschutzmerkmale und
Hinweis nach §§ 39, 44 BNatSchG · Foto mit eingebranntem Stempel und SHA-256 · Massnahmen
mit Fristenampel und Durchfuehrungsnachweis · Hash-Kette und Sperre gegen Aenderungen ·
Baumhistorie · PDF-Bericht mit automatischem Erstellungszeitpunkt · oeffentlicher
Berichtslink ueber Token · CSV-Vollexport · Startseite mit Datum, Ordnern, PDF-Liste und
Suche · Stripe-Abo mit Karte und PayPal.

## Was noch fehlt

- **Vollstaendiger Offline-Betrieb.** Der Entwurf einer laufenden Kontrolle liegt in
  IndexedDB und ueberlebt einen App-Neustart; das Abschliessen braucht derzeit Netz.
  Die Outbox in `src/lib/db/` ist angelegt, der Sync-Worker fehlt.
- Vorab ladbare Kartenkacheln und Service Worker (PWA-Installation).
- Import aus Excel und CSV.
- Eigentuemer-Portal.
- Storno einer Kontrolle ueber die Oberflaeche. Das Datenmodell traegt es
  (`voids_inspection_id`), der Bericht stellt es dar, die Bedienung fehlt.
- Mehrere Nutzer je Betrieb.

Diese Punkte sind auf der Landingpage als „in Vorbereitung“ gekennzeichnet und duerfen
bis dahin nicht als vorhandene Funktion beworben werden.

## Vor dem oeffentlichen Start

Impressum, Datenschutzerklaerung und AGB unter `src/app/(rechtliches)/` sind Platzhalter
mit sichtbarem Hinweis. Sie muessen fachkundig erstellt oder geprueft werden, bevor die
Seite beworben wird.
