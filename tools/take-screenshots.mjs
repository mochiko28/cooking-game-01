import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const shots = JSON.parse(await readFile(new URL('../shots.json', import.meta.url), 'utf8'));
const output = new URL('../screenshots/', import.meta.url);
const work = await mkdtemp(join(tmpdir(), 'lantern-shots-'));
const cache = join(work, 'cache');
const config = join(work, 'config');
await Promise.all([mkdir(cache), mkdir(config), mkdir(output, { recursive: true })]);
const env = {
  ...process.env, XDG_CACHE_HOME: cache, XDG_CONFIG_HOME: config, MOZ_CRASHREPORTER_DISABLE: '1',
};
if (process.env.CODEX_SANDBOX_NETWORK_DISABLED === '1') env.MOZ_DISABLE_CONTENT_SANDBOX ??= '1';

if (!env.FONTCONFIG_FILE && !(await stat('/etc/fonts/fonts.conf').catch(() => null))) {
  env.FONTCONFIG_FILE = join(config, 'fonts.conf');
  await writeFile(env.FONTCONFIG_FILE, `<?xml version="1.0"?>
<fontconfig>
  <dir>/usr/share/fonts</dir>
  <cachedir>${cache}/fontconfig</cachedir>
  <alias><family>sans-serif</family><prefer><family>Adwaita Sans</family></prefer></alias>
  <alias><family>serif</family><prefer><family>FreeSerif</family></prefer></alias>
  <alias><family>monospace</family><prefer><family>Adwaita Mono</family></prefer></alias>
</fontconfig>`);
}

async function renderScreenshot(shot, profile, image) {
  const page = new URL('../game/index.html' + shot.query, import.meta.url);
  const browser = spawn(process.env.FIREFOX || 'firefox', [
    '--headless', '--no-remote', '--profile', profile,
    '--screenshot', image, '--window-size=1280,800', page.href,
  ], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  let finished;
  browser.stdout.on('data', chunk => { log += chunk; });
  browser.stderr.on('data', chunk => { log += chunk; });
  const closed = new Promise(resolve => {
    browser.once('close', code => { finished = code; resolve(); });
    browser.once('error', error => { log += error.message; finished = -1; resolve(); });
  });

  try {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      const bytes = await readFile(image).catch(() => null);
      if (bytes?.subarray(-8, -4).toString() === 'IEND') {
        const errors = log.split('\n').filter(line => /JavaScript (error|warning)|Error loading|console\.error/i.test(line));
        if (errors.length) throw new Error(errors.join('\n'));
        return bytes;
      }
      if (finished !== undefined && finished !== 0) break;
      await delay(100);
    }
    throw new Error(`Firefox did not render ${shot.name}\n${log}`);
  } finally {
    await Promise.race([closed, delay(250)]);
    if (finished === undefined) browser.kill('SIGTERM');
    await Promise.race([closed, delay(1200)]);
    if (finished === undefined) browser.kill('SIGKILL');
  }
}

try {
  for (const shot of shots) {
    const profile = join(work, shot.name + '-profile');
    const screenshot = join(work, shot.name + '.png');
    await mkdir(profile);
    await writeFile(join(profile, 'user.js'), `user_pref("security.fileuri.strict_origin_policy", false);
user_pref("privacy.file_unique_origin", false);
user_pref("layout.css.devPixelsPerPx", "1.0");
user_pref("devtools.console.stdout.content", true);
`);
    const png = await renderScreenshot(shot, profile, screenshot);
    if (png.readUInt32BE(16) !== 1280 || png.readUInt32BE(20) !== 800 || png.length < 20000) {
      throw new Error(`Unexpected browser render for ${shot.name}`);
    }
    let jpeg;
    for (const quality of [3, 4, 5, 7]) {
      const encoded = spawnSync('ffmpeg', [
        '-v', 'error', '-threads', '1', '-i', screenshot, '-frames:v', '1',
        '-threads', '1', '-codec:v', 'mjpeg', '-q:v', String(quality), '-f', 'image2pipe', 'pipe:1',
      ]);
      if (encoded.status !== 0) throw new Error(encoded.error?.message ?? encoded.stderr.toString());
      jpeg = encoded.stdout;
      if (jpeg.length <= 256 * 1024) break;
    }
    if (jpeg.length > 256 * 1024) throw new Error(`${shot.name} exceeds the screenshot budget`);
    await writeFile(new URL(shot.name, output), jpeg);
    console.log(`${shot.name} 1280 × 800 · ${jpeg.length} bytes`);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
