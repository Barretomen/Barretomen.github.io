window.JOAO_HUB_CONFIG = Object.freeze({
  profile: {
    name: "João Barreto",
    role: "Developer · Automation · Tech",
    tagline: "Construo ferramentas para retirar atrito do trabalho real.",
    phoneDisplay: "+351 921 176 038",
    phoneInternational: "+351921176038",
    email: "imjoaobarreto@gmail.com"
  },
  urls: {
    canonical: "https://barretomen.github.io/hub/",
    permanent: "https://barretomen.github.io/j/",
    whatsapp: "https://wa.me/351921176038",
    instagram: "https://www.instagram.com/jaobm_/",
    github: "https://github.com/Barretomen",
    linkedin: "https://www.linkedin.com/in/barretomendes/",
    email: "mailto:imjoaobarreto@gmail.com",
    vcard: "/hub/joao-barreto.vcf"
  },
  projects: [
    {
      id: "command-assistant", name: "Operations Command Assistant", category: "desktop", categoryLabel: "Desktop",
      status: "Em desenvolvimento", statusKey: "active", featured: true,
      lede: "Um ambiente Electron que reúne automações antes espalhadas por extensões e páginas.",
      description: "O crescimento de pequenas automações tornou o navegador pesado e o trabalho fragmentado. A solução evolui essas ferramentas para uma aplicação desktop com navegação integrada, sessão persistente e módulos operacionais reutilizáveis.",
      technologies: ["Electron", "JavaScript", "Python", "CDP"],
      roadmap: [
        { state: "done", title: "Base desktop", detail: "Electron integrado a um sidecar Python." },
        { state: "done", title: "Sessões persistentes", detail: "Navegação interna e autenticação preservada." },
        { state: "done", title: "Módulos operacionais", detail: "Fluxos de captura, consulta e preenchimento reunidos." },
        { state: "current", title: "Arquitetura modular", detail: "Consolidar integrações e reduzir dependências entre fluxos." },
        { state: "planned", title: "Qualidade e distribuição", detail: "Testes automatizados e atualização controlada." }
      ]
    },
    {
      id: "workflow-suite", name: "Operations Workflow Suite", category: "automation", categoryLabel: "Automação",
      status: "Estável · em migração", statusKey: "stable", featured: true,
      lede: "Uma família de extensões que conecta contexto, formulários e tarefas repetitivas.",
      description: "Automação assistida para capturar dados em uma etapa e reutilizá-los com segurança em outras ferramentas. O projeto privilegia revisão humana em ações sensíveis e está sendo gradualmente incorporado ao aplicativo desktop.",
      technologies: ["Chrome MV3", "JavaScript", "DOM", "Web APIs"],
      roadmap: [
        { state: "done", title: "Autofill inicial", detail: "Redução de digitação repetitiva." },
        { state: "done", title: "Contexto compartilhado", detail: "Dados reaproveitados entre ferramentas." },
        { state: "done", title: "Validações", detail: "Proteções e revisão antes de concluir tarefas." },
        { state: "current", title: "Migração para Electron", detail: "Mover módulos sem interromper os fluxos estáveis." },
        { state: "planned", title: "Consolidação", detail: "Retirar extensões que se tornarem redundantes." }
      ]
    },
    {
      id: "backoffice-sync", name: "Backoffice Support Sync", category: "automation", categoryLabel: "Automação",
      status: "Ativo", statusKey: "active", featured: false,
      lede: "Uma ponte segura entre atendimento, contexto do pedido e ações de backoffice.",
      description: "Extensão Manifest V3 organizada em content scripts, service worker e bridge de captura. Automatiza etapas operacionais, mas mantém aprovação humana obrigatória antes de qualquer ação financeira.",
      technologies: ["Chrome MV3", "esbuild", "JavaScript", "Apps Script"],
      roadmap: [
        { state: "done", title: "Fundação", detail: "Git, builds e releases organizados." },
        { state: "current", title: "Configuração central", detail: "Uma única fonte para eventos e seletores." },
        { state: "planned", title: "Pipeline robusto", detail: "Máquina de estados e trava de reentrância." },
        { state: "planned", title: "Testes", detail: "Cobertura de parsing, matching e normalização." }
      ]
    },
    {
      id: "site-extractor", name: "Barreto Site Extractor", category: "tools", categoryLabel: "Ferramenta",
      status: "Funcional", statusKey: "stable", featured: true,
      lede: "Captura passiva de conteúdo público para migrações e redesigns rastreáveis.",
      description: "Preserva páginas renderizadas, Markdown, media, screenshots, dados públicos do WordPress e inventários de URL. Foi desenhado para reconstruir uma interface sem perder conteúdo nem copiar a implementação visual antiga.",
      technologies: ["Node.js", "Playwright", "WordPress API", "PowerShell"],
      roadmap: [
        { state: "done", title: "Crawler seguro", detail: "Captura sequencial com respeito a limites." },
        { state: "done", title: "Exportação estruturada", detail: "HTML, Markdown, assets e metadados." },
        { state: "done", title: "Inventário de migração", detail: "Cobertura e redirects rastreáveis." },
        { state: "planned", title: "Interface de configuração", detail: "Preparar capturas sem editar comandos." },
        { state: "planned", title: "Relatório de cobertura", detail: "Resumo visual automático da migração." }
      ]
    },
    {
      id: "imobflow", name: "ImobFlow", category: "web", categoryLabel: "Web · SaaS",
      status: "MVP em desenvolvimento", statusKey: "active", featured: false,
      lede: "Comentários em redes sociais transformados em respostas úteis e leads organizados.",
      description: "Protótipo multiempresa para imobiliárias, com laboratório social, respostas contextuais sem dependência de IA externa e infraestrutura preparada para integrações oficiais da Meta.",
      technologies: ["Node.js", "Webhooks", "Meta APIs", "Multi-tenant"],
      roadmap: [
        { state: "done", title: "Base multiempresa", detail: "Dados separados por organização." },
        { state: "done", title: "Laboratório social", detail: "Simulação segura de comentários e respostas." },
        { state: "done", title: "Pipeline de leads", detail: "Interações classificadas e organizadas." },
        { state: "current", title: "Integração Meta", detail: "Preparação de permissões e webhooks oficiais." },
        { state: "planned", title: "Piloto controlado", detail: "Validação com uma conta autorizada." }
      ]
    },
    {
      id: "forlife-wallet", name: "ForLife Cloud Wallet", category: "automation", categoryLabel: "Automação",
      status: "Funcional · evoluindo", statusKey: "stable", featured: false,
      lede: "QR rotativo, reservas e Google Wallet sincronizados em um fluxo pessoal.",
      description: "Um sistema em Apps Script acompanha a validade do QR, atualiza o mesmo passe na Google Wallet e mantém rotinas independentes de reserva, retry e watchdog.",
      technologies: ["Apps Script", "Google Wallet", "HTTP", "PowerShell"],
      roadmap: [
        { state: "done", title: "Mapeamento seguro", detail: "Entendimento do fluxo sem executar operações destrutivas." },
        { state: "done", title: "QR dinâmico", detail: "Monitoramento de validade e renovação." },
        { state: "done", title: "Google Wallet", detail: "Sincronização direta no mesmo passe." },
        { state: "current", title: "Identidade própria", detail: "Marca e experiência visual consistentes." },
        { state: "planned", title: "Painel de saúde", detail: "Histórico e estado das sincronizações." }
      ]
    },
    {
      id: "dofus-window-manager", name: "Dofus Window Manager", category: "desktop", categoryLabel: "Desktop",
      status: "Funcional", statusKey: "stable", featured: false,
      lede: "Gerenciamento multiconta em Windows com foco, atalhos globais e broadcast controlado.",
      description: "Aplicação .NET 8 que detecta janelas do jogo, permite alternar personagens por hotkey e oferece mouse e teclado multiconta com proteções explícitas. Inclui tema, tray, inicialização automática e preferências persistentes.",
      technologies: ["C#", ".NET 8", "WinForms", "Windows API"],
      roadmap: [
        { state: "done", title: "Gerenciador de janelas", detail: "Detecção e troca rápida entre personagens." },
        { state: "done", title: "Experiência desktop", detail: "Cards, temas, tray e startup." },
        { state: "done", title: "Modo multiconta", detail: "Broadcast controlado de mouse e teclado." },
        { state: "planned", title: "Perfis de configuração", detail: "Conjuntos reutilizáveis por composição." }
      ]
    },
    {
      id: "receipt-automation", name: "Receipt Automation", category: "automation", categoryLabel: "Automação",
      status: "Fluxo assistido", statusKey: "active", featured: false,
      lede: "Horas, cálculo e preparação mensal de recibos com validação humana no momento certo.",
      description: "Busca as horas do período, recalcula totais, prepara o documento e valida os dados no portal. A emissão final permanece protegida contra duplicação ou criação fiscal incorreta.",
      technologies: ["Node.js", "Playwright", "PowerShell", "HTTP"],
      roadmap: [
        { state: "done", title: "Consolidação das horas", detail: "Leitura e cálculo mensal automatizados." },
        { state: "done", title: "Payload de recibo", detail: "Preparação a partir de um modelo validado." },
        { state: "done", title: "Validação assistida", detail: "Conferência antes de qualquer emissão." },
        { state: "current", title: "Fluxo pós-emissão", detail: "Download e organização do documento." },
        { state: "planned", title: "Auditoria mensal", detail: "Conferência de duplicidade e histórico." }
      ]
    },
    {
      id: "mfc-finder", name: "MFC Finder", category: "web", categoryLabel: "Web · Mapas",
      status: "Funcional", statusKey: "stable", featured: false,
      lede: "Encontra a unidade operacional mais próxima a partir de postcode, cidade ou morada.",
      description: "Ferramenta local que combina geocodificação, mapa aberto e tempos reais de rota quando disponíveis. Também estima deslocamentos alternativos para acelerar decisões operacionais.",
      technologies: ["JavaScript", "MapLibre", "Postcodes.io", "OpenRouteService"],
      roadmap: [
        { state: "done", title: "Pesquisa geográfica", detail: "Postcode, cidade e morada." },
        { state: "done", title: "Mapa e distância", detail: "Visualização das unidades mais próximas." },
        { state: "done", title: "Tempo de rota", detail: "Rota real com fallback de estimativa." },
        { state: "planned", title: "Comparação de cenários", detail: "Guardar e comparar múltiplas pesquisas." }
      ]
    }
  ],
  now: {
    building: "Operations Command Assistant",
    note: "Consolidando automações maduras em um produto desktop mais leve e sustentável.",
    interests: ["Electron", "JavaScript", "C#", "Apps Script", "Automation"]
  },
  github: {
    username: "Barretomen",
    apiUrl: "https://api.github.com/users/Barretomen/repos?sort=updated&per_page=20",
    maxItems: 4,
    exclude: ["Barretomen.github.io", "GordoRunner"],
    fallback: [
      { name: "registo-cais", description: "Aplicação operacional para registo de cais.", language: "JavaScript", stars: 0, url: "https://github.com/Barretomen/registo-cais" },
      { name: "barreto-english", description: "Inglês para a vida real e para desenvolvedores.", language: "HTML", stars: 0, url: "https://github.com/Barretomen/barreto-english" }
    ]
  }
});
