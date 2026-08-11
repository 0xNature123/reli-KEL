import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { areaLabel, findingLabel, habitatLabel, measureLabel, VITALITY_STUFEN } from "@/lib/fll/catalog";
import { URGENCY_LABEL } from "@/lib/fll/intervals";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AreaKey, Inspection, Measure, Org, Site, Tree } from "@/types";

/** Farben aus den Designtokens - react-pdf kennt keine CSS-Variablen. */
const C = {
  ink: "#0A0B0F",
  navy: "#101A33",
  violet: "#5836E0",
  gray200: "#E3E6EC",
  gray500: "#5F6675",
  red: "#B3261E",
  amber: "#A15C00",
  green: "#1F7A4D",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: { paddingTop: 42, paddingBottom: 56, paddingHorizontal: 42, fontSize: 10, color: C.ink },
  balken: { backgroundColor: C.navy, marginHorizontal: -42, marginTop: -42, padding: 42, marginBottom: 28 },
  markeWeiss: { color: C.white, fontSize: 22, fontFamily: "Helvetica-Bold" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6 },
  h3: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  klein: { fontSize: 9, color: C.gray500 },
  zeile: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.gray200, paddingVertical: 4 },
  zellLabel: { width: "38%", color: C.gray500 },
  zellWert: { width: "62%" },
  baumkarte: { borderWidth: 0.5, borderColor: C.gray200, borderRadius: 4, padding: 10, marginBottom: 10 },
  fuss: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    fontSize: 8,
    color: C.gray500,
    borderTopWidth: 0.5,
    borderTopColor: C.gray200,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  punkt: { width: 6, height: 6, borderRadius: 3, marginRight: 4, marginTop: 3 },
});

export interface BerichtBaum {
  tree: Tree;
  inspection: Inspection | null;
  measures: Measure[];
  storniert: boolean;
}

export interface BerichtDaten {
  org: Org;
  site: Site;
  reportId: string;
  /** Erstellungszeitpunkt - von der App gesetzt, nicht vom Nutzer. */
  generatedAt: Date;
  periodFrom: string | null;
  periodTo: string | null;
  baeume: BerichtBaum[];
  inspectorName: string;
}

const AMPEL: Record<string, string> = {
  sofort: C.red,
  drei_monate: C.amber,
  naechste_kontrolle: C.green,
};

