(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }
    start();
  }

  function initFilters() {
    var list = document.getElementById("movie-list");
    if (!list) {
      return;
    }
    var search = document.querySelector(".site-search");
    var category = document.querySelector(".category-filter");
    var sort = document.querySelector(".sort-filter");
    var empty = document.querySelector(".empty-state");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    function valueOf(card, name) {
      return card.getAttribute("data-" + name) || "";
    }
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var cat = category ? category.value : "all";
      var visible = [];
      cards.forEach(function (card) {
        var text = valueOf(card, "search").toLowerCase();
        var cardCat = valueOf(card, "category");
        var ok = (!q || text.indexOf(q) !== -1) && (cat === "all" || cardCat === cat);
        card.hidden = !ok;
        if (ok) {
          visible.push(card);
        }
      });
      if (sort && sort.value !== "default") {
        var key = sort.value === "views" ? "views" : "year";
        visible.sort(function (a, b) {
          return Number(valueOf(b, key)) - Number(valueOf(a, key));
        });
        visible.forEach(function (card) {
          list.appendChild(card);
        });
      } else {
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible.length === 0);
      }
    }
    if (search) {
      search.addEventListener("input", apply);
    }
    if (category) {
      category.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
  }

  function initBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("is-visible", window.scrollY > 360);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initPage() {
    initMobileMenu();
    initHero();
    initFilters();
    initBackTop();
  }

  window.setupPlayer = function (source) {
    var video = document.getElementById("main-player");
    var trigger = document.querySelector(".play-trigger");
    if (!video || !source) {
      return;
    }
    var mounted = false;
    var hls = null;

    function mount() {
      if (mounted) {
        return;
      }
      mounted = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      }
      video.controls = true;
    }

    function play() {
      mount();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(initPage);
})();
