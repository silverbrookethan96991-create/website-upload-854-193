import { MOVIE_SEARCH_DATA } from "./search-data.js";

const root = document.body.dataset.root || "./";

function joinRoot(path) {
  return root + path.replace(/^\.\//, "");
}

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-to]"));
  if (slides.length <= 1) {
    return;
  }
  let active = 0;
  let timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
  }

  function start() {
    timer = window.setInterval(() => show(active + 1), 5200);
  }

  function restart(index) {
    window.clearInterval(timer);
    show(index);
    start();
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => restart(Number(dot.dataset.heroTo || 0)));
  });

  start();
}

function normalize(value) {
  return (value || "").toString().toLowerCase().trim();
}

function setupFilterToolbars() {
  document.querySelectorAll("[data-filter-toolbar]").forEach((toolbar) => {
    const section = toolbar.closest("section") || document;
    const grid = section.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    const input = toolbar.querySelector("[data-filter-input]");
    const chips = Array.from(toolbar.querySelectorAll("[data-filter-value]"));
    let chipValue = "";

    function applyFilter() {
      const typed = normalize(input ? input.value : "");
      const selected = normalize(chipValue);
      const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
      cards.forEach((card) => {
        const text = normalize(card.dataset.filterText);
        const matchesInput = !typed || text.includes(typed);
        const matchesChip = !selected || text.includes(selected);
        card.classList.toggle("is-hidden", !(matchesInput && matchesChip));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chipValue = chip.dataset.filterValue || "";
        chips.forEach((item) => item.classList.toggle("is-active", item === chip));
        applyFilter();
      });
    });
  });
}

function setupSearchModal() {
  const modal = document.querySelector("[data-search-modal]");
  if (!modal) {
    return;
  }
  const input = modal.querySelector("[data-global-search-input]");
  const results = modal.querySelector("[data-search-results]");
  const openButtons = Array.from(document.querySelectorAll("[data-open-search]"));
  const closeButtons = Array.from(modal.querySelectorAll("[data-close-search]"));

  function render(items) {
    const list = items.slice(0, 40);
    if (!list.length) {
      results.innerHTML = '<p class="search-empty">没有找到匹配影片</p>';
      return;
    }
    results.innerHTML = list.map((movie) => {
      const cover = joinRoot(movie.cover);
      const href = joinRoot(movie.link);
      return `
        <a class="search-result" href="${href}">
          <img src="${cover}" alt="${movie.title}" loading="lazy" decoding="async">
          <div>
            <h3>${movie.title}</h3>
            <p>${movie.oneLine}</p>
            <div class="ranking-meta"><span>${movie.category}</span><span>${movie.year}</span><span>${movie.region}</span></div>
          </div>
        </a>
      `;
    }).join("");
  }

  function search() {
    const keyword = normalize(input.value);
    if (!keyword) {
      render(MOVIE_SEARCH_DATA.slice(0, 12));
      return;
    }
    const matches = MOVIE_SEARCH_DATA.filter((movie) => normalize(movie.searchText).includes(keyword));
    render(matches);
  }

  function open() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    render(MOVIE_SEARCH_DATA.slice(0, 12));
    window.setTimeout(() => input.focus(), 30);
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openButtons.forEach((button) => button.addEventListener("click", open));
  closeButtons.forEach((button) => button.addEventListener("click", close));
  input.addEventListener("input", search);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      close();
    }
  });
}

setupMobileMenu();
setupHero();
setupFilterToolbars();
setupSearchModal();