export function Bericht(daten: BerichtDaten) {
  const { org, site, baeume, generatedAt, reportId } = daten;

  const mitKontrolle = baeume.filter((b) => b.inspection !== null);
  const ohneBefund = mitKontrolle.filter(
    (b) => b.inspection !== null && Object.values(b.inspection.findings).every((f) => f.ok),
  );
  const alleMassnahmen = baeume.flatMap((b) => b.measures);
  const sofort = alleMassnahmen.filter((m) => m.urgency === "sofort");

  const kuerzel = reportId.slice(0, 8);
  const fussText = `Bericht ${kuerzel} · ${site.name} · erstellt ${formatDateTime(generatedAt)} Uhr`;

  return (
    <Document
      title={`Baumkontrollbericht ${site.name}`}
      author={org.name}
      creator="BaumAkte"
      producer="BaumAkte"
    >
      {/* ---------- Deckblatt ---------- */}
      <Page size="A4" style={s.page}>
        <View style={s.balken}>
          <Text style={s.markeWeiss}>{org.name}</Text>
          {org.address ? <Text style={{ color: C.white, fontSize: 10, marginTop: 4 }}>{org.address}</Text> : null}
        </View>

        <Text style={s.h1}>Bericht zur Baumkontrolle</Text>
        <Text style={{ fontSize: 13, marginBottom: 20 }}>{site.name}</Text>

        <Zeile label="Objekt">{site.name}</Zeile>
        {site.address ? <Zeile label="Anschrift">{site.address}</Zeile> : null}
        {site.client_name ? <Zeile label="Auftraggeber">{site.client_name}</Zeile> : null}
        <Zeile label="Zeitraum">
          {daten.periodFrom && daten.periodTo
            ? `${formatDate(daten.periodFrom)} bis ${formatDate(daten.periodTo)}`
            : "alle erfassten Kontrollen"}
        </Zeile>
        <Zeile label="Baeume im Bericht">{String(baeume.length)}</Zeile>
        <Zeile label="Pruefer">{daten.inspectorName}</Zeile>
        {org.certificate_no ? <Zeile label="Zertifikatsnummer">{org.certificate_no}</Zeile> : null}
        <Zeile label="Erstellt am">{`${formatDateTime(generatedAt)} Uhr`}</Zeile>
        <Zeile label="Verfahren">Regelkontrolle, Sichtkontrolle vom Boden</Zeile>

        <Text style={[s.klein, { marginTop: 24 }]}>
          Die Kontrolle wurde in Anlehnung an die FLL-Baumkontrollrichtlinie durchgefuehrt.
          Die angegebenen Kontrollintervalle sind fachliche Entscheidungen des Pruefers; die
          Software schlaegt sie lediglich vor. Dieser Bericht dokumentiert eine
          Sichtkontrolle vom Boden und ersetzt keine eingehende Untersuchung.
        </Text>

        <Fusszeile text={fussText} />
      </Page>

      {/* ---------- Zusammenfassung und Massnahmen ---------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Zusammenfassung</Text>

        <Zeile label="Baeume im Bericht">{String(baeume.length)}</Zeile>
        <Zeile label="davon kontrolliert">{String(mitKontrolle.length)}</Zeile>
        <Zeile label="ohne Befund">{String(ohneBefund.length)}</Zeile>
        <Zeile label="mit Massnahme">
          {String(baeume.filter((b) => b.measures.length > 0).length)}
        </Zeile>
        <Zeile label="davon sofort zu erledigen">{String(sofort.length)}</Zeile>

        <Text style={s.h2}>Massnahmen nach Dringlichkeit</Text>
        {alleMassnahmen.length === 0 ? (
          <Text>Keine Massnahme erforderlich.</Text>
        ) : (
          [...alleMassnahmen]
            .sort((a, b) => rang(a) - rang(b) || a.due_on.localeCompare(b.due_on))
            .map((m) => {
              const baum = baeume.find((b) => b.tree.id === m.tree_id);
              return (
                <View key={m.id} style={[s.zeile, { alignItems: "flex-start" }]}>
                  <View style={[s.punkt, { backgroundColor: AMPEL[m.urgency] ?? C.gray500 }]} />
                  <Text style={{ width: "14%" }}>Baum {baum?.tree.number ?? "—"}</Text>
                  <Text style={{ width: "34%" }}>{measureLabel(m.kind)}</Text>
                  <Text style={{ width: "26%" }}>{URGENCY_LABEL[m.urgency]}</Text>
                  <Text style={{ width: "22%" }}>
                    bis {formatDate(m.due_on)}
                    {m.status === "erledigt" ? " · erledigt" : ""}
                  </Text>
                </View>
              );
            })
        )}

        <Fusszeile text={fussText} />
      </Page>

      {/* ---------- Baumblaetter ---------- */}
      {baeume.map((b) => (
        <Page key={b.tree.id} size="A4" style={s.page} wrap>
          <Text style={s.h1}>
            Baum {b.tree.number} — {b.tree.species}
          </Text>

          <Zeile label="Standort">
            {`${b.tree.lat.toFixed(5)} N, ${b.tree.lng.toFixed(5)} E${
              b.tree.gps_accuracy_m ? ` (±${Math.round(Number(b.tree.gps_accuracy_m))} m)` : ""
            }`}
          </Zeile>
          {b.tree.height_class ? <Zeile label="Hoehenklasse">{`${b.tree.height_class} m`}</Zeile> : null}
          {b.tree.dbh_cm ? <Zeile label="Stammdurchmesser">{`${b.tree.dbh_cm} cm`}</Zeile> : null}

          {b.inspection === null ? (
            <Text style={{ marginTop: 12 }}>
              Fuer diesen Baum liegt im gewaehlten Zeitraum keine Kontrolle vor.
            </Text>
          ) : (
            <Baumblatt eintrag={b} />
          )}

          <Fusszeile text={fussText} />
        </Page>
      ))}

      {/* ---------- Schlussseite ---------- */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Zur Unveraenderlichkeit dieses Nachweises</Text>

        <Text style={{ marginBottom: 8 }}>
          Jede Kontrolle wird beim Speichern festgeschrieben. Ein nachtraegliches Aendern oder
          Loeschen ist in der Datenbank technisch gesperrt, nicht nur in der Bedienoberflaeche
          ausgeblendet.
        </Text>
        <Text style={{ marginBottom: 8 }}>
          Jeder Kontrolldatensatz traegt eine Pruefsumme, die den Inhalt und die Pruefsumme der
          vorhergehenden Kontrolle desselben Baums einbezieht. Dadurch entsteht eine Kette:
          Wird ein Eintrag nachtraeglich veraendert, passen alle folgenden Pruefsummen nicht
          mehr, und der Bruch ist nachweisbar.
        </Text>
        <Text style={{ marginBottom: 8 }}>
          Eine Korrektur loescht nichts. Sie entsteht als neuer Datensatz, der den alten als
          storniert kennzeichnet und eine Begruendung traegt. Beide bleiben im Bericht sichtbar.
        </Text>
        <Text style={{ marginBottom: 16 }}>
          Fotos werden beim Aufnehmen mit Zeitpunkt, Koordinaten, Pruefer und Baumnummer
          beschriftet; zusaetzlich wird eine Pruefsumme ueber die Bilddatei gespeichert. Damit
          laesst sich zeigen, dass ein Bild nach dem Hochladen nicht ausgetauscht wurde.
        </Text>

        <Text style={s.h2}>Pruefsummen der Kontrollen in diesem Bericht</Text>
        {baeume
          .filter((b) => b.inspection !== null)
          .map((b) => (
            <View key={b.tree.id} style={s.zeile}>
              <Text style={{ width: "20%" }}>Baum {b.tree.number}</Text>
              <Text style={{ width: "80%", fontFamily: "Courier", fontSize: 8 }}>
                {b.inspection?.hash}
              </Text>
            </View>
          ))}

        <Fusszeile text={fussText} />
      </Page>
    </Document>
  );
}

function rang(m: Measure): number {
  return m.urgency === "sofort" ? 0 : m.urgency === "drei_monate" ? 1 : 2;
}

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.zeile}>
      <Text style={s.zellLabel}>{label}</Text>
      <Text style={s.zellWert}>{children}</Text>
    </View>
  );
}

