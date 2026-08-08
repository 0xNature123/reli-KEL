# Webseite Baumpflege & Gartenservice

Umsetzung des Bauplans (Version 1.0) als statische Einzelseite: kein Framework,
kein WordPress, kein JavaScript, keine externen Verbindungen beim Aufruf.

```
website/
├─ index.html          Startseite mit allen Abschnitten, Metadaten, JSON-LD
├─ impressum.html      Vorlage nach § 5 DDG
├─ datenschutz.html    Vorlage nach Art. 13 DSGVO
├─ css/styles.css      Farbsystem, Typografie, Seillinie, Layout
├─ img/platzhalter.svg Platzhalter, bis die echten Fotos da sind
└─ fonts/              hier die fünf WOFF2-Dateien ablegen (siehe unten)
```

Ansehen: Ordner öffnen und `index.html` im Browser laden – oder
`python3 -m http.server` im Ordner `website/` starten.

---

## Was noch fehlt, bevor die Seite online geht

### 1. Platzhalter ersetzen

Alles in eckigen Klammern ist ein Platzhalter. Am schnellsten mit Suchen-und-
Ersetzen über alle drei HTML-Dateien:

| Platzhalter | Beispiel |
|---|---|
| `[Vorname Nachname]` | dein vollständiger Name |
| `[Firmenname]` | Firmierung, falls abweichend |
| `[Ort]` | Sitz des Betriebs |
| `[Ort 1]` … `[Ort 8]` | Gemeinden im Einsatzgebiet, einzeln ausgeschrieben |
| `[Straße Nr.]`, `[PLZ]` | ladungsfähige Anschrift, kein Postfach |
| `[domain]` | deine Domain ohne `.de` |
| `[Nummer]` | Telefonnummer in Anzeigeform |
| `+49151XXXXXXX` | Telefonnummer in `tel:`-Form, ohne Leerzeichen |
| `[konto]` | Cal.com-Benutzername |
| `[Versicherer]`, `[Nummer]` | Betriebshaftpflicht |

Im JSON-LD zusätzlich `latitude` und `longitude` auf die echten Koordinaten
setzen (aktuell `0.000000`) und `addressRegion` prüfen.

**NAP-Regel:** Name, Adresse und Telefonnummer müssen auf Webseite,
Google-Unternehmensprofil, Flyer, Fahrzeug und in jedem Branchenverzeichnis
zeichengleich stehen. Einmal „Str." und einmal „Straße" schwächt die lokale
Auffindbarkeit messbar.

### 2. Schriften herunterladen

Niemals per Google-CDN einbinden – das war Gegenstand einer eigenen
Abmahnwelle. Die fünf benötigten Schnitte von Google Fonts herunterladen, in
WOFF2 umwandeln und unter diesen Namen in `fonts/` ablegen:

```
archivo-700.woff2
archivo-800.woff2
ibm-plex-sans-400.woff2
ibm-plex-sans-500.woff2
ibm-plex-mono-500.woff2
```

Zusammen unter 120 kB. Solange die Dateien fehlen, greift die Seite auf die
Systemschriften zurück – sie funktioniert, sieht aber nicht fertig aus.

### 3. Fotos einsetzen

| Motiv | Format | Verwendung | Datei |
|---|---|---|---|
| Du am Seil in der Krone | quer 16:9 | Hero | `img/hero.webp` |
| Portrait in Arbeitskleidung | hoch 4:5 | Qualifikation | `img/portrait.webp` |
| Steilhang oder enge Bebauung | quer 3:2 | Warum am Seil | `img/steilhang.webp` |
| Vorher / Nachher je Objekt | quer 3:2 | Referenzen | `img/ref-1-vorher.webp` … |
| Detail: Pilzkörper, Rissbild | quer 3:2 | Baumkontrolle | `img/detail.webp` |
| Aufgeräumte Fläche nach Arbeit | quer 3:2 | Ablauf | `img/aufgeraeumt.webp` |

Vorgaben: WebP, JPG als Rückfall. Hero maximal 1920 px breit und unter 250 kB,
Inhaltsbilder maximal 1200 px und unter 120 kB. Breite und Höhe stehen bereits
im HTML – beim Austausch anpassen, sonst springt das Layout. Vorher/Nachher
immer aus identischer Position, gleiche Brennweite, gleiche Tageszeit.

Zusätzlich `img/teilen.jpg` in 1200 × 630 px anlegen: Hero-Foto mit Namen und
Ort als Text darauf. Ohne diese Datei zeigt WhatsApp einen grauen Kasten.

Alt-Texte beschreibend halten, nicht mit Suchbegriffen vollstopfen.

