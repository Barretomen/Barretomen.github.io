const WORLD = document.getElementById("world");
const player = document.getElementById("player");
const sprite = document.getElementById("playerSprite");
const hint = document.getElementById("interactionHint");
const overlay = document.getElementById("overlay");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const boat = document.getElementById("boat");
const boatPlayer = document.getElementById("boatPlayer");
const contactContent = document.getElementById("contactContent");
const bridge = document.querySelector(".bridge");

const state = {
  x: innerWidth * .5,
  y: 650,
  speed: 250,
  moving: false,
  dir: "down",
  near: null,
  modal: false,
  boatStatus: "docked", // docked | sailing | away | returning
};

const keys = new Set();
const spriteMap = {
  down:       ["assets/player_down.gif",       "assets/player_down_idle.png"],
  down_left:  ["assets/player_down_left.gif",  "assets/player_down_left_idle.png"],
  down_right: ["assets/player_down_right.gif", "assets/player_down_right_idle.png"],
  up:         ["assets/player_up.gif",         "assets/player_up_idle.png"],
  up_left:    ["assets/player_up_left.gif",    "assets/player_up_left_idle.png"],
  up_right:   ["assets/player_up_right.gif",   "assets/player_up_right_idle.png"],
  left:       ["assets/player_left.gif",       "assets/player_left_idle.png"],
  right:      ["assets/player_right.gif",      "assets/player_right_idle.png"],
};

let last = performance.now();
let modalCooldown = 0;
let boatTimer = null;
let contactTimer = null;
let blockedTimer = null;
let isTeleporting = false;

let currentProjectPage = 1;
const PROJECTS_PER_PAGE = 6;

const PROJECTS_DATA = [
  {
    title: "Palácio do Gelo PWA",
    type: "PWA · JAVASCRIPT",
    desc: "Guia instalável para pesquisa de lojas, serviços, mapas e referências dentro do shopping.",
    github: "https://github.com/Barretomen/palacio-gelo-guia",
    live: "https://barretomen.github.io/palacio-gelo-guia/"
  },
  {
    title: "Security Shift Manager",
    type: "JAVASCRIPT · FIREBASE · PWA",
    desc: "Planeador de escalas 2×2 e registo de exceções com funcionamento 100% offline e sincronização no Firebase Cloud.",
    github: "https://github.com/Barretomen/security-shift",
    live: "https://barretomen.github.io/security-shift/"
  },
  {
    title: "Machados Consulting",
    type: "SITE COMERCIAL · SERVIÇOS",
    desc: "Presença digital para serviços de contabilidade, apoio a IRS, confirmações e fiscalidade.",
    github: "https://github.com/Barretomen/Consulting-machado",
    live: "https://barretomen.github.io/Consulting-machado/"
  },
  {
    title: "Estrela Vape",
    type: "SITE COMERCIAL · LOJA",
    desc: "Montra digital com galeria por categorias, horário de funcionamento adaptado ao fuso de Portugal e contactos.",
    github: "https://github.com/Barretomen/estrela-vape-site",
    live: "https://barretomen.github.io/estrela-vape-site/"
  },
  {
    title: "BarretoTech E-Commerce",
    type: "SITE COMERCIAL · E-COMMERCE UI",
    desc: "Interface interativa para loja de periféricos e acessórios de tecnologia com tabela comparativa de preços.",
    github: "https://github.com/Barretomen/barretotech-ecommerce",
    live: "https://barretomen.github.io/barretotech-ecommerce/"
  },
  {
    title: "Slack 8×8 Autofill",
    type: "CHROME MV3 · AUTOMAÇÃO",
    desc: "Automação para reduzir cópia manual de dados e identificadores entre ferramentas operacionais.",
    github: "https://github.com/Barretomen/slack-8x8-autofill",
    live: null
  },
  {
    title: "METAZA Photo",
    type: "PYTHON · FLASK · PILLOW",
    desc: "Preparação e tratamento de fotografias para gravação, com retoque de tons, recorte e exportação em 353 dpi.",
    github: "https://github.com/Barretomen/metaza-photo",
    live: null
  },
  {
    title: "Dofus Window Manager",
    type: "C# · .NET 8 · WINDOWS FORMS",
    desc: "Aplicação Windows para detetar janelas ativas e alternar entre elas instantaneamente usando atalhos globais.",
    github: "https://github.com/Barretomen/dofus-window-manager",
    live: null
  },
  {
    title: "Gerador Visual de Scripts",
    type: "ELECTRON · JAVASCRIPT · LUA",
    desc: "Editor visual que transforma regras, filtros e perfis configurados graficamente em código Lua.",
    github: "https://github.com/Barretomen/lua-script-generator",
    live: null
  },
  {
    title: "Gopuff Command Suite",
    type: "CHROME MV3 · TAMPERMONKEY",
    desc: "Ferramentas integradas ao navegador com injeção DOM para aceleração de suporte ao cliente e preenchimento de tickets.",
    github: "https://github.com/Barretomen/gopuff-command-suite",
    live: null
  }
];

