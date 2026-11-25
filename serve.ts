import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const game = resolve(dirname(fileURLToPath(import.meta.url)), 'game');
const types = new Map([
  ['.html', 'text/html'], ['.css', 'text/css'], ['.js', 'text/javascript'],
]);
const port = Number(process.env.PORT ?? 8080);

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent((request.url ?? '/').split('?')[0]);
    const file = resolve(game, '.' + (pathname === '/' ? '/index.html' : pathname));
    const type = types.get(extname(file));
    if (!file.startsWith(game + sep) || !type || !(await stat(file)).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, '127.0.0.1', () => console.log(`Serving Lantern & Ladle on port ${port}`));
