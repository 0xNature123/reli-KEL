"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export function TeilenLink({ url }: { url: string }) {
  const [kopiert, setKopiert] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        readOnly
        value={url}
        aria-label="Link zum Bericht"
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 min-w-[240px] min-h-[48px] px-3 rounded-[10px] bg-white text-[15px]
                   border border-[var(--gray-200)]"
      />
      <Button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setKopiert(true);
            window.setTimeout(() => setKopiert(false), 2500);
          } catch {
            // Kein Zugriff auf die Zwischenablage: der Nutzer markiert den Text selbst.
          }
        }}
      >
        {kopiert ? "Kopiert" : "Link kopieren"}
      </Button>
    </div>
  );
}
