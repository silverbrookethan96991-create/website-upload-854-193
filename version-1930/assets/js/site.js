(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = selectAll("[data-hero-slide]");
        var dots = selectAll("[data-hero-dot]");
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function initFilters() {
        var input = document.querySelector("[data-filter-input]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = selectAll("[data-card]");
        if (!cards.length || !input) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }

        function apply() {
            var query = normalize(input.value);
            var type = typeSelect ? normalize(typeSelect.value) : "";
            var year = yearSelect ? normalize(yearSelect.value) : "";
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-keywords"),
                    card.textContent
                ].join(" "));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedType = !type || normalize(card.getAttribute("data-type")) === type;
                var matchedYear = !year || normalize(card.getAttribute("data-year")) === year;
                card.hidden = !(matchedQuery && matchedType && matchedYear);
            });
        }

        input.addEventListener("input", apply);
        if (typeSelect) {
            typeSelect.addEventListener("change", apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", apply);
        }
        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHero();
        initFilters();
    });
})();
