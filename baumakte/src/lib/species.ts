/** Die haeufigsten Baumarten im deutschen Siedlungsraum. Deutscher und botanischer Name. */

export interface Species {
  readonly de: string;
  readonly bot: string;
}

export const SPECIES: readonly Species[] = [
  { de: "Ahorn, Berg-", bot: "Acer pseudoplatanus" },
  { de: "Ahorn, Spitz-", bot: "Acer platanoides" },
  { de: "Ahorn, Feld-", bot: "Acer campestre" },
  { de: "Ahorn, Silber-", bot: "Acer saccharinum" },
  { de: "Ahorn, Eschen-", bot: "Acer negundo" },
  { de: "Apfel, Zier-", bot: "Malus spec." },
  { de: "Baumhasel", bot: "Corylus colurna" },
  { de: "Birke, Sand-", bot: "Betula pendula" },
  { de: "Birne, Zier-", bot: "Pyrus calleryana" },
  { de: "Blauglockenbaum", bot: "Paulownia tomentosa" },
  { de: "Buche, Rot-", bot: "Fagus sylvatica" },
  { de: "Buche, Hain-", bot: "Carpinus betulus" },
  { de: "Douglasie", bot: "Pseudotsuga menziesii" },
  { de: "Eibe", bot: "Taxus baccata" },
  { de: "Eiche, Stiel-", bot: "Quercus robur" },
  { de: "Eiche, Trauben-", bot: "Quercus petraea" },
  { de: "Eiche, Rot-", bot: "Quercus rubra" },
  { de: "Eiche, Sumpf-", bot: "Quercus palustris" },
  { de: "Erle, Schwarz-", bot: "Alnus glutinosa" },
  { de: "Esche, Gemeine", bot: "Fraxinus excelsior" },
  { de: "Fichte, Gemeine", bot: "Picea abies" },
  { de: "Ginkgo", bot: "Ginkgo biloba" },
  { de: "Gleditschie", bot: "Gleditsia triacanthos" },
  { de: "Goetterbaum", bot: "Ailanthus altissima" },
  { de: "Hopfenbuche", bot: "Ostrya carpinifolia" },
  { de: "Kastanie, Ross-", bot: "Aesculus hippocastanum" },
  { de: "Kastanie, Rotbluehende", bot: "Aesculus carnea" },
  { de: "Kiefer, Wald-", bot: "Pinus sylvestris" },
  { de: "Kiefer, Schwarz-", bot: "Pinus nigra" },
  { de: "Kirsche, Vogel-", bot: "Prunus avium" },
  { de: "Kirsche, Zier-", bot: "Prunus serrulata" },
  { de: "Laerche, Europaeische", bot: "Larix decidua" },
  { de: "Linde, Sommer-", bot: "Tilia platyphyllos" },
  { de: "Linde, Winter-", bot: "Tilia cordata" },
  { de: "Linde, Hollaendische", bot: "Tilia x europaea" },
  { de: "Linde, Silber-", bot: "Tilia tomentosa" },
  { de: "Magnolie", bot: "Magnolia spec." },
  { de: "Mammutbaum, Berg-", bot: "Sequoiadendron giganteum" },
  { de: "Mehlbeere", bot: "Sorbus aria" },
  { de: "Nussbaum, Wal-", bot: "Juglans regia" },
  { de: "Pappel, Schwarz-", bot: "Populus nigra" },
  { de: "Pappel, Silber-", bot: "Populus alba" },
  { de: "Pappel, Hybrid-", bot: "Populus x canadensis" },
  { de: "Platane", bot: "Platanus x hispanica" },
  { de: "Robinie", bot: "Robinia pseudoacacia" },
  { de: "Rotdorn", bot: "Crataegus laevigata" },
  { de: "Schnurbaum", bot: "Styphnolobium japonicum" },
  { de: "Silberweide", bot: "Salix alba" },
  { de: "Speierling", bot: "Sorbus domestica" },
  { de: "Tanne, Weiss-", bot: "Abies alba" },
  { de: "Trompetenbaum", bot: "Catalpa bignonioides" },
  { de: "Tulpenbaum", bot: "Liriodendron tulipifera" },
  { de: "Ulme, Feld-", bot: "Ulmus minor" },
  { de: "Ulme, Berg-", bot: "Ulmus glabra" },
  { de: "Vogelbeere", bot: "Sorbus aucuparia" },
  { de: "Weide, Trauer-", bot: "Salix x sepulcralis" },
  { de: "Weide, Bruch-", bot: "Salix fragilis" },
  { de: "Weissdorn", bot: "Crataegus monogyna" },
  { de: "Zeder, Atlas-", bot: "Cedrus atlantica" },
  { de: "Zierkirsche, Blut-Pflaume", bot: "Prunus cerasifera" },
];

export function searchSpecies(query: string, limit = 8): Species[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SPECIES.filter(
    (s) => s.de.toLowerCase().includes(q) || s.bot.toLowerCase().includes(q),
  ).slice(0, limit);
}

export const HEIGHT_CLASSES = ["<5", "5-10", "10-15", "15-20", ">20"] as const;
export type HeightClass = (typeof HEIGHT_CLASSES)[number];
