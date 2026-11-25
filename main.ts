import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(destination, { recursive: true });

for (const folder of ['game', 'screenshots']) {
  const source = new URL(`./${folder}/`, import.meta.url);
  cpSync(source, join(destination, folder), { recursive: true });
}

const dossier = buildDossier(destination, {
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
});
writeFileSync(join(destination, 'dossier.json'), dossier);