### 4. Referenzen

Der Abschnitt 04 ist bewusst noch nicht veröffentlicht – er liegt als
auskommentierte Vorlage in `index.html`. Erst einbauen, wenn drei echte Objekte
fotografiert sind. Ein leerer Abschnitt ist besser als Stockfotos. Danach den
Kommentar entfernen und `<li><a href="#referenzen">…</a></li>` in die Navigation
aufnehmen.

### 5. Qualifikation

Nur eintragen, was wirklich vorliegt. Eine unzutreffende Zertifizierungsangabe
ist abmahnfähig und bei kommunaler Vergabe ein Ausschlussgrund.
„FLL-zertifiziert" erst nach bestandener Prüfung.

### 6. Cal.com einbetten

Kostenlose Stufe, beidseitig mit dem eigenen Kalender verbunden. Den
Einbettungscode aus dem Konto in `index.html` anstelle von
`.kalender-platzhalter` einsetzen. Einstellungen:

- Buchbar ist ausschließlich „Besichtigung, 20 Minuten" – nie ein Arbeitstermin.
- Mindestvorlauf 48 Stunden, Puffer 30 Minuten vor und nach jedem Termin.
- Nur selbst freigegebene Zeitfenster, nicht die gesamte freie Zeit.
- Pflichtfelder: Adresse des Objekts, Art der Arbeit, Telefonnummer.
- Bestätigung und Erinnerung 24 Stunden vorher automatisch per Mail.
- Auftragsverarbeitungsvertrag im Cal.com-Konto herunterladen und ablegen.

### 7. Besucherauswertung

Empfehlung: Umami selbst hosten (0 €, cookielos) oder Plausible mieten
(~9 €/Monat). Beides braucht kein Einwilligungsbanner. Skript vor `</body>`
einfügen. Zu messende Ereignisse:

`klick_anruf` · `klick_termin` · `termin_gebucht` · `scrolltiefe_50` /
`scrolltiefe_90` · `klick_leistung_[name]` · `faq_geoeffnet_[frage]`

Die wichtigste Zahl ist `klick_anruf`. Bei 20–60 Besuchern im Monat ist jede
Prozentzahl allerdings Zufallsrauschen – bis etwa 300 Besucher monatlich ist die
verlässlichere Messung eine Frage am Telefon: „Wie sind Sie auf mich gekommen?"

### 8. Suchmaschinen

`robots.txt` und `sitemap.xml` liegen bereit – in beiden Dateien `[domain]`
ersetzen, in der Sitemap zusätzlich `<lastmod>` bei jeder inhaltlichen Änderung
aktualisieren. Nach dem Onlinegang die Domain in der Google Search Console
eintragen und die Startseite zur Indexierung melden.

Titel und Beschreibung sind auf Länge getrimmt (57 bzw. 151 Zeichen). Wenn du
`[Ort]` durch einen langen Ortsnamen ersetzt, beides nachzählen: Titel höchstens
60, Beschreibung 140–160 Zeichen.

### 9. Symbole

`favicon.ico` (32×32), `icon.svg` und `apple-touch-icon.png` ins Wurzel-
verzeichnis legen. Die Verweise stehen bereits im `<head>`.

---

## Regeln, die beim Weiterbauen gelten

**Farben – sechs Werte, mehr nicht.** Alle liegen als CSS-Variablen in
`:root`. Orange (`--signal`) nur für Buttons, Marker und Akzentlinien,
höchstens 5 % der Fläche und nie als Textfarbe. Fließtext immer `--tanne` auf
hell oder `--nebel` auf dunkel. Kein Text direkt auf einem Foto ohne
Abdunklungsschicht von mindestens 45 %.

**Schrift – drei Rollen.** Archivo für Überschriften und Buttons, IBM Plex Sans
für Fließtext, IBM Plex Mono für alles Messbare: Preise, Maße, Labels,
Zertifikate. Der Monospace-Griff ist das eigentliche Erkennungszeichen – er
überträgt „hier misst und protokolliert jemand" ins Visuelle. 18 px sind die
Untergrenze für Fließtext, nicht der Vorschlag; die Kunden sind im Schnitt über
50. Zeilenlänge auf 68 Zeichen begrenzt (`max-width: 68ch`).

**Die Seillinie.** Eine 2 px starke senkrechte Linie in Orange läuft am linken
Rand durch die gesamte Seite (`body::before`), an jedem Abschnittsbeginn sitzt
ein 9-px-Quadrat um 45 Grad gedreht (`.abschnitt::before`). Das ist das eine
mutige Element – solange es da ist, braucht die Seite keine Farbverläufe, keine
Scroll-Animationen, keine Icon-Kacheln und keine Schlagschatten. Jede
zusätzliche Idee schwächt die eine, die trägt.

