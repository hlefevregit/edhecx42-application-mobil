// scripts/postexport-fix-after-export.js
const fs = require('fs');
const path = require('path');

const BASE_PATH = 'dist';
const REPO_BASE = '/edhecx42-application-mobil'; // ton sous-chemin GitHub Pages
const INDEX = path.join(BASE_PATH, 'index.html');
const F404  = path.join(BASE_PATH, '404.html');

function walk(dir, exts = ['.js', '.css', '.html']) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function ensureNoJekyll() {
  const p = path.join(BASE_PATH, '.nojekyll');
  if (!fs.existsSync(p)) fs.writeFileSync(p, '');
  console.log('Ensured .nojekyll');
}

function makePathsRelative(htmlPath) {
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf8');
  const before = html;
  html = html
    .replace(/(src|href)=\"\/_expo\//g, '$1="./_expo/')
    .replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"');
  if (html !== before) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Made paths relative in', htmlPath);
  } else {
    console.log('Paths already relative in', htmlPath);
  }
}

function injectAssetBase(htmlPath) {
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf8');
  const meta = `<meta name="expo:assetBaseUrl" content="${REPO_BASE}/">`;
  const script = `<script>window.__EXPO_ASSET_BASE_URL="${REPO_BASE}/";</script>`;
  if (!html.includes('expo:assetBaseUrl')) {
    html = html.replace('</head>', `${meta}\n${script}\n</head>`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Injected asset base into', htmlPath);
  } else {
    console.log('Asset base already present in', htmlPath);
  }
}

function rewriteAbsoluteAssetsToRepoBase() {
  const files = walk(BASE_PATH, ['.js', '.css', '.html']);
  const patterns = [
    // "..." or '...' → /assets/...
    { re: /(["'])\/assets\//g, rep: `$1${REPO_BASE}/assets/` },
    // url(/assets/...)
    { re: /url\(\s*\/assets\//g, rep: `url(${REPO_BASE}/assets/` },
  ];
  let count = 0;
  for (const file of files) {
    let txt = fs.readFileSync(file, 'utf8');
    const before = txt;
    for (const { re, rep } of patterns) txt = txt.replace(re, rep);
    if (txt !== before) {
      fs.writeFileSync(file, txt, 'utf8');
      console.log('Rewrote /assets →', REPO_BASE + '/assets in', file);
      count++;
    }
  }
  console.log(`Rewritten assets in ${count} file(s).`);
}

function duplicateIoniconsAndInjectFontFace() {
  const fontsDir = path.join(
    BASE_PATH,
    'assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts'
  );
  if (!fs.existsSync(fontsDir)) {
    console.warn('Fonts dir not found, skip Ionicons patch:', fontsDir);
    return '';
  }
  const files = fs.readdirSync(fontsDir);
  const ioniconsHashed =
    files.find(f => /^Ionicons\.[0-9a-f]{32}\.ttf$/i.test(f)) ||
    files.find(f => /^Ionicons\.[0-9a-f]+\.ttf$/i.test(f)) ||
    files.find(f => /^Ionicons.*\.ttf$/i.test(f));
  if (!ioniconsHashed) {
    console.warn('No Ionicons*.ttf found in', fontsDir, '— skip font duplication');
    return '';
  }
  const src = path.join(fontsDir, ioniconsHashed);
  const dst = path.join(fontsDir, 'Ionicons.ttf');
  try {
    fs.copyFileSync(src, dst);
    console.log('Copied Ionicons:', ioniconsHashed, '-> Ionicons.ttf');
  } catch (e) {
    console.warn('Copy Ionicons failed:', e.message);
  }
  return `
<style>
@font-face {
  font-family: Ionicons;
  src: url('${REPO_BASE}/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
</style>
`;
}

function injectFontFace(htmlPath, cssBlock) {
  if (!fs.existsSync(htmlPath) || !cssBlock) return;
  let html = fs.readFileSync(htmlPath, 'utf8');
  if (!html.includes('font-family: Ionicons')) {
    html = html.replace('</head>', `${cssBlock}</head>`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Injected @font-face into', htmlPath);
  } else {
    console.log('Font-face already present in', htmlPath);
  }
}

function main() {
  ensureNoJekyll();
  if (fs.existsSync(INDEX) && !fs.existsSync(F404)) {
    fs.copyFileSync(INDEX, F404);
    console.log('Copied index.html -> 404.html');
  }
  // 1) base + chemins relatifs
  [INDEX, F404].forEach(injectAssetBase);
  [INDEX, F404].forEach(makePathsRelative);
  // 2) réécriture globale de "/assets/" → "/<repo>/assets/"
  rewriteAbsoluteAssetsToRepoBase();
  // 3) Ionicons (copie + @font-face)
  const css = duplicateIoniconsAndInjectFontFace();
  [INDEX, F404].forEach(p => injectFontFace(p, css));
}

main();