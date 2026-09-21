window.JOAO_HUB_CONFIG = Object.freeze({
  profile: {
    name: "João Barreto",
    role: "Developer · Automation · Tech",
    tagline: "Construo apps, automações e soluções digitais.",
    phoneDisplay: "+351 921 176 038",
    phoneInternational: "+351921176038",
    email: "imjoaobarreto@gmail.com",
    photo: "/assets/wallet/joao_barreto_wallet_photo.jpg",
    logo: "/assets/wallet/joao_barreto_wallet_logo.svg"
  },
  urls: {
    canonical: "https://barretomen.github.io/hub/",
    permanent: "https://barretomen.github.io/j/",
    whatsapp: "https://wa.me/351921176038",
    instagram: "https://www.instagram.com/jaobm_/",
    github: "https://github.com/Barretomen",
    linkedin: "https://www.linkedin.com/in/barretomendes/",
    email: "mailto:imjoaobarreto@gmail.com",
    vcard: "./joao-barreto.vcf",
    cv: null
  },
  projects: [
    {
      name: "ForLife Automation",
      description: "Automação pessoal integrando Google Wallet, QR dinâmico e reservas.",
      category: "Automation",
      url: null
    },
    {
      name: "Registo Cais",
      description: "Aplicação para registo operacional de entradas, saídas e fornecedores.",
      category: "Operations",
      url: "https://barretomen.github.io/registo-cais/"
    },
    {
      name: "João Digital Hub",
      description: "Identidade digital pessoal integrada à Google Wallet.",
      category: "Digital identity",
      url: "https://barretomen.github.io/hub/"
    }
  ],
  now: {
    building: "João Digital Hub",
    interests: ["Java", "Spring", "JavaScript", "Android", "Automation"]
  },
  github: {
    username: "Barretomen",
    apiUrl: "https://api.github.com/users/Barretomen/repos?sort=updated&per_page=20",
    maxItems: 4,
    exclude: ["Barretomen.github.io"],
    fallback: [
      {
        name: "GordoRunner",
        description: "Jogo runner responsivo para navegador e celular.",
        language: "JavaScript",
        stars: 0,
        url: "https://github.com/Barretomen/GordoRunner"
      },
      {
        name: "registo-cais",
        description: "Aplicação operacional para registo de cais.",
        language: "CSS",
        stars: 0,
        url: "https://github.com/Barretomen/registo-cais"
      },
      {
        name: "barreto-english",
        description: "Inglês para a vida real e para desenvolvedores.",
        language: "HTML",
        stars: 0,
        url: "https://github.com/Barretomen/barreto-english"
      }
    ]
  },
  features: {
    githubFeed: true,
    shareProfile: true,
    cv: false
  }
});
