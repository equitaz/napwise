import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: deploys to Netlify as plain files, Capacitor-wrappable later.
  output: "export",
  // A stray lockfile above this directory otherwise makes Next guess the
  // wrong workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
