import { Platzhalter, RechtSeite } from "../RechtSeite";

export const metadata = { title: "AGB — BaumAkte" };

export default function AgbPage() {
  return (
    <RechtSeite titel="Allgemeine Geschaeftsbedingungen">
      <Platzhalter />

      <h2 className="text-xl font-semibold">1. Gegenstand</h2>
      <p>
        BaumAkte stellt eine Webanwendung zur Dokumentation von Baumkontrollen zur Verfuegung.
        Der Anbieter erbringt keine baumfachliche Leistung und trifft keine fachliche
        Bewertung. Saemtliche fachlichen Entscheidungen, insbesondere Beurteilung der
        Verkehrssicherheit, Massnahmen und Kontrollintervalle, trifft ausschliesslich der
        Nutzer.
      </p>

      <h2 className="text-xl font-semibold">2. Keine Uebernahme der Verkehrssicherungspflicht</h2>
      <p>
        Die Software unterstuetzt bei der Dokumentation. Die Verkehrssicherungspflicht und die
        Haftung hierfuer verbleiben unveraendert beim Nutzer beziehungsweise beim
        Baumeigentuemer.
      </p>

      <h2 className="text-xl font-semibold">3. Testphase</h2>
      <p>
        Die Testphase betraegt 14 Tage und erfordert keine Zahlungsdaten. Sie endet
        automatisch; es entsteht kein Abonnement, das gekuendigt werden muesste.
      </p>

      <h2 className="text-xl font-semibold">4. Laufzeit, Preise und Kuendigung</h2>
      <p>
        Die Mindestlaufzeit betraegt 12 Monate, danach ist monatlich kuendbar. Alle Preise
        verstehen sich zzgl. gesetzlicher Umsatzsteuer. Die Kuendigung ist im Konto ohne
        Angabe von Gruenden moeglich.
      </p>

      <h2 className="text-xl font-semibold">5. Datenexport</h2>
      <p>
        Der Nutzer kann seinen Bestand jederzeit als CSV und seine Berichte als PDF
        exportieren. Dieses Recht besteht auch nach Vertragsende fort.
      </p>

      <h2 className="text-xl font-semibold">6. Verfuegbarkeit</h2>
      <p>
        Der Anbieter bemueht sich um hohe Verfuegbarkeit, schuldet aber keine
        ununterbrochene Erreichbarkeit. Wartungsfenster werden nach Moeglichkeit angekuendigt.
      </p>

      <h2 className="text-xl font-semibold">7. Beta-Programm</h2>
      <p>
        Waehrend der Beta-Phase wird der Zugang kostenlos gewaehrt. Teilnehmer erklaeren sich
        bereit, Rueckmeldung zur Nutzung zu geben. Ein Anspruch auf bestimmte Funktionen
        besteht nicht.
      </p>
    </RechtSeite>
  );
}
