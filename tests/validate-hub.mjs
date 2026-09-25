import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const docs = path.join(root, 'docs');
const pages = ['index.html','projects/index.html','about/index.html','now/index.html','contact/index.html'];
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'hub/config.js'),'utf8'),sandbox);
const config = sandbox.window.JOAO_HUB_CONFIG;
let links = 0;
for (const page of pages) {
  const file = path.join(docs,'hub',page);
  const html = fs.readFileSync(file,'utf8');
  assert.equal(html,fs.readFileSync(path.join(root,'hub',page),'utf8'),`Mirror differs: ${page}`);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /rel="canonical"/);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    let target = href.startsWith('/') ? path.join(docs,href) : path.resolve(path.dirname(file),href);
    if (href.endsWith('/')) target = path.join(target,'index.html');
    assert.ok(fs.existsSync(target),`${page}: missing ${href}`);
    links++;
  }
}
for (const file of ['app.js','config.js','home.css','motion.js','internal.css','internal-motion.js','styles.css','portfolio.css','english-theme.css','vendor/gsap.min.js','vendor/ScrollTrigger.min.js','vendor/lenis.min.js']) {
  assert.equal(fs.readFileSync(path.join(root,'hub',file),'utf8'),fs.readFileSync(path.join(docs,'hub',file),'utf8'),`Mirror differs: ${file}`);
}
const home = fs.readFileSync(path.join(root,'hub/index.html'),'utf8');
const archive = fs.readFileSync(path.join(root,'hub/projects/index.html'),'utf8');
for (const p of config.projects) {
  assert.ok(archive.includes(`id="${p.id}"`),`Missing static case: ${p.id}`);
  assert.ok(archive.includes(`aria-labelledby="title-${p.id}"`),`Invalid case label: ${p.id}`);
  if(p.featured) assert.ok(home.includes(`id="featured-${p.id}"`),`Missing static featured: ${p.id}`);
}
assert.equal((home.match(/class="project-panel"/g)||[]).length,config.projects.filter(p=>p.featured).length);
assert.match(home,/og:title/); assert.match(home,/og:description/); assert.match(home,/og:image/);
console.log(`PASS: ${pages.length} pages, ${links} local links/assets, ${config.projects.length} cases, metadata and deployment mirrors.`);
