import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // o el puerto que estés usando
    headers: {
      // Esta es la línea mágica que permite a Google comunicarse de vuelta
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
})