(function() {
    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function() {
            var isOpen = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function(dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                play();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function(panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-search-input]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-list .movie-card"));

            function apply() {
                var keyword = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                cards.forEach(function(card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-keywords")
                    ].join(" "));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")).indexOf(regionValue) !== -1;
                    var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    card.classList.toggle("hidden", !(matchesKeyword && matchesRegion && matchesYear));
                });
            }

            [input, region, year].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