function seaTop() {
  return document.querySelector(".sea-zone").offsetTop;
}
function boardingPoint() {
  return { x: innerWidth / 2, y: seaTop() + 72 };
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function setSprite(dir, moving) {
  if (!spriteMap[dir]) dir = "down";
  const wanted = spriteMap[dir][moving ? 0 : 1];
  if (sprite.dataset.src !== wanted) {
    sprite.src = wanted;
    sprite.dataset.src = wanted;
  }
  sprite.style.transform = "none";
}

function houseDoorPoint(house) {
  const r = house.getBoundingClientRect();
  return { x: r.left + r.width / 2 + scrollX, y: r.bottom + scrollY - 6 };
}

function flashBlocked(text) {
  hint.textContent = text;
  hint.classList.add("blocked");
  clearTimeout(blockedTimer);
  blockedTimer = setTimeout(() => hint.classList.remove("blocked"), 1100);
}

function detectNear() {
  if (state.boatStatus !== "docked") {
    state.near = null;
    return;
  }

  let best = null, bd = Infinity;
  document.querySelectorAll(".house").forEach(h => {
    const p = houseDoorPoint(h);
    const d = Math.hypot(state.x - p.x, state.y - p.y);
    h.classList.toggle("near", d < 110);
    if (d < 110 && d < bd) {
      best = { type: "house", el: h, section: h.dataset.section, label: h.querySelector(".sign b").textContent };
      bd = d;
    }
  });

  const p = boardingPoint();
  const boatDist = Math.hypot(state.x - p.x, state.y - p.y);
  if (boatDist < 125 && boatDist < bd) {
    best = { type: "boat", label: "BARCO" };
  }

  state.near = best;
  if (best?.type === "house") hint.textContent = `ENTER OU CLIQUE → ${best.label}`;
  else if (best?.type === "boat") hint.textContent = "CLIQUE OU ENTER → EMBARCAR NO BARCO";
  else hint.textContent = "Explore o mapa com WASD / Setas ou clique para mover.";
}

function isBridgePosition(x, y) {
  const halfWidth = 130;
  return Math.abs(x - innerWidth / 2) <= halfWidth &&
         y >= seaTop() - 150 &&
         y <= seaTop() + 105;
}
function validTeleport(x, y) {
  if (y < seaTop() - 8) return true;
  return isBridgePosition(x, y);
}

function teleport(x, y, instant = false, callback = null) {
  if (state.modal || state.boatStatus !== "docked") return false;
  if (!validTeleport(x, y)) {
    flashBlocked("O MAR ESTÁ BLOQUEADO — USE O BARCO NO PÍER.");
    return false;
  }

  const targetX = clamp(x, 36, innerWidth - 36);
  const targetY = clamp(y, 90, seaTop() + 105);

  if (instant) {
    state.x = targetX;
    state.y = targetY;
    player.style.left = state.x + "px";
    player.style.top = state.y + "px";
    setSprite(state.dir, false);
    detectNear();
    cameraFollow();
    if (callback) callback();
    return true;
  }

  if (isTeleporting) return false;
  isTeleporting = true;

  // Smooth fade-out ("suma devagarinho")
  player.style.transition = "opacity 0.2s ease-out";
  player.style.opacity = "0";

  setTimeout(() => {
    state.x = targetX;
    state.y = targetY;
    player.style.left = state.x + "px";
    player.style.top = state.y + "px";
    setSprite(state.dir, false);
    detectNear();
    cameraFollow();

    // Smooth fade-in ("apareca")
    player.style.opacity = "1";

    setTimeout(() => {
      player.style.transition = "";
      isTeleporting = false;
      if (callback) callback();
    }, 200);
  }, 200);

  return true;
}

function movementBounds(nx, ny) {
  nx = clamp(nx, 36, innerWidth - 36);
  ny = clamp(ny, 90, seaTop() + 105);

  if (ny >= seaTop() - 8 && !isBridgePosition(nx, ny)) {
    flashBlocked("O MAR ESTÁ BLOQUEADO — FIQUE NO PÍER E USE O BARCO.");
    return [state.x, state.y];
  }
  return [nx, ny];
}

function dirFrom(dx, dy) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < .18 && dy < 0) return "up";
  if (ax < .18 && dy > 0) return "down";
  if (ay < .18 && dx > 0) return "right";
  if (ay < .18 && dx < 0) return "left";
  if (dx > 0 && dy < 0) return "up_right";
  if (dx < 0 && dy < 0) return "up_left";
  if (dx > 0 && dy > 0) return "down_right";
  return "down_left";
}

