(function () {
  "use strict";

  var config = window.JOAO_HUB_CONFIG;
  if (!config) return;

  var $ = function (selector) { return document.querySelector(selector); };

  function setLink(selector, href) {
    var element = $(selector);
    if (element && href) element.href = href;
  }

  function projectCard(project, compact) {
    var article = document.createElement("article");
    article.className = compact ? "case-card case-card--compact" : "case-card";
    article.dataset.category = project.category;

    var top = document.createElement("div");
    top.className = "case-card__top";
    var category = document.createElement("span");
    category.className = "case-card__category";
    category.textContent = project.categoryLabel;
    var status = document.createElement("span");
    status.className = "status status--" + project.statusKey;
    status.textContent = project.status;
    top.append(category, status);

    var title = document.createElement("h2");
    title.id = "title-" + project.id;
    title.textContent = project.name;
    var lede = document.createElement("p");
    lede.className = "case-card__lede";
    lede.textContent = project.lede;
    article.append(top, title, lede);

    if (compact) {
      var link = document.createElement("a");
      link.className = "case-card__link";
      link.href = "/hub/projects/#" + project.id;
      link.textContent = "Ler o case";
      link.setAttribute("aria-label", "Ler o case " + project.name);
      article.append(link);
      return article;
    }

    article.id = project.id;
    article.setAttribute("aria-labelledby", title.id);
    var body = document.createElement("div");
    body.className = "case-card__body";
    var description = document.createElement("p");
    description.textContent = project.description;
    var tech = document.createElement("ul");
    tech.className = "tech-list";
    tech.setAttribute("aria-label", "Tecnologias");
    project.technologies.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      tech.append(li);
    });
    body.append(description, tech);

    var roadmap = document.createElement("ol");
    roadmap.className = "roadmap";
    roadmap.setAttribute("aria-label", "Roadmap de " + project.name);
    project.roadmap.forEach(function (step) {
      var li = document.createElement("li");
      li.className = "roadmap__step roadmap__step--" + step.state;
      var marker = document.createElement("span");
      marker.className = "roadmap__marker";
      marker.setAttribute("aria-hidden", "true");
      var copy = document.createElement("div");
      var strong = document.createElement("strong");
      strong.textContent = step.title;
      var small = document.createElement("span");
      small.textContent = step.detail;
      copy.append(strong, small);
      li.append(marker, copy);
      roadmap.append(li);
    });
    article.append(body, roadmap);
    return article;
  }

  function renderFeaturedProjects() {
    var list = $("#featured-projects");
    if (!list) return;
    var fragment = document.createDocumentFragment();
    config.projects.filter(function (project) { return project.featured; }).forEach(function (project) {
      fragment.append(projectCard(project, true));
    });
    list.replaceChildren(fragment);
  }

  function renderProjects() {
    var list = $("#projects-archive");
    if (!list) return;
    var fragment = document.createDocumentFragment();
    config.projects.forEach(function (project) { fragment.append(projectCard(project, false)); });
    list.replaceChildren(fragment);
    bindFilters();
  }

  function bindFilters() {
    var filters = document.querySelectorAll("[data-project-filter]");
    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.dataset.projectFilter;
        filters.forEach(function (item) { item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
        document.querySelectorAll("#projects-archive .case-card").forEach(function (card) {
          card.hidden = value !== "all" && card.dataset.category !== value;
        });
      });
    });
  }

  function renderNow() {
    var building = $("#now-building");
    var note = $("#now-note");
    var list = $("#interest-list");
    if (building) building.textContent = config.now.building;
    if (note) note.textContent = config.now.note;
    if (!list) return;
    config.now.interests.forEach(function (interest) {
      var item = document.createElement("li");
      item.textContent = interest;
      list.append(item);
    });
  }

  function normalizeRepo(repo) {
    return { name: repo.name, description: repo.description || "Repositório público de João Barreto.", language: repo.language || "Code", stars: Number(repo.stargazers_count || repo.stars || 0), url: repo.html_url || repo.url };
  }

  function renderRepos(repos, fallback) {
    var list = $("#repo-list");
    var status = $("#github-status");
    if (!list || !status) return;
    var fragment = document.createDocumentFragment();
    repos.forEach(function (data) {
      var repo = normalizeRepo(data);
      var link = document.createElement("a");
      link.className = "repo-row";
      link.href = repo.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      var name = document.createElement("strong");
      name.textContent = repo.name;
      var description = document.createElement("span");
      description.textContent = repo.description;
      var meta = document.createElement("small");
      meta.textContent = repo.language + " · ★ " + repo.stars;
      link.append(name, description, meta);
      fragment.append(link);
    });
    list.replaceChildren(fragment);
    status.textContent = fallback ? "Seleção local enquanto o GitHub não responde." : "Repositórios públicos atualizados recentemente.";
  }

  async function loadGithubRepos() {
    if (!$("#repo-list")) return;
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 5000);
    try {
      var response = await fetch(config.github.apiUrl, { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal });
      if (!response.ok) throw new Error("GitHub HTTP " + response.status);
      var data = await response.json();
      var repos = data.filter(function (repo) { return !repo.fork && !repo.archived && !config.github.exclude.includes(repo.name); }).slice(0, config.github.maxItems);
      if (!repos.length) throw new Error("No repositories");
      renderRepos(repos, false);
    } catch (_error) {
      renderRepos(config.github.fallback.slice(0, config.github.maxItems), true);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function feedback(message) {
    var output = $("#share-feedback");
    if (!output) return;
    output.textContent = message;
    window.clearTimeout(feedback.timeoutId);
    feedback.timeoutId = window.setTimeout(function () { output.textContent = ""; }, 3000);
  }

  async function shareProfile() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "João Barreto — Digital Hub", text: config.profile.tagline, url: config.urls.permanent });
        feedback("Perfil compartilhado");
        return;
      } catch (error) { if (error && error.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(config.urls.permanent); feedback("Link copiado"); }
    catch (_error) { feedback("Copie: " + config.urls.permanent); }
  }

  function bindGlobal() {
    setLink("#whatsapp-cta", config.urls.whatsapp);
    setLink("#vcard-cta", config.urls.vcard);
    setLink("#instagram-link", config.urls.instagram);
    setLink("#github-link", config.urls.github);
    setLink("#linkedin-link", config.urls.linkedin);
    setLink("#email-link", config.urls.email);
    var share = $("#share-profile");
    if (share) share.addEventListener("click", shareProfile);
    document.querySelectorAll("[data-current-year]").forEach(function (year) { year.textContent = new Date().getFullYear(); });
  }

  bindGlobal();
  renderFeaturedProjects();
  renderProjects();
  renderNow();
  loadGithubRepos();
}());
