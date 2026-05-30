(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var year = form.querySelector("[data-filter-year]");
      var region = form.querySelector("[data-filter-region]");
      var type = form.querySelector("[data-filter-type]");
      var scope = form.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-no-results]");

      if (input && initialQuery && !input.value) {
        input.value = initialQuery;
      }

      function update() {
        var query = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var regionValue = normalize(region ? region.value : "");
        var typeValue = normalize(type ? type.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-text"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        update();
      });

      update();
    });
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector("[data-player-video]");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-player-trigger]"));
    var cover = document.querySelector(".player-cover");
    var hls = null;
    var ready = false;

    if (!video || !url) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function prepare() {
      if (ready) {
        playVideo();
        return;
      }

      ready = true;
      video.controls = true;

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = url;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", prepare);
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        prepare();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHero();
    initFilters();
  });
})();