function renderProjectsPage(page) {
  const grid = modalContent.querySelector("#projectsGrid");
  const prevBtn = modalContent.querySelector("#prevPageBtn");
  const nextBtn = modalContent.querySelector("#nextPageBtn");
  const numbersContainer = modalContent.querySelector("#pageNumbers");

  if (!grid || !numbersContainer) return;

  const totalPages = Math.ceil(PROJECTS_DATA.length / PROJECTS_PER_PAGE);
  currentProjectPage = clamp(page, 1, totalPages);

  const startIdx = (currentProjectPage - 1) * PROJECTS_PER_PAGE;
  const endIdx = startIdx + PROJECTS_PER_PAGE;
  const pageProjects = PROJECTS_DATA.slice(startIdx, endIdx);

  grid.innerHTML = "";
  pageProjects.forEach(proj => {
    const article = document.createElement("article");

    let actionsHTML = "";
    if (proj.github) {
      actionsHTML += `<a href="${proj.github}" target="_blank" class="btn-code">VER CÓDIGO ↗</a>`;
    }
    if (proj.live) {
      actionsHTML += `<a href="${proj.live}" target="_blank" class="btn-live">VER SITE LIVE ↗</a>`;
    }

    article.innerHTML = `
      <span>${proj.type}</span>
      <h3>${proj.title}</h3>
      <p>${proj.desc}</p>
      <div class="project-actions">
        ${actionsHTML}
      </div>
    `;
    grid.appendChild(article);
  });

  numbersContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `page-num ${i === currentProjectPage ? "active" : ""}`;
    btn.textContent = i;
    btn.addEventListener("click", () => renderProjectsPage(i));
    numbersContainer.appendChild(btn);
  }

  if (prevBtn) {
    prevBtn.disabled = currentProjectPage === 1;
    prevBtn.onclick = () => renderProjectsPage(currentProjectPage - 1);
  }
  if (nextBtn) {
    nextBtn.disabled = currentProjectPage === totalPages;
    nextBtn.onclick = () => renderProjectsPage(currentProjectPage + 1);
  }
}

function openPanel(name) {
  const tpl = document.getElementById(`tpl-${name}`);
  if (!tpl) return;
  modalContent.innerHTML = "";
  modalContent.appendChild(tpl.content.cloneNode(true));
  overlay.classList.remove("hidden");
  state.modal = true;
  keys.clear();
  setSprite(state.dir, false);

  if (name === "projects") {
    currentProjectPage = 1;
    renderProjectsPage(currentProjectPage);
  }

  const backBtn = modalContent.querySelector("#returnPierBtn");
  if (backBtn) backBtn.addEventListener("click", returnBoat);
}

function closePanel() {
  overlay.classList.add("hidden");
  state.modal = false;
  modalCooldown = performance.now() + 250;
}

function interact() {
  if (state.modal) { closePanel(); return; }
  if (!state.near) return;
  if (state.near.type === "house") openPanel(state.near.section);
  else if (state.near.type === "boat") sail();
}

function clearBoatTimer() {
  if (boatTimer) { clearTimeout(boatTimer); boatTimer = null; }
  if (contactTimer) { clearTimeout(contactTimer); contactTimer = null; }
}

function sail() {
  if (state.boatStatus !== "docked") return;
  clearBoatTimer();
  state.boatStatus = "sailing";
  state.near = null;
  keys.clear();

  const p = boardingPoint();
  state.x = p.x; state.y = p.y;
  player.style.left = p.x + "px";
  player.style.top = p.y + "px";
  player.style.opacity = "0";

  contactContent.classList.remove("show");
  boat.classList.remove("returning");
  boat.classList.add("boarded");
  void boat.offsetWidth;
  boat.classList.add("sail");

  hint.textContent = "O BARCO ESTÁ A PARTIR...";
  window.scrollTo({ top: seaTop() + 10, behavior: "smooth" });

  contactTimer = setTimeout(() => {
    contactContent.classList.add("show");
  }, 2200);

  boatTimer = setTimeout(() => {
    state.boatStatus = "away";
    hint.textContent = "MANTENHA-SE EM CONTACTO 👋";
  }, 4800);
}

