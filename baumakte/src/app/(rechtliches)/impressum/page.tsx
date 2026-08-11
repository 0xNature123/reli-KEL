import { Platzhalter, RechtSeite } from "../RechtSeite";

export const metadata = { title: "Impressum — BaumAkte" };

export default function ImpressumPage() {
  return (
    <RechtSeite titel="Impressum">
      <Platzhalter />

      <h2 className="text-xl font-semibold">Angaben gemaess § 5 DDG</h2>
      <p>
        ⟨Name des Anbieters⟩
        <br />
        ⟨Strasse und Hausnummer⟩
        <br />
        ⟨PLZ und Ort⟩
      </p>

      <h2 className="text-xl font-semibold">Kontakt</h2>
      <p>
        E-Mail: kontakt@baumakte.de
        <br />
        Telefon: ⟨Telefonnummer⟩
      </p>

      <h2 className="text-xl font-semibold">Umsatzsteuer-Identifikationsnummer</h2>
      <p>⟨USt-IdNr. gemaess § 27 a UStG⟩</p>

      <h2 className="text-xl font-semibold">Verantwortlich fuer den Inhalt</h2>
      <p>⟨Name, Anschrift⟩</p>

      <h2 className="text-xl font-semibold">Streitbeilegung</h2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </RechtSeite>
  );
}
