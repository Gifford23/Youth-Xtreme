import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// ✅ 1. Import the PWA plugin
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // ✅ 2. Configure the PWA
    VitePWA({
      registerType: "autoUpdate", // Updates the app automatically when you deploy new code
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Youth Xtreme",
        short_name: "YX",
        description: "The official app for Youth Xtreme Ministry",
        theme_color: "#1a1a1a", // Matches your bg-brand-dark
        background_color: "#1a1a1a",
        display: "standalone", // Makes it look like a native app (no browser bar)
        orientation: "portrait",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
