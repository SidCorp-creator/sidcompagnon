// Fond de l'app (fusion, chiffrement…) : un script classique (IIFE) site/react/core.js, sans React, chargé avant app.js.
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../site/react",
    emptyOutDir: false, // islands.js est dans le même dossier
    target: "es2020",
    lib: { entry: "src/core/index.ts", formats: ["iife"], name: "SCCoreBundle", fileName: () => "core.js" },
    minify: "esbuild",
  },
});
