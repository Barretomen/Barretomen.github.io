// Regenerate static content from the same app renderer, then mirror public files.
// Node only; this is a maintenance command, not a production build requirement.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
class Element {
  constructor(tag) { this.tag = tag; this.attrs = {}; this.children = []; this.dataset = {}; }
  set className(value) { this.attrs.class = value; }
  set id(value) { this.attrs.id = value; }
  set href(value) { this.attrs.href = value; }
  set textContent(value) { this.children = [escape(value)]; }
  setAttribute(key, value) { this.attrs[key] = value; }
  append(...items) { this.children.push(...items); }
  html() { const attrs = {...this.attrs, ...Object.fromEntries(Object.entries(this.dataset).map(([k,v]) => ['data-' + k, v]))}; return `<${this.tag}${Object.entries(attrs).map(([k,v])=>` ${k}="${escape(v)}"`).join('')}>${this.children.map(c=>typeof c==='string'?c:c.html()).join('')}</${this.tag}>`; }
}
const sandbox = { window: {}, document: { createElement: tag => new Element(tag) } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'hub/config.js'),'utf8'),sandbox);
const app = fs.readFileSync(path.join(root,'hub/app.js'),'utf8');
const storyStart = app.indexOf('  function projectStory(');
const storyEnd = app.indexOf('  function renderProjects()', storyStart);
vm.runInContext(app.slice(storyStart, storyEnd),sandbox);
vm.runInContext(app.slice(app.indexOf('  function projectCard('), app.indexOf('  function renderFeaturedProjects()')),sandbox);
const projects = sandbox.window.JOAO_HUB_CONFIG.projects.filter(p=>p.featured);
const markup = projects.map((p,i)=>sandbox.projectStory(p,i,projects.length).html()).join('\n');
const homePath = path.join(root,'hub/index.html');
const home = fs.readFileSync(homePath,'utf8');
if (!home.includes('<!-- featured:start -->')) throw new Error('Missing static content markers');
fs.writeFileSync(homePath,home.replace(/<!-- featured:start -->[\s\S]*?<!-- featured:end -->/,`<!-- featured:start -->\n${markup}\n<!-- featured:end -->`));
const archivePath = path.join(root,'hub/projects/index.html');
const archive = fs.readFileSync(archivePath,'utf8');
const cases = sandbox.window.JOAO_HUB_CONFIG.projects.map(p=>sandbox.projectCard(p,false).html()).join('\n');
fs.writeFileSync(archivePath,archive.replace(/<!-- archive:start -->[\s\S]*?<!-- archive:end -->/,`<!-- archive:start -->\n${cases}\n<!-- archive:end -->`));
for (const entry of fs.readdirSync(path.join(root,'hub'),{withFileTypes:true})) {
  if (entry.name === 'wallet' || entry.name === 'README.md') continue;
  fs.cpSync(path.join(root,'hub',entry.name),path.join(root,'docs/hub',entry.name),{recursive:true});
}
console.log(`Generated ${projects.length} static project stories and synchronized docs/hub.`);
