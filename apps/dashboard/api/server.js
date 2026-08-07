import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import serverEntry from '../dist/server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function handler(req, res) {
  const url = req.url;
  
  // Serve static files from dist/client
  if (url.startsWith('/assets/') || url.match(/\.(ico|png|jpg|jpeg|svg|json|txt|webmanifest)$/)) {
    const filePath = join(__dirname, '..', 'dist', 'client', url);
    
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      const ext = url.split('.').pop();
      const contentTypes = {
        'js': 'application/javascript',
        'css': 'text/css',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'webmanifest': 'application/manifest+json',
        'txt': 'text/plain'
      };
      
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(content);
    }
  }

  // Convert Vercel request to Web Request for SSR
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const fullUrl = `${protocol}://${host}${req.url}`;
  
  const request = new Request(fullUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });

  // Call the TanStack Start fetch handler
  const response = await serverEntry.fetch(request);

  // Convert Web Response to Vercel response
  res.status(response.status);
  
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = await response.text();
  res.send(body);
}
