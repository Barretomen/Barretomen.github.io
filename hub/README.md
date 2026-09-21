# João Hub

Identidade digital pessoal de João Barreto para GitHub Pages, com uma URL permanente para QR e um passe Google Wallet separado.

## Arquitetura

```text
Google Wallet / QR
  └─ https://barretomen.github.io/j/?src=wallet
       └─ redirect preservando query string e hash
            └─ https://barretomen.github.io/hub/?src=wallet
```

```text
hub/
├─ index.html              Página e metadata
├─ projects/index.html     Arquivo dos nove cases e roadmaps
├─ about/index.html        Apresentação e princípios de trabalho
├─ now/index.html          Foco atual e próximos passos
├─ contact/index.html      Contactos e atividade pública
├─ styles.css              Sistema visual responsivo
├─ english-theme.css       Tema alinhado ao Barreto English
├─ portfolio.css           Layout editorial multipágina e roadmaps
├─ app.js                  UI, compartilhar e GitHub dinâmico
├─ config.js               Dados e feature toggles centralizados
├─ joao-barreto.vcf        Contacto vCard 3.0
├─ wallet/
│  ├─ HubWallet.gs         Integração Google Wallet para Apps Script
│  └─ appsscript.json      Manifest V8 e scopes mínimos do Apps Script
└─ README.md

j/
└─ index.html              Redirect permanente e noindex
```

O projeto usa apenas HTML, CSS e JavaScript nativos. Não há build, cookies, analytics, trackers ou dependências no browser.

## Página `/hub/`

A experiência é mobile-first e está dividida em páginas reais:

- `/hub/`: apresentação e projetos em destaque;
- `/hub/projects/`: nove cases com filtros, estado e roadmap;
- `/hub/about/`: perfil e princípios de trabalho;
- `/hub/now/`: foco atual, exploração e próximas decisões;
- `/hub/contact/`: canais diretos, redes, GitHub e compartilhamento.

Projetos corporativos são apresentados como cases sanitizados. O conteúdo público não inclui endpoints, IDs, clientes, credenciais ou detalhes internos de operação.

Os dados usados pela interface estão em `config.js`. Metadata e JSON-LD permanecem no HTML porque crawlers não devem depender da execução de JavaScript.

## Alterar links, projetos e dados

Edite `hub/config.js`:

- `profile`: nome, tagline, telefone, email e assets;
- `urls`: WhatsApp, redes, vCard e CV;
- `projects`: cases, tecnologias, estado e etapas dos roadmaps;
- `now`: projeto atual e interesses;
- `github`: utilizador, exclusões e fallback;
- `features`: recursos que podem ser ativados ou desativados.

### Adicionar um CV

1. Adicione o PDF dentro de `hub/`, por exemplo `hub/joao-barreto-cv.pdf`.
2. Em `config.js`, defina `urls.cv` como `"./joao-barreto-cv.pdf"`.
3. Defina `features.cv` como `true`.

Se `cvUrl` não estiver configurado, a interface não apresenta botão quebrado.

## URL permanente `/j/`

O QR deve apontar sempre para:

```text
https://barretomen.github.io/j/?src=wallet
```

`j/index.html` usa `location.replace()` e fallback por `meta refresh`. Query string e hash são preservados pelo JavaScript.

Para mudar o destino no futuro sem trocar o QR, altere apenas:

```js
new URL("../hub/", window.location.href)
```

em `j/index.html`.

## vCard

`hub/joao-barreto.vcf` usa vCard 3.0 e contém apenas nome, telefone e email para máxima compatibilidade de importação. Redes sociais continuam no Hub.

## GitHub dinâmico e fallback

`app.js` consulta a API pública:

```text
https://api.github.com/users/Barretomen/repos?sort=updated&per_page=20
```

O request:

- não usa token no frontend;
- possui timeout de 5 segundos;
- ignora forks, repositórios arquivados e itens configurados em `exclude`;
- usa `github.fallback` se houver rate limit, CORS, timeout ou qualquer falha.

A página principal e os contactos não dependem da API.

## Origem de acesso

