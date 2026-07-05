import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Napwise",
    short_name: "Napwise",
    description:
      "The nap app that tells you when not to nap, learns what actually works for you, and never pretends to read your brain.",
    start_url: "/",
    display: "standalone",
    background_color: "#140e08",
    theme_color: "#140e08",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
