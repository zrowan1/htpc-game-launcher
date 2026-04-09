import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync(path.join(process.cwd(), 'certs/key.pem')),
      cert: fs.readFileSync(path.join(process.cwd(), 'certs/cert.pem')),
    },
  },
  define: {
    'process.env.VITE_MOCK_MODE': JSON.stringify(process.env.VITE_MOCK_MODE || 'true'),
  },
});
