import { Platzhalter, RechtSeite } from "../RechtSeite";

export const metadata = { title: "Datenschutz — BaumAkte" };

export default function DatenschutzPage() {
  return (
    <RechtSeite titel="Datenschutzerklaerung">
      <Platzhalter />

      <h2 className="text-xl font-semibold">Verantwortlicher</h2>
      <p>⟨Name und Anschrift des Anbieters⟩, kontakt@baumakte.de</p>

      <h2 className="text-xl font-semibold">Wo die Daten liegen</h2>
      <p>
        Anwendung und Datenbank werden in Deutschland betrieben. Einen Vertrag zur
        Auftragsverarbeitung nach Art. 28 DSGVO stellen wir Kunden zur Verfuegung.
      </p>

      <h2 className="text-xl font-semibold">Welche Daten wir verarbeiten</h2>
      <p>
        Bestandsdaten des Betriebs (Name, Anschrift, Pruefername, Zertifikatsnummer),
        Zugangsdaten (E-Mail, Passwort-Hash) sowie die von Ihnen erfassten Fachdaten:
        Objekte, Baeume mit Koordinaten, Kontrollen, Massnahmen, Fotos und Berichte.
      </p>
      <p>
        Fotos enthalten den von Ihnen erzeugten Stempel mit Zeitpunkt, Koordinaten,
        Pruefernamen und Baumnummer. EXIF-Daten der Kamera werden bei der Verarbeitung im
        Browser verworfen.
      </p>

      <h2 className="text-xl font-semibold">Standortdaten</h2>
      <p>
        Die Standortbestimmung erfolgt nur, wenn Sie sie im Browser erlauben, und
        ausschliesslich zum Verorten eines Baums und zum Stempeln eines Fotos.
      </p>

      <h2 className="text-xl font-semibold">Zahlungen</h2>
      <p>
        Zahlungen wickelt Stripe ab. Kartendaten werden dort verarbeitet und erreichen unsere
        Server nicht. Wir speichern lediglich eine Kundenkennung, den Status des
        Abonnements und das Ende der laufenden Abrechnungsperiode.
      </p>

      <h2 className="text-xl font-semibold">Karten</h2>
      <p>
        Kartenkacheln werden von den Servern des OpenStreetMap-Projekts geladen. Dabei wird
        Ihre IP-Adresse an diese Server uebermittelt.
      </p>

      <h2 className="text-xl font-semibold">Keine Analyse, kein Tracking</h2>
      <p>
        Wir setzen keine Analysewerkzeuge, keine Zaehlpixel und keine Werbe-Cookies ein. Die
        oeffentliche Startseite laedt keine externen Schriften und keine Skripte Dritter.
        Gesetzt werden ausschliesslich technisch notwendige Cookies fuer die Anmeldung.
      </p>

      <h2 className="text-xl font-semibold">Loeschung Ihres Kontos</h2>
      <p>
        Auf Wunsch loeschen wir Ihr Konto und die personenbezogenen Daten. Kontrollprotokolle
        koennen in anonymisierter Form erhalten bleiben, soweit sie zur Erfuellung von
        Nachweispflichten erforderlich sind. Was genau erhalten bleibt, teilen wir Ihnen vor
        der Loeschung mit.
      </p>

      <h2 className="text-xl font-semibold">Ihre Rechte</h2>
      <p>
        Auskunft, Berichtigung, Loeschung, Einschraenkung der Verarbeitung, Datenuebertragbarkeit
        und Widerspruch nach Art. 15 bis 21 DSGVO. Ausserdem koennen Sie sich bei einer
        Aufsichtsbehoerde beschweren.
      </p>
    </RechtSeite>
  );
}
