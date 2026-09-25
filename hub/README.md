# João Hub

Página pessoal pensada para ser aberta por QR code ou Google Wallet.

O Hub reúne apresentação, projetos, contactos e um ficheiro vCard. Os conteúdos e links principais ficam em `config.js`; o restante projeto usa apenas HTML, CSS e JavaScript.

O endereço curto `/j/` redireciona para `/hub/` e preserva os parâmetros do URL. Assim, o destino pode mudar sem ser necessário criar outro QR code.

Para testar localmente a consulta à API pública do GitHub, execute um servidor na raiz do repositório:

```bash
python -m http.server 8000
```

## Sistema visual e movimento

A experiência usa a paleta original escura e tipografia Familjen Grotesk, Source Sans 3 e IBM Plex Mono. `home.css` concentra a narrativa cinematográfica da Home; `internal.css` estende a mesma linguagem editorial para Projetos, Sobre, Agora e Contacto.

- `config.js`: fonte dos projetos, contactos e estado atual (`now.updated`, formato YYYY-MM).
- `app.js`: renderização e funcionalidades; não contém animações.
- `motion.js`: Hero, manifesto, apresentações dos projetos, processo e linha final. Apenas desktop a partir de 1024 × 700 usa pinning. Lenis funciona apenas com ponteiro fino no desktop.
- `internal-motion.js`: uma entrada coordenada e reveals leves nas páginas internas, sem pinning ou scroll suave.
- `vendor/`: GSAP e ScrollTrigger 3.15.0; Lenis 1.3.26. Arquivos locais versionados, sem CDN em tempo de execução. Cabeçalhos de licença GSAP preservados; licença MIT de Lenis incluída.

O conteúdo permanece visível sem as bibliotecas ou sem JavaScript. A preferência de movimento reduzido remove timelines, pinning, reveals e Lenis, inclusive quando alterada durante a visita. Os botões numerados permitem escolher um projeto com teclado; projetos ocultos não recebem foco. Listeners, ticker e triggers são limpos ao sair da página e recriados ao restaurar o histórico.

## Editar e publicar

**GitHub Pages publica `main:/docs`, e não a raiz do repositório.** Edite a fonte em `hub/` e execute na raiz:

```bash
node tests/sync-hub.mjs
node tests/validate-hub.mjs
python -m http.server 4173 --bind 127.0.0.1 --directory docs
```

A sincronização gera HTML estático dos projetos com o próprio renderizador de `app.js`, usando `config.js`, e copia os arquivos públicos para `docs/hub/`. Não duplique dados de projetos manualmente. `hub/wallet/` e este README não são copiados. O site publicado continua sem build ou framework.

Abra `http://127.0.0.1:4173/hub/`. Confira desktop, mobile, reduced motion, links e filtros após mudar conteúdo. O teste Playwright existente pode ser executado com `python tests/portfolio_smoke.py` quando Playwright e Chromium estiverem instalados; a revisão visual e os testes do redesign foram realizados no navegador integrado do Codex.

As fontes Google são opcionais: há fontes de sistema como fallback. `/j/`, canonical, Open Graph e URLs dos cases permanecem compatíveis.
