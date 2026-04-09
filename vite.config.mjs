import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const certPath = path.join(process.cwd(), 'certs');
const hasCerts = fs.existsSync(path.join(certPath, 'cert.pem'));

export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: hasCerts ? {
      key: fs.readFileSync(path.join(certPath, 'key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
    } : false,
  },
  define: {
    'process.env.VITE_MOCK_MODE': JSON.stringify(process.env.VITE_MOCK_MODE || 'true'),
  },
});
