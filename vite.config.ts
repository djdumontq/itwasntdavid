import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "admin-redirect",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/admin" || req.url === "/admin/") {
            res.writeHead(302, { Location: "/admin/index.html" });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
});
