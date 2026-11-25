import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultDossier = fileURLToPath(new URL('../out/dossier.json', import.meta.url));
const dossierPath = process.argv[2] ? resolve(process.argv[2]) : defaultDossier;
const dossier = JSON.parse(await readFile(dossierPath, 'utf8'));
const entries = [...dossier.text.matchAll(/^### (game\/.+) \(\d+ lines?, (\d+) bytes\)$(?:\n\n(`{3,})[^\n]*\n([\s\S]*?)^\3$)?/gm)];

if (!entries.length) throw new Error(`No sources listed in ${dossierPath}`);
for (const [, path, bytes, , source = ''] of entries) {
  const names = firstDeclarations(extname(path), source);
  console.log(`${path} · ${bytes} bytes${names.length ? ` · ${names.join(', ')}` : ''}`);
}

function firstDeclarations(extension, source) {
  let matches;
  if (extension === '.html') {
    const markup = source.replace(/<!--[\s\S]*?-->/g, '');
    matches = markup.matchAll(/\sid\s*=\s*["']([^"']+)["']/g);
    return Array.from(matches, ([, id]) => `#${id}`).slice(0, 6);
  }
  if (extension === '.css') {
    const stylesheet = source.replace(/\/\*[\s\S]*?\*\//g, '');
    matches = stylesheet.matchAll(/^([^\s{}][^{}]*?)\s*\{/gm);
  } else {
    // Unindented declarations approximate module scope in the game source.
    matches = source.matchAll(/^((?:export\s+(?:default\s+)?)?(?:async\s+)?(?:function\*?|class|const|let|var)\s+[$\w]+)/gm);
  }
  return Array.from(matches, ([, name]) => name.replace(/\s+/g, ' ')).slice(0, 6);
}
