import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
   server: {
      proxy: {
         '^/api': {
            target: 'https://localhost:44345/',
            secure: false
         }
      },
      port: 53310,
    }
})