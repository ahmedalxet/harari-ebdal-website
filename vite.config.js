import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".jsx"],
  },
  // Configure for local development
  server: {
    port: 5173,
    // Option 1: Proxy to your deployed Vercel functions (replace with your domain)
    // proxy: {
    //   '/api': {
    //     target: 'https://your-app.vercel.app',
    //     changeOrigin: true,
    //     secure: true
    //   }
    // }

    // Option 2: Use local server.js for development (current setup)
    ...(process.env.NODE_ENV === "development" && {
      proxy: {
        "/api": {
          target: "http://localhost:4000",
          changeOrigin: true,
          secure: false,
        },
      },
    }),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
