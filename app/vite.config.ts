// Migration progressive (ticket #3) : chaque écran migré est un « îlot » React monté par l'app actuelle (site/app.js).
// Le build produit un seul module ES minifié, site/react/islands.js, servi tel quel par Vercel (pas d'étape de build en ligne).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../site/react",
    emptyOutDir: true,
    target: "es2020",
    modulePreload: false,
    rollupOptions: {
      input: "src/islands.tsx",
      output: { format: "es", entryFileNames: "islands.js", chunkFileNames: "[name].js", assetFileNames: "[name][extname]" },
      preserveEntrySignatures: false,
    },
  },
});
