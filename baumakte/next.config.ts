import type { NextConfig } from "next";

/**
 * Sicherheits-Header. CSP bewusst ohne 'unsafe-eval'.
 * 'unsafe-inline' fuer Styles bleibt noetig, solange Next die kritischen Styles inline setzt.
 * connect-src erlaubt Supabase (Datenbank/Storage) und die OSM-Kachelserver.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://*.tile.openstreetmap.org",
  `connect-src 'self' ${supabaseHost} https://*.tile.openstreetmap.org https://api.stripe.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Die Landingpage ist eine eigenstaendige HTML-Datei ohne Build-Schritt
    // (public/landing/index.html) und wird unter "/" ausgeliefert.
    return [{ source: "/", destination: "/landing/index.html" }];
  },
};

export default nextConfig;
