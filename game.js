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
const actionPrompt = document.getElementById("actionPrompt");
const joystick = document.getElementById("virtualJoystick");
const joystickKnob = joystick ? joystick.querySelector(".joystick-knob") : null;
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navLinks = document.getElementById("navLinks");

const state = {
  x: 480,
  y: 650,
  speed: 260,
  moving: false,
  dir: "down",
  near: null,
  modal: false,
  boatStatus: "docked", // docked | sailing | away | returning
};

const camera = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
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
  const sea = document.querySelector(".sea-zone");
  return sea ? sea.offsetTop : 2400;
}
function boardingPoint() {
  return { x: 480, y: seaTop() + 72 };
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
  const worldRect = WORLD.getBoundingClientRect();
  return {
    x: (r.left - worldRect.left) + r.width / 2,
    y: (r.bottom - worldRect.top) - 6
  };
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
    updateActionPrompt();
    return;
  }

  let best = null, bd = Infinity;
  document.querySelectorAll(".house").forEach(h => {
    const p = houseDoorPoint(h);
    const d = Math.hypot(state.x - p.x, state.y - p.y);
    h.classList.toggle("near", d < 120);
    if (d < 120 && d < bd) {
      best = { type: "house", el: h, section: h.dataset.section, label: h.querySelector(".sign b").textContent };
      bd = d;
    }
  });

  const p = boardingPoint();
  const boatDist = Math.hypot(state.x - p.x, state.y - p.y);
  if (boatDist < 140 && boatDist < bd) {
    best = { type: "boat", label: "BARCO" };
  }

  state.near = best;
  if (best?.type === "house") hint.textContent = `TOQUE NO BOTÃO OU ENTER → ${best.label}`;
  else if (best?.type === "boat") hint.textContent = "TOQUE NO BOTÃO OU ENTER → EMBARCAR NO BARCO";
  else hint.textContent = "Toque e arraste na tela ou use WASD / Setas para andar.";

  updateActionPrompt();
}

function updateActionPrompt() {
  if (!actionPrompt) return;
  if (state.modal || state.boatStatus !== "docked") {
    actionPrompt.classList.add("hidden");
    return;
  }

  if (state.near?.type === "house") {
    actionPrompt.innerHTML = `<span>🏠</span> ENTRAR: ${state.near.label}`;
    actionPrompt.classList.remove("hidden");
  } else if (state.near?.type === "boat") {
    actionPrompt.innerHTML = `<span>⚓</span> EMBARCAR NO BARCO`;
    actionPrompt.classList.remove("hidden");
  } else {
    actionPrompt.classList.add("hidden");
  }
}

function isBridgePosition(x, y) {
  const halfWidth = 130;
  return Math.abs(x - 480) <= halfWidth &&
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

  const targetX = clamp(x, 36, 960 - 36);
  const targetY = clamp(y, 90, seaTop() + 105);

  if (instant) {
    state.x = targetX;
    state.y = targetY;
    player.style.left = state.x + "px";
    player.style.top = state.y + "px";
    setSprite(state.dir, false);
    detectNear();
    updateCamera(false);
    if (callback) callback();
    return true;
  }

  if (isTeleporting) return false;
  isTeleporting = true;

  player.style.transition = "opacity 0.2s ease-out";
  player.style.opacity = "0";

  setTimeout(() => {
    state.x = targetX;
    state.y = targetY;
    player.style.left = state.x + "px";
    player.style.top = state.y + "px";
    setSprite(state.dir, false);
    detectNear();
    updateCamera(true);

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
  nx = clamp(nx, 36, 960 - 36);
  ny = clamp(ny, 90, seaTop() + 105);

  if (ny >= seaTop() - 8 && !isBridgePosition(nx, ny)) {
    flashBlocked("O MAR ESTÁ BLOQUEADO — FIQUE NO PÍER E USE O BARCO.");
    return [state.x, state.y];
  }
  return [nx, ny];
}

function dirFrom(dx, dy) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < .28 && dy < 0) return "up";
  if (ax < .28 && dy > 0) return "down";
  if (ay < .28 && dx > 0) return "right";
  if (ay < .28 && dx < 0) return "left";
  if (dx > 0 && dy < 0) return "up_right";
  if (dx < 0 && dy < 0) return "up_left";
  if (dx > 0 && dy > 0) return "down_right";
  return "down_left";
}