**Verbotsliste.** Stockfotos mit Klemmbrett; drei gleich hohe abgerundete Karten
mit Schlagschatten nebeneinander; Farbverläufe; Icon-Bibliothek-Symbole für
alles; Überschriften wie „Ihr zuverlässiger Partner rund um Haus und Garten";
hochzählende Zähler; Zitat-Karussells ohne Namen und Ort; zentrierter Text
außerhalb des Hero.

**Technik.** Kein JavaScript – die Fragen klappen mit `<details>` auf, das Menü
über einen versteckten Checkbox-Schalter. Hosting bei Netlify, Cloudflare Pages
oder Hetzner, unter 5 € im Monat, Server in der EU. Ziele: LCP unter 2,0 s im
Mobilfunknetz, Gesamtseite unter 800 kB, CLS unter 0,1, PageSpeed Insights über
90 mobil – vor jedem Veröffentlichen prüfen.

**Bedienbarkeit.** Telefonnummer als `tel:`-Link, alle Schaltflächen mindestens
48 × 48 px, sichtbarer Fokusrahmen, fixierte Anrufleiste unten nur auf
Mobilgeräten, kein Text unter 16 px, `prefers-reduced-motion` respektiert.
All das ist im Stylesheet bereits umgesetzt.

---

## Abarbeiten

Punkte 1 bis 23 sind Pflicht, alles darüber hinaus ist Verbesserung im
laufenden Betrieb. Die Reihenfolge ist wichtiger als die Vollständigkeit.

**Vorbereitung**
1. Domain registrieren, Hosting einrichten, HTTPS prüfen
2. E-Mail-Adresse auf eigener Domain anlegen
3. Firmierung, Anschrift und Telefonnummer schriftlich festlegen (NAP)
4. Ortsliste des Einsatzgebiets erstellen, 8–15 Gemeinden
5. Preisspannen je Leistung festlegen

**Material**
6. Fotos machen: Hero, Portrait, Steilgelände, Detail, Aufräumen
7. Bilder zuschneiden, in WebP umwandeln, Größen prüfen
8. Teilbild 1200 × 630 px anlegen
9. Alle Texte in einer Datei vorschreiben, bevor gebaut wird
10. Schriften herunterladen, in WOFF2 umwandeln, lokal ablegen

**Bau** — Punkte 11 bis 16 sind mit diesem Stand erledigt
11. ✅ Grundgerüst HTML mit allen Abschnitten in richtiger Reihenfolge
12. ✅ Farbwerte und Größenstaffel als CSS-Variablen anlegen
13. ✅ Abschnitte gestalten, Flächenwechsel hell/dunkel einhalten
14. ✅ Seillinie mit Knotenpunkten einbauen
15. ✅ Mobile Ansicht prüfen, fixierte Anrufleiste ergänzen
16. ✅ Fragen-Abschnitt mit `<details>`, ohne JavaScript

**Technik**
17. ✅ Alle Metadaten aus Abschnitt 08 einsetzen — Platzhalter noch ersetzen
18. ✅ JSON-LD aus Abschnitt 09 einsetzen — mit Rich-Results-Test prüfen
19. Cal.com einrichten, Zeitfenster und Pufferzeiten setzen, einbetten
20. Umami oder Plausible einbinden, Ereignisse anlegen
21. Favicon-Satz erzeugen und einbinden
22. PageSpeed Insights: über 90 mobil, sonst Bilder nachbessern

**Recht und Start**
23. ✅ Impressum und Datenschutzerklärung erstellt und verlinkt — Inhalte ergänzen
24. Prüfen: keine externen Schriften, keine eingebettete Karte ohne Einwilligung
25. Google-Unternehmensprofil anlegen, NAP zeichengleich, Fotos hochladen
26. Domain in Google Search Console eintragen, Seite zur Indexierung melden
27. QR-Code auf die Startseite erzeugen, Größe min. 25 mm, testen
28. Flyer drucken, 200 Stück, matt

**Nach vier Wochen**
29. Herkunft jeder Anfrage in einer Tabelle festhalten
30. Scrolltiefe prüfen: bricht die Mehrheit vor den Leistungen ab, Hero kürzen
31. Nach jedem abgeschlossenen Auftrag um eine Google-Bewertung bitten
32. Referenzabschnitt mit den ersten drei echten Objekten ergänzen

---

Alle Preisangaben und Rechtsverweise im Bauplan sind Orientierungswerte,
Stand August 2026. Impressums- und Datenschutzpflichten im Zweifel anwaltlich
prüfen lassen.
