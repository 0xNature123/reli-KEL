"use client";

import { Chip } from "@/components/Badge";
import { TextArea } from "@/components/Field";
import { FotoAufnahme } from "@/features/photos/FotoAufnahme";
import { AREAS } from "@/lib/fll/catalog";
import type { AreaKey, Findings } from "@/types";
import type { FotoEntwurf } from "./state";

export function Schritt1Befunde({
  findings,
  onChange,
  photos,
  onPhoto,
  onPhotoRemove,
  fotoKontext,
}: {
  findings: Findings;
  onChange: (next: Findings) => void;
  photos: FotoEntwurf[];
  onPhoto: (foto: FotoEntwurf) => void;
  onPhotoRemove: (id: string) => void;
  fotoKontext: { orgId: string; treeId: string; treeNumber: string; inspectorName: string };
}) {
  function setze(key: AreaKey, patch: Partial<Findings[AreaKey]>) {
    onChange({ ...findings, [key]: { ...findings[key], ...patch } });
  }

  function toggleCode(key: AreaKey, code: string) {
    const aktuell = findings[key].codes;
    const codes = aktuell.includes(code)
      ? aktuell.filter((c) => c !== code)
      : [...aktuell, code];
    setze(key, { codes });
  }

  return (
    <div className="space-y-4">
      <p className="text-[var(--gray-500)]">
        Alle Bereiche stehen auf „ohne Befund“. Schalten Sie nur dort um, wo Sie etwas
        gesehen haben.
      </p>

      {AREAS.map((area) => {
        const f = findings[area.key];
        const bereichsFotos = photos.filter((p) => p.area === area.key);

        return (
          <section
            key={area.key}
            className="bg-white rounded-[10px] border border-[var(--gray-200)] p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="min-w-0">
                <h3 className="font-semibold">{area.label}</h3>
                <p className="text-[13px] text-[var(--gray-500)] m-0">{area.hint}</p>
              </div>
            </div>

            <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
              <input
                type="checkbox"
                checked={f.ok}
                onChange={(e) => setze(area.key, { ok: e.target.checked, codes: [] })}
                className="w-6 h-6 accent-[var(--violet-600)]"
              />
              <span className="font-medium">ohne Befund</span>
            </label>

            {!f.ok && (
              <div className="mt-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  {area.findings.map((def) => (
                    <Chip
                      key={def.code}
                      selected={f.codes.includes(def.code)}
                      onClick={() => toggleCode(area.key, def.code)}
                    >
                      {def.label}
                    </Chip>
                  ))}
                </div>

                <TextArea
                  className="mt-3"
                  placeholder="Bemerkung zu diesem Bereich (optional)"
                  value={f.note ?? ""}
                  onChange={(e) => setze(area.key, { note: e.target.value || null })}
                  aria-label={`Bemerkung ${area.label}`}
                />
              </div>
            )}

            <label className="flex items-center gap-3 min-h-[48px] cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={f.not_visible ?? false}
                onChange={(e) => setze(area.key, { not_visible: e.target.checked })}
                className="w-6 h-6 accent-[var(--violet-600)]"
              />
              <span className="text-[15px]">
                nicht einsehbar
                <span className="block text-[13px] text-[var(--gray-500)]">
                  Wird im Bericht vermerkt — eine Luecke, die benannt ist, ist keine Luecke.
                </span>
              </span>
            </label>

            <div className="mt-2">
              <FotoAufnahme
                area={area.key}
                kontext={fotoKontext}
                fotos={bereichsFotos}
                onFoto={onPhoto}
                onEntfernen={onPhotoRemove}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
