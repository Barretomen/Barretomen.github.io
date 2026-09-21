(function () {
  "use strict";

  var config = window.JOAO_HUB_CONFIG;
  if (!config) {
    return;
  }

  var $ = function (selector) { return document.querySelector(selector); };

  function setLink(selector, href) {
    var element = $(selector);
    if (element && href) {
      element.href = href;
    }
  }

  function externalLinkAttributes(link) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  function renderProjects() {
    var list = $("#project-list");
    if (!list) return;

    var fragment = document.createDocumentFragment();
    config.projects.forEach(function (project) {
      var article = document.createElement("article");
      article.className = "project-item" + (project.url ? "" : " project-item--private");

      var category = document.createElement("span");
      category.className = "project-item__category";
      category.textContent = project.category;

      var title = document.createElement("h3");
      title.textContent = project.name;

      var description = document.createElement("p");
      description.textContent = project.description;

      article.append(category, title);

      if (project.url) {
        var link = document.createElement("a");
        link.href = project.url;
        link.setAttribute("aria-label", "Abrir projeto " + project.name);
        externalLinkAttributes(link);
        link.append(description);

        var open = document.createElement("span");
        open.className = "project-item__open";
        open.setAttribute("aria-hidden", "true");
        open.textContent = "↗";
        link.append(open);
        article.append(link);
      } else {
        article.append(description);
      }

      fragment.append(article);
    });
    list.replaceChildren(fragment);
  }

  function normalizeRepo(repo) {
    return {
      name: repo.name,
      description: repo.description || "Repositório público de João Barreto.",
      language: repo.language || "Code",
      stars: Number(repo.stargazers_count || repo.stars || 0),
      url: repo.html_url || repo.url
    };
  }

  function renderRepos(repos, isFallback) {
    var list = $("#repo-list");
    var status = $("#github-status");
    if (!list || !status) return;

    var fragment = document.createDocumentFragment();
    repos.forEach(function (repoData) {
      var repo = normalizeRepo(repoData);
      var link = document.createElement("a");
      link.className = "repo-item";
      link.href = repo.url;
      externalLinkAttributes(link);
      link.setAttribute("aria-label", "Abrir repositório " + repo.name + " no GitHub");

      var titleRow = document.createElement("div");
      titleRow.className = "repo-item__title";

      var title = document.createElement("h3");
      title.textContent = repo.name;
      var arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      titleRow.append(title, arrow);

      var description = document.createElement("p");
      description.textContent = repo.description;

      var meta = document.createElement("div");
      meta.className = "repo-meta";
      var language = document.createElement("span");
      language.innerHTML = '<i class="language-dot" aria-hidden="true"></i>';
      language.append(document.createTextNode(repo.language));
      var stars = document.createElement("span");
      stars.textContent = "★ " + repo.stars;
      meta.append(language, stars);

      link.append(titleRow, description, meta);
      fragment.append(link);
    });

    list.replaceChildren(fragment);
    status.textContent = isFallback
      ? "Seleção disponível enquanto o GitHub não responde."
      : "Repositórios públicos atualizados recentemente.";
  }

  function fallbackRepos() {
    renderRepos(config.github.fallback.slice(0, config.github.maxItems), true);
  }

  async function loadGithubRepos() {
    if (!config.features.githubFeed) {
      fallbackRepos();
      return;
    }

    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 5000);

    try {
      var response = await fetch(config.github.apiUrl, {
        headers: { Accept: "application/vnd.github+json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error("GitHub HTTP " + response.status);

      var data = await response.json();
      var repos = data.filter(function (repo) {
        return !repo.fork && !repo.archived && !config.github.exclude.includes(repo.name);
      }).slice(0, config.github.maxItems);

      if (!repos.length) throw new Error("No public repositories returned");
      renderRepos(repos, false);
    } catch (_error) {
      fallbackRepos();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function renderNow() {
    var building = $("#now-building");
    var list = $("#interest-list");
    if (building) building.textContent = config.now.building;
    if (!list) return;

    var fragment = document.createDocumentFragment();
    config.now.interests.forEach(function (interest) {
      var item = document.createElement("li");
      item.textContent = interest;
      fragment.append(item);
    });
    list.replaceChildren(fragment);
  }

  function renderCv() {
    var section = $("#cv-section");
    var link = $("#cv-link");
    var enabled = config.features.cv && Boolean(config.urls.cv);
    if (!section || !link || !enabled) return;
    link.href = config.urls.cv;
    externalLinkAttributes(link);
    section.hidden = false;
  }

  function feedback(message) {
    var output = $("#share-feedback");
    if (!output) return;
    output.textContent = message;
    window.clearTimeout(feedback.timeoutId);
    feedback.timeoutId = window.setTimeout(function () {
      output.textContent = "";
    }, 3200);
  }

  async function copyProfileUrl() {
    try {
      await navigator.clipboard.writeText(config.urls.permanent);
      feedback("Link copiado");
    } catch (_error) {
      var helper = document.createElement("textarea");
      helper.value = config.urls.permanent;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      var copied = document.execCommand("copy");
      helper.remove();
      feedback(copied ? "Link copiado" : "Não foi possível copiar o link");
    }
  }

  async function shareProfile() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "João Barreto — Digital Hub",
          text: config.profile.tagline,
          url: config.urls.permanent
        });
        feedback("Perfil compartilhado");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    await copyProfileUrl();
  }

  function bindProfileData() {
    setLink("#whatsapp-cta", config.urls.whatsapp);
    setLink("#vcard-cta", config.urls.vcard);
    setLink("#instagram-link", config.urls.instagram);
    setLink("#github-link", config.urls.github);
    setLink("#linkedin-link", config.urls.linkedin);
    setLink("#email-link", config.urls.email);

    var source = new URLSearchParams(window.location.search).get("src");
    if (source && /^[a-z0-9_-]{1,32}$/i.test(source)) {
      document.documentElement.dataset.entrySource = source;
    }

    var shareButton = $("#share-profile");
    if (shareButton && config.features.shareProfile) {
      shareButton.addEventListener("click", shareProfile);
    } else if (shareButton) {
      shareButton.hidden = true;
    }

    var year = $("#current-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  bindProfileData();
  renderProjects();
  renderNow();
  renderCv();
  loadGithubRepos();
}());
