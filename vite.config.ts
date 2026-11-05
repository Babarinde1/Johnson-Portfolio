import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const site = env.VITE_SITE_URL?.replace(/\/$/, "");
  return {
    plugins: [
      react(),
      {
        // Absolute URLs for canonical and share tags are only added when VITE_SITE_URL is set.
        name: "site-url-tags",
        transformIndexHtml(html: string) {
          if (!site) return html;
          const tags = [
            `<link rel="canonical" href="${site}/" />`,
            `<meta property="og:url" content="${site}/" />`,
            `<meta property="og:image" content="${site}/og-image.png" />`,
            `<meta name="twitter:image" content="${site}/og-image.png" />`,
          ].join("\n    ");
          return html.replace("</head>", `  ${tags}\n  </head>`);
        },
      },
    ],
    define: {
      // The resume download is only shown if the PDF really exists.
      __HAS_RESUME__: JSON.stringify(fs.existsSync(path.resolve("public/Johnson-Pedia-Resume.pdf"))),
      // The About page shows a real photo only if public/portrait.jpg exists.
      __HAS_PORTRAIT__: JSON.stringify(fs.existsSync(path.resolve("public/portrait.jpg"))),
    },
  };
});
