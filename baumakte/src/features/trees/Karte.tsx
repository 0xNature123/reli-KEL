"use client";

import maplibregl, { type Map as MlMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

export interface KartenBaum {
  id: string;
  number: string;
  lat: number;
  lng: number;
  /** grau = nie kontrolliert, violett = kontrolliert, rot = offene Sofortmassnahme */
  status: "neu" | "kontrolliert" | "sofort";
}

/** OSM-Rasterkacheln. DSGVO-unkritisch, kostenlos, offline cachebar. */
const STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap-Mitwirkende",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const FARBE: Record<KartenBaum["status"], string> = {
  neu: "#5F6675",
  kontrolliert: "#6D4AFF",
  sofort: "#B3261E",
};

export function Karte({
  center,
  trees,
  onSelect,
  onMove,
}: {
  center: [number, number];
  trees: KartenBaum[];
  onSelect?: (id: string) => void;
  /** Meldet die Kartenmitte - fuer den Fadenkreuz-Modus beim Setzen eines Baums. */
  onMove?: (lng: number, lat: number) => void;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<MlMap | null>(null);
  const marker = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!box.current || map.current) return;

    const m = new maplibregl.Map({
      container: box.current,
      style: STYLE,
      center,
      zoom: 17,
      attributionControl: { compact: true },
    });

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: true,
      }),
      "top-right",
    );

    if (onMove) {
      m.on("move", () => {
        const c = m.getCenter();
        onMove(c.lng, c.lat);
      });
    }

    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // Absichtlich nur beim Aufbau: die Karte wird danach ueber Marker aktualisiert.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;

    marker.current.forEach((mk) => mk.remove());
    marker.current = trees.map((t) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `Baum ${t.number}`);
      el.style.cssText = [
        "width:26px;height:26px;border-radius:999px;cursor:pointer",
        `background:${FARBE[t.status]}`,
        t.status === "sofort" ? "border:3px solid #B3261E" : "border:2px solid #FFFFFF",
        "box-shadow:0 1px 3px rgba(10,11,15,.4)",
      ].join(";");
      el.addEventListener("click", () => onSelect?.(t.id));

      return new maplibregl.Marker({ element: el }).setLngLat([t.lng, t.lat]).addTo(m);
    });
  }, [trees, onSelect]);

  return <div ref={box} className="w-full h-full" role="application" aria-label="Baumkarte" />;
}