function returnBoat() {
  if (state.boatStatus === "docked") {
    const p = boardingPoint();
    teleport(p.x, p.y, false);
    return;
  }
  if (state.boatStatus === "returning") return;

  clearBoatTimer();
  state.boatStatus = "returning";
  contactContent.classList.remove("show");
  boat.classList.add("returning");
  boat.classList.remove("sail");

  hint.textContent = "O BARCO ESTÁ A VOLTAR AO PÍER...";
  window.scrollTo({ top: Math.max(0, seaTop() - innerHeight * .55), behavior: "smooth" });

  boatTimer = setTimeout(() => {
    state.boatStatus = "docked";
    boat.classList.remove("returning", "boarded");
    const p = boardingPoint();
    teleport(p.x, p.y, true);
    player.style.opacity = "1";
    setSprite("up", false);
    detectNear();
    cameraFollow();
    hint.textContent = "BARCO ATRACADO — CLIQUE NO BARCO OU PÍER PARA EMBARCAR.";
  }, 4600);
}

function cameraFollow() {
  if (state.boatStatus !== "docked") return;
  const desired = Math.max(0, state.y - innerHeight * .55);
  window.scrollTo({ top: desired, behavior: "auto" });
}

function update(dt) {
  if (state.modal || state.boatStatus !== "docked") return;

  let dx = 0, dy = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) dx--;
  if (keys.has("ArrowRight") || keys.has("d")) dx++;
  if (keys.has("ArrowUp") || keys.has("w")) dy--;
  if (keys.has("ArrowDown") || keys.has("s")) dy++;

  if (dx && dy) { dx *= .707; dy *= .707; }
  state.moving = !!(dx || dy);

  if (state.moving) {
    state.dir = dirFrom(dx, dy);
    const [nx, ny] = movementBounds(
      state.x + dx * state.speed * dt,
      state.y + dy * state.speed * dt
    );
    state.x = nx; state.y = ny;
  }

  player.style.left = state.x + "px";
  player.style.top = state.y + "px";
  setSprite(state.dir, state.moving);
  detectNear();
  cameraFollow();
}

function loop(t) {
  const dt = Math.min(.035, (t - last) / 1000);
  last = t;
  update(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.addEventListener("keydown", e => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(e.key)) e.preventDefault();

  if (e.key === "Escape") {
    if (state.modal) closePanel();
    else if (state.boatStatus === "away" || state.boatStatus === "sailing") returnBoat();
    return;
  }
  if (e.key === "Enter" && performance.now() > modalCooldown) {
    interact();
    return;
  }

  if (state.boatStatus === "docked") {
    keys.add(k);
  }
});
window.addEventListener("keyup", e => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));

document.addEventListener("click", e => {
  if (e.target.closest("#topNav,#overlay,.social,#boat,.house,.bridge,.return-pier")) return;
  const x = e.clientX;
  const y = e.clientY + scrollY;

  teleport(x, y, false);
});

closeModal.addEventListener("click", closePanel);
overlay.addEventListener("click", e => { if (e.target === overlay) closePanel(); });
document.getElementById("helpBtn").addEventListener("click", () => openPanel("help"));

document.querySelectorAll("[data-nav]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  const key = a.dataset.nav;

  if (key === "home") {
    if (state.boatStatus !== "docked") returnBoat();
    setTimeout(() => teleport(innerWidth * .5, 650, false), state.boatStatus === "docked" ? 0 : 4700);
    return;
  }

  if (key === "contact") {
    if (state.boatStatus === "docked") {
      sail();
    } else {
      window.scrollTo({ top: seaTop() + 10, behavior: "smooth" });
    }
    return;
  }

  if (state.boatStatus !== "docked") return;

  const house = document.querySelector(`[data-section="${key}"]`);
  if (house) {
    const p = houseDoorPoint(house);
    teleport(p.x, p.y + 48, false, () => openPanel(key));
  }
}));

document.querySelectorAll(".house").forEach(h => h.addEventListener("click", e => {
  e.stopPropagation();
  if (state.boatStatus !== "docked") return;
  const p = houseDoorPoint(h);
  const section = h.dataset.section;
  teleport(p.x, p.y + 48, false, () => openPanel(section));
}));

bridge.addEventListener("click", e => {
  e.stopPropagation();
  if (state.boatStatus === "away" || state.boatStatus === "sailing") {
    returnBoat();
  } else if (state.boatStatus === "docked") {
    sail();
  }
});

boat.addEventListener("click", e => {
  e.stopPropagation();
  if (state.boatStatus === "docked") {
    sail();
  } else if (state.boatStatus === "away" || state.boatStatus === "sailing") {
    returnBoat();
  }
});

document.addEventListener("click", e => {
  if (e.target.id === "returnPierBtn") returnBoat();
});

window.addEventListener("resize", () => {
  state.x = clamp(state.x, 36, innerWidth - 36);
  if (state.boatStatus === "docked") {
    player.style.left = state.x + "px";
  }
});

setSprite("down", false);
player.style.left = state.x + "px";
player.style.top = state.y + "px";
setTimeout(() => openPanel("help"), 550);