function updateCamera(smooth = true) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const worldW = 960;
  const worldH = 3400;

  if (state.boatStatus === "away" || state.boatStatus === "sailing") {
    camera.targetX = vw >= worldW ? -(vw - worldW) / 2 : clamp(480 - vw / 2, 0, worldW - vw);
    camera.targetY = seaTop() + 140 - vh * 0.35;
  } else {
    if (vw >= worldW) {
      camera.targetX = -(vw - worldW) / 2;
    } else {
      camera.targetX = clamp(state.x - vw / 2, 0, worldW - vw);
    }

    if (vh >= worldH) {
      camera.targetY = -(vh - worldH) / 2;
    } else {
      camera.targetY = clamp(state.y - vh / 2, 0, worldH - vh);
    }
  }

  if (!smooth) {
    camera.x = camera.targetX;
    camera.y = camera.targetY;
  } else {
    camera.x += (camera.targetX - camera.x) * 0.16;
    camera.y += (camera.targetY - camera.y) * 0.16;
  }

  WORLD.style.transform = `translate3d(${-camera.x.toFixed(2)}px, ${-camera.y.toFixed(2)}px, 0)`;
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
  touchMoveVector = { x: 0, y: 0 };
  touchActive = false;
  if (joystick) joystick.classList.add("hidden");
  setSprite(state.dir, false);
  updateActionPrompt();

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
  updateActionPrompt();
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
  touchMoveVector = { x: 0, y: 0 };
  touchActive = false;
  if (joystick) joystick.classList.add("hidden");

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
  updateActionPrompt();

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

  boatTimer = setTimeout(() => {
    state.boatStatus = "docked";
    boat.classList.remove("returning", "boarded");
    const p = boardingPoint();
    teleport(p.x, p.y, true);
    player.style.opacity = "1";
    setSprite("up", false);
    detectNear();
    updateCamera(true);
    hint.textContent = "BARCO ATRACADO — APROXIME-SE DO PÍER PARA EMBARCAR.";
  }, 4600);
}

/* ===== Touch Drag & Virtual Joystick Navigation ===== */
let touchActive = false;
let touchId = null;
let touchOrigin = { x: 0, y: 0 };
let touchMoveVector = { x: 0, y: 0 };
let touchStartTime = 0;

window.addEventListener("touchstart", e => {
  if (state.modal) return;
  if (e.target.closest("#topNav, #overlay, #actionPrompt, .social, #closeModal, #returnPierBtn")) return;

  const touch = e.touches[0];
  touchId = touch.identifier;
  touchActive = true;
  touchStartTime = performance.now();
  touchOrigin = { x: touch.clientX, y: touch.clientY };
  touchMoveVector = { x: 0, y: 0 };

  if (joystick) {
    joystick.style.left = touchOrigin.x + "px";
    joystick.style.top = touchOrigin.y + "px";
    joystick.classList.remove("hidden");
    if (joystickKnob) joystickKnob.style.transform = "translate(0, 0)";
  }
}, { passive: true });

window.addEventListener("touchmove", e => {
  if (!touchActive) return;
  for (let i = 0; i < e.touches.length; i++) {
    if (e.touches[i].identifier === touchId) {
      const t = e.touches[i];
      const dx = t.clientX - touchOrigin.x;
      const dy = t.clientY - touchOrigin.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        const maxR = 40;
        const clampedDist = Math.min(dist, maxR);
        const nx = dx / dist;
        const ny = dy / dist;

        touchMoveVector = {
          x: nx * (clampedDist / maxR),
          y: ny * (clampedDist / maxR),
        };

        if (joystickKnob) {
          joystickKnob.style.transform = `translate(${nx * clampedDist}px, ${ny * clampedDist}px)`;
        }
      } else {
        touchMoveVector = { x: 0, y: 0 };
        if (joystickKnob) joystickKnob.style.transform = "translate(0, 0)";
      }
      break;
    }
  }
}, { passive: false });

function handleTouchEnd(e) {
  if (!touchActive) return;
  const duration = performance.now() - touchStartTime;

  let tapX = touchOrigin.x;
  let tapY = touchOrigin.y;
  if (e.changedTouches && e.changedTouches[0]) {
    tapX = e.changedTouches[0].clientX;
    tapY = e.changedTouches[0].clientY;
  }

  const dist = Math.hypot(tapX - touchOrigin.x, tapY - touchOrigin.y);

  touchActive = false;
  touchId = null;
  touchMoveVector = { x: 0, y: 0 };

  if (joystick) {
    joystick.classList.add("hidden");
    if (joystickKnob) joystickKnob.style.transform = "translate(0, 0)";
  }

  // Quick tap: handle tap interaction
  if (duration < 300 && dist < 15) {
    handleScreenTap(tapX, tapY);
  }
}

