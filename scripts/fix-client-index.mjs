import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distClient = path.join(root, 'dist', 'client');
const assetsDir = path.join(distClient, 'assets');
const appBase = '/app/app_4keh7ayxruzk1/';

function newestFile(pattern) {
  const files = fs
    .readdirSync(assetsDir)
    .filter((name) => pattern.test(name))
    .map((name) => {
      const filePath = path.join(assetsDir, name);
      return { name, mtime: fs.statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  if (!files[0]) {
    throw new Error(`No asset matched ${pattern}`);
  }
  return files[0].name;
}

const jsFile = newestFile(/^index-.+\.js$/);
const cssFile = newestFile(/^index-(?!.*\.legacy\.css$).+\.css$/);
const polyfillPath = path.join(distClient, 'polyfills.js');
const hasPolyfill = fs.existsSync(polyfillPath);

const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="{{appAvatar}}">
  <title>{{appName}}</title>
  <script>
    try {
      window.__platform__ = JSON.parse('{{{__platform__}}}');
      window.__platform_data__ = window.__platform__;
    } catch (e) {
      window.__platform__ = {};
      window.__platform_data__ = {};
      console.error('Failed to parse __platform__', e);
    }
  </script>
  <link rel="stylesheet" href="${appBase}assets/${cssFile}">
  ${hasPolyfill ? `<script src="${appBase}polyfills.js"></script>` : ''}
  <script type="module" src="${appBase}assets/${jsFile}"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;

fs.writeFileSync(path.join(distClient, 'index.html'), html);
console.log(`Wrote dist/client/index.html with ${jsFile} and ${cssFile}`);