Parâmetros como `?src=wallet`, `?src=qr` e `?src=instagram` são lidos localmente e colocados em `document.documentElement.dataset.entrySource`. Nesta versão nenhum dado é enviado ou armazenado.

## Google Wallet

O arquivo `hub/wallet/HubWallet.gs` implementa um Generic Pass separado:

```text
Class:  3388000000023190786.joao_hub
Object: 3388000000023190786.joao_barreto_hub
```

Ele não lê, altera, reutiliza ou elimina os passes `forlife_pass`, `forlife_joao`, `joao_contact` ou `joao_barreto_contact`.

Funções públicas:

- `hubWalletStatus()` — verifica configuração e estado da Class/Object;
- `createOrUpdateJoaoHubPass()` — cria a Class se ausente e cria ou atualiza o Object;
- `getJoaoHubSaveUrl()` — gera o link assinado para o objeto existente;
- `hubWalletConfigGuide()` — mostra um resumo seguro de configuração.

O JWT do link de salvar referencia apenas os IDs do objeto já criado. Isso mantém o link compacto. A autenticação usa JWT RS256 e o scope `wallet_object.issuer`.

### Segurança

O código não contém segredo. A Service Account é lida exclusivamente de uma Script Property:

```text
WALLET_SERVICE_ACCOUNT_JSON_B64
```

Nunca coloque no GitHub:

- private key;
- JSON ou Base64 da Service Account;
- access token OAuth;
- credenciais ForLife;
- tokens Telegram;
- QR ou Session ID do ginásio;
- arquivos `.env` com segredos.

O código não registra private key, JSON, Base64 ou access token.

## Manual steps required from João

### 1. Publicar o Hub

Depois do merge para `main`, aguarde o GitHub Pages atualizar e confirme:

1. `https://barretomen.github.io/hub/`
2. `https://barretomen.github.io/j/?src=wallet`
3. download de `https://barretomen.github.io/hub/joao-barreto.vcf`

### 2. Criar o projeto Google Apps Script separado

1. Acesse `https://script.google.com/`.
2. Clique em **Novo projeto**.
3. Renomeie para **Joao Barreto - Google Wallet Hub**.
4. Abra `hub/wallet/HubWallet.gs` deste repositório.
5. Copie o conteúdo para o editor do Apps Script.
6. Se quiser reproduzir os scopes explicitamente, habilite a exibição do manifesto e use também `hub/wallet/appsscript.json`.
7. No Apps Script, abra **Configurações do projeto**.
8. Em **Propriedades do script**, clique em **Adicionar propriedade do script**.
9. Nome: `WALLET_SERVICE_ACCOUNT_JSON_B64`.
10. Valor: copie o **mesmo valor** do projeto Wallet que já funciona.
11. Não cole esse valor no GitHub, em issues, logs ou chats públicos.
12. Salve.

### 3. Verificar e criar o passe

1. No seletor de funções, escolha `hubWalletStatus`.
2. Clique em **Executar** e autorize o projeto quando solicitado.
3. Confira no log se `serviceAccountConfigured` é `true`.
4. Escolha `createOrUpdateJoaoHubPass`.
5. Clique em **Executar**.
6. Copie `saveUrl` do resultado.
7. Abra o link no Android com a conta Google desejada.
8. Adicione o passe à Google Wallet.
9. Escaneie o QR e confirme que abre `https://barretomen.github.io/j/?src=wallet`.

Se o Issuer estiver em Demo Mode, o cartão pode mostrar `[TEST ONLY]`. Isso é comportamento oficial e desaparece após a aprovação de publicação no Google Wallet Console.

## Implantação

O repositório é um GitHub Pages de utilizador. Não há etapa de build. Após merge na `main`, os diretórios `/hub/` e `/j/` são publicados como rotas estáticas.

Comandos locais de verificação:

```bash
python -m http.server 4173
```

Depois abra `http://localhost:4173/hub/`.

## Checklist de manutenção

- manter `/j/` estável;
- atualizar projetos e fallback no `config.js`;
- verificar links públicos;
- nunca adicionar segredos;
- testar mobile antes de publicar alterações visuais;
- manter o QR da Wallet apontando para `/j/?src=wallet`.