window.addEventListener("touchend", handleTouchEnd, { passive: true });
window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

function handleScreenTap(screenX, screenY) {
  if (state.modal) return;
  const worldX = screenX + camera.x;
  const worldY = screenY + camera.y;

  // Check if tapped a house
  let interacted = false;
  document.querySelectorAll(".house").forEach(h => {
    const r = h.getBoundingClientRect();
    if (screenX >= r.left && screenX <= r.right && screenY >= r.top && screenY <= r.bottom) {
      interacted = true;
      openPanel(h.dataset.section);
    }
  });

  if (interacted) return;

  // Check if tapped boat
  const bRect = boat.getBoundingClientRect();
  if (screenX >= bRect.left && screenX <= bRect.right && screenY >= bRect.top && screenY <= bRect.bottom) {
    if (state.boatStatus === "docked") sail();
    else if (state.boatStatus === "away" || state.boatStatus === "sailing") returnBoat();
    return;
  }

  // Otherwise teleport / move to clicked point
  teleport(worldX, worldY, false);
}

document.addEventListener("click", e => {
  if (e.target.closest("#topNav,#overlay,.social,#boat,.house,.bridge,.return-pier,#actionPrompt")) return;
  handleScreenTap(e.clientX, e.clientY);
});

if (actionPrompt) {
  actionPrompt.addEventListener("click", e => {
    e.stopPropagation();
    interact();
  });
}

function update(dt) {
  if (state.modal) return;

  let dx = 0, dy = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) dx--;
  if (keys.has("ArrowRight") || keys.has("d")) dx++;
  if (keys.has("ArrowUp") || keys.has("w")) dy--;
  if (keys.has("ArrowDown") || keys.has("s")) dy++;

  if (touchActive && (touchMoveVector.x !== 0 || touchMoveVector.y !== 0)) {
    dx = touchMoveVector.x;
    dy = touchMoveVector.y;
  } else if (dx && dy) {
    dx *= .707;
    dy *= .707;
  }

  state.moving = !!(dx || dy);

  if (state.moving && state.boatStatus === "docked") {
    state.dir = dirFrom(dx, dy);
    const [nx, ny] = movementBounds(
      state.x + dx * state.speed * dt,
      state.y + dy * state.speed * dt
    );
    state.x = nx;
    state.y = ny;
  }

  player.style.left = state.x + "px";
  player.style.top = state.y + "px";
  setSprite(state.dir, state.moving);
  detectNear();
  updateCamera(true);
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

closeModal.addEventListener("click", closePanel);
overlay.addEventListener("click", e => { if (e.target === overlay) closePanel(); });
document.getElementById("helpBtn").addEventListener("click", () => openPanel("help"));

document.querySelectorAll("[data-nav]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  const key = a.dataset.nav;

  if (key === "home") {
    if (state.boatStatus !== "docked") returnBoat();
    setTimeout(() => teleport(480, 650, false), state.boatStatus === "docked" ? 0 : 4700);
    return;
  }

  if (key === "contact") {
    if (state.boatStatus === "docked") {
      sail();
    } else {
      updateCamera(true);
    }
    return;
  }

  if (state.boatStatus !== "docked") return;

  const house = document.querySelector(`[data-section="${key}"]`);
  if (house) {
    const doorP = houseDoorPoint(house);
    teleport(doorP.x, doorP.y + 48, false, () => openPanel(key));
  }
}));

document.querySelectorAll(".house").forEach(h => h.addEventListener("click", e => {
  e.stopPropagation();
  if (state.boatStatus !== "docked") return;
  const doorP = houseDoorPoint(h);
  const section = h.dataset.section;
  teleport(doorP.x, doorP.y + 48, false, () => openPanel(section));
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
  updateCamera(false);
});
window.addEventListener("orientationchange", () => {
  setTimeout(() => updateCamera(false), 120);
});

/* ===== Mobile Hamburger Navigation ===== */
if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener("click", e => {
    e.stopPropagation();
    navLinks.classList.toggle("mobile-open");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest("#topNav")) {
      navLinks.classList.remove("mobile-open");
    }
  });

  navLinks.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("click", () => navLinks.classList.remove("mobile-open"));
  });
}

setSprite("down", false);
player.style.left = state.x + "px";
player.style.top = state.y + "px";
updateCamera(false);
setTimeout(() => openPanel("help"), 550);
