import path from 'path';
import { createReadStream, existsSync, statSync } from 'fs';
import { defineConfig } from '@lark-apaas/fullstack-vite-preset';

const PROD_APP_BASE = '/app/app_4keh7ayxruzk1/';
const DIST_CLIENT_DIR = path.resolve(__dirname, 'dist/client');
const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? PROD_APP_BASE : '/',
  plugins: [
    {
      name: 'dev-client-route-alias',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (!req.url) {
            next();
            return;
          }

          const requestUrl = new URL(req.url, 'http://localhost');
          const pathname = requestUrl.pathname;

          if (pathname.startsWith(PROD_APP_BASE)) {
            const relativePath = decodeURIComponent(pathname.slice(PROD_APP_BASE.length));
            const filePath = path.resolve(DIST_CLIENT_DIR, relativePath);

            if (filePath.startsWith(DIST_CLIENT_DIR) && existsSync(filePath) && statSync(filePath).isFile()) {
              const contentType = CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream';
              _res.statusCode = 200;
              _res.setHeader('Content-Type', contentType);
              _res.setHeader('Cache-Control', 'no-cache');
              createReadStream(filePath).pipe(_res);
              return;
            }

            next();
            return;
          }

          if (pathname === '/' || pathname === '/app' || pathname.startsWith('/app/')) {
            const suffix = pathname === '/' ? '/' : pathname.slice('/app'.length) || '/';
            req.url = suffix === '/' ? `/client/${requestUrl.search}` : `/client${suffix}${requestUrl.search}`;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
});