function Baumblatt({ eintrag }: { eintrag: BerichtBaum }) {
  const k = eintrag.inspection;
  if (!k) return null;

  const bereiche = Object.entries(k.findings) as Array<[AreaKey, (typeof k.findings)[AreaKey]]>;

  return (
    <View>
      {eintrag.storniert && (
        <Text style={{ color: C.red, marginTop: 8 }}>
          Diese Kontrolle wurde storniert. Begruendung: {k.void_reason ?? "—"}
        </Text>
      )}

      <Text style={s.h2}>Kontrolle vom {formatDate(k.inspected_at)}</Text>
      <Zeile label="Pruefer">{k.inspector_name}</Zeile>
      <Zeile label="Verkehrssicherheit">
        {k.assessment === "gegeben"
          ? "gegeben"
          : k.assessment === "eingeschraenkt"
            ? "eingeschraenkt"
            : "nicht gegeben"}
      </Zeile>
      <Zeile label="Vitalitaet">
        {VITALITY_STUFEN.find((v) => v.code === k.vitality)?.label ?? k.vitality}
      </Zeile>
      <Zeile label="Entwicklungsphase">{k.dev_phase}</Zeile>
      <Zeile label="Naechste Kontrolle">
        {`${formatDate(k.next_due_on)} (${k.next_interval_months} Monate)`}
      </Zeile>

      <Text style={s.h2}>Befunde je Baumbereich</Text>
      {bereiche.map(([key, f]) => (
        <View key={key} style={s.zeile}>
          <Text style={s.zellLabel}>{areaLabel(key)}</Text>
          <Text style={s.zellWert}>
            {f.ok && !f.not_visible
              ? "ohne Befund"
              : [
                  f.codes.map(findingLabel).join(", "),
                  f.note ?? "",
                  f.not_visible ? "nicht einsehbar" : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </Text>
        </View>
      ))}

      {k.habitat_features.length > 0 && (
        <>
          <Text style={s.h2}>Artenschutz</Text>
          <Text>{k.habitat_features.map((h) => habitatLabel(h.kind)).join(", ")}</Text>
          <Text style={[s.klein, { marginTop: 4 }]}>
            Vor einem Eingriff ist die artenschutzrechtliche Zulaessigkeit nach §§ 39, 44
            BNatSchG zu pruefen.
          </Text>
        </>
      )}

      {eintrag.measures.length > 0 && (
        <>
          <Text style={s.h2}>Massnahmen</Text>
          {eintrag.measures.map((m) => (
            <View key={m.id} style={[s.zeile, { alignItems: "flex-start" }]}>
              <View style={[s.punkt, { backgroundColor: AMPEL[m.urgency] ?? C.gray500 }]} />
              <Text style={{ width: "40%" }}>{measureLabel(m.kind)}</Text>
              <Text style={{ width: "30%" }}>{URGENCY_LABEL[m.urgency]}</Text>
              <Text style={{ width: "26%" }}>
                {m.status === "erledigt"
                  ? `ausgefuehrt ${formatDate(m.done_at)} von ${m.done_by_name ?? "—"}`
                  : `Frist ${formatDate(m.due_on)}`}
              </Text>
            </View>
          ))}
        </>
      )}

      {k.note ? (
        <>
          <Text style={s.h2}>Bemerkung</Text>
          <Text>{k.note}</Text>
        </>
      ) : null}

      <Text style={[s.klein, { marginTop: 12 }]}>
        Pruefsumme dieser Kontrolle: {k.hash.slice(0, 24)} …
        {k.prev_hash ? ` · Vorgaenger: ${k.prev_hash.slice(0, 12)} …` : " · Anfang der Kette"}
      </Text>
    </View>
  );
}

function Fusszeile({ text }: { text: string }) {
  return (
    <View style={s.fuss} fixed>
      <Text>{text}</Text>
      <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
    </View>
  );
}
