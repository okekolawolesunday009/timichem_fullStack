import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

<<<<<<< HEAD
// https://vitejs.dev/config/
=======
>>>>>>> c3ceaa1ad1a3dc361c279dad4d50a9aa72da2496
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
<<<<<<< HEAD
    host: '0.0.0.0',
    port: 5173, // optional, since 5173 is default
=======
    host: "0.0.0.0", // <-- This line is essential for Docker
    port: 5173,       // Optional: explicitly define port
>>>>>>> c3ceaa1ad1a3dc361c279dad4d50a9aa72da2496
  },
})
