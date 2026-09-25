# João Hub Redesign Progress

## Última fase concluída

Fase 12 — redesign das quatro páginas internas e QA final concluídos em 25 de setembro de 2026.

Baseline funcional preservado: `e3516ed796c8c1a89cc79cc1543f8799993a5cdf`.
Branch local de trabalho: `feat/hub-cinematic-scroll`.
Publicação da branch no GitHub autorizada pelo utilizador; commit e push são a etapa final desta fase.

## O que foi implementado

- Home redesenhada como narrativa cinematográfica em seis cenas: Hero, Manifesto, Project Story, Processo, Agora e CTA final.
- Projetos, Sobre, Agora e Contacto redesenhados com o mesmo sistema escuro editorial e composições específicas para cada conteúdo.
- Páginas internas usam entrada coordenada e reveals leves, sem pinning ou scroll suave.
- Identidade escura original preservada: azul profundo, cyan como sinal, branco e cinza azulado.
- Projetos em destaque alimentados por `config.js`, com apresentação pinned no desktop e fluxo vertical no mobile.
- Manifesto tipográfico pinned, timeline do processo e barra de progresso sincronizados ao scroll.
- Lenis integrado ao ticker do GSAP somente em desktop com ponteiro fino.
- `prefers-reduced-motion` remove Lenis, pinning e timelines e mantém todo o conteúdo visível.
- Conteúdo estático de fallback gerado a partir do mesmo `config.js` para Home e arquivo de projetos.
- GSAP 3.15.0, ScrollTrigger 3.15.0 e Lenis 1.3.26 servidos localmente em `hub/vendor/`.
- Arquivos públicos sincronizados de `hub/` para `docs/hub/`, que é a origem real do GitHub Pages.
- Documentação de manutenção, sincronização, dependências e teste atualizada.
- SEO, canonical, Open Graph, skip link, navegação, URLs, WhatsApp, vCard, GitHub API e páginas internas preservados.

## Arquivos modificados

- `hub/index.html`
- `hub/home.css` (novo)
- `hub/motion.js` (novo)
- `hub/internal.css` (novo)
- `hub/internal-motion.js` (novo)
- `hub/app.js`
- `hub/config.js`
- `hub/projects/index.html`
- `hub/README.md`
- `hub/vendor/*` (novo)
- Espelhos públicos equivalentes em `docs/hub/`
- `tests/sync-hub.mjs` (novo)
- `tests/validate-hub.mjs` (novo)
- `tests/portfolio_smoke.py`
- `REDESIGN_PROGRESS.md`

## O que foi testado

- `node tests/sync-hub.mjs`
- `node tests/validate-hub.mjs`: 5 páginas, 84 referências locais, 9 cases, metadados e espelhos validados.
- `python tests/portfolio_smoke.py`: aprovado com Chromium/Playwright.
- `node --check` em `app.js`, `config.js` e `motion.js`.
- `git diff --check`: aprovado; apenas avisos de conversão LF/CRLF do Git no Windows.
- Desktop: 1920×1080, 1440×900 e 1366×768.
- Tablet: 768×1024.
- Mobile: 390×844 e 412×915.
- Sem overflow horizontal em todas as resoluções.
- Scroll lento, rápido, saltos início/fim, PageDown, Home e End.
- Âncoras, três seletores de projeto, filtros do arquivo e restauração do histórico.
- Páginas `/projects/`, `/about/`, `/now/` e `/contact/` em desktop e mobile, com screenshots de topo e conteúdo.
- Arquivo de projetos com 9 cases, filtros e `aria-labelledby` válido no fallback estático.
- GitHub API com 4 resultados e fallback local com 2 resultados quando bloqueada.
- WhatsApp, email, telefone, GitHub, LinkedIn, Instagram e vCard.
- JavaScript desativado e bibliotecas de motion bloqueadas: conteúdo completo permaneceu legível.
- Reduced motion alterado em tempo real: zero pin-spacers, zero triggers, Lenis desligado e nenhum conteúdo inerte.
- Três ciclos Home/Contacto: 260 elementos, 2 pins, 8 triggers e 0 canvases em todos os ciclos.
- Perfil top/mid/footer: zero animações CSS rodando fora da viewport e zero canvas.
- Cena de projetos: 108 frames medidos; mediana 16,7 ms, p95 16,8 ms e nenhum frame acima de 33 ms.
- Páginas internas: 1–2 ScrollTriggers por rota, zero pins, zero canvases e zero animações CSS rodando fora da viewport.
- Console novo: sem erros ou avisos.

## Problemas conhecidos

- O navegador de teste não expôs uma medição confiável de heap JavaScript; estabilidade foi verificada por contagens de DOM, pins, triggers e canvases em ciclos de rota.
- Avisos de LF/CRLF aparecem no Windows, mas `git diff --check` passa e o conteúdo publicado permanece idêntico entre `hub/` e `docs/hub/`.
- A data exibida em Agora vem de `config.now.updated` e deve ser atualizada manualmente quando o foco mudar.

## Próxima tarefa EXATA

Executar a bateria final, criar o commit e publicar `feat/hub-cinematic-scroll` no remoto:

```bash
node tests/sync-hub.mjs
node tests/validate-hub.mjs
python tests/portfolio_smoke.py
git diff --check
```

## Arquivo onde continuar

- Ajustes visuais da Home: `hub/home.css`
- Ajustes visuais internos: `hub/internal.css`
- Motion e timings: `hub/motion.js`
- Motion interno: `hub/internal-motion.js`
- Estrutura da Home: `hub/index.html`
- Conteúdo centralizado: `hub/config.js`
- Renderização funcional: `hub/app.js`
- Publicação espelhada: executar `node tests/sync-hub.mjs`; não editar `docs/hub/` isoladamente.

## Linha / função relevante

- `app.js`: `projectStory`, `renderFeaturedProjects`, `renderNow`, `bindGlobal`.
- `motion.js`: `initHeroMotion`, `initManifesto`, `initProjectStory`, `initProcessTimeline`, `initFooterMotion`, `start`.
- `tests/sync-hub.mjs`: geração dos fallbacks estáticos e sincronização do diretório publicado.

## Decisões de arquitetura tomadas

- Vanilla HTML/CSS/JS, sem framework ou etapa obrigatória de build em produção.
- `config.js` permanece a fonte única de projetos e estado atual.
- `app.js` continua responsável por conteúdo, links, filtros, GitHub e comportamento funcional.
- `motion.js` é responsável por GSAP, ScrollTrigger, Lenis, breakpoints, reduced motion e cleanup na Home.
- `internal-motion.js` aplica apenas uma entrada e reveals progressivos nas páginas internas.
- `home.css` é exclusivo da Home; `internal.css` compartilha o sistema visual das quatro páginas internas.
- Pinning somente a partir de 1024×700; mobile/tablet usam fluxo natural.
- Lenis somente com ponteiro fino e movimento permitido.
- Conteúdo essencial existe no HTML antes do JavaScript e nunca depende de opacity inicial permanente.
- GitHub Pages publica `main:/docs`; `/j/`, assets e páginas internas permanecem intactos.
- A experiência memorável está concentrada em tipografia, ritmo, linha cyan e apresentação de projetos, sem partículas, 3D, cursor customizado ou efeitos decorativos pesados.

## Itens ainda pendentes

- Commit e push da branch autorizados pelo utilizador.
