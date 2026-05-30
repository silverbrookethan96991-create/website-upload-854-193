(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            document.body.classList.toggle("menu-open", menu.classList.contains("open"));
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("open");
                document.body.classList.remove("menu-open");
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === index);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
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
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        start();
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });
    }

    function includesText(value, needle) {
        return String(value || "").toLowerCase().indexOf(needle) !== -1;
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var section = scope.closest("section") || document;
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
            var empty = section.querySelector("[data-empty-filter]");
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (query && !includesText(haystack, query)) {
                        matched = false;
                    }
                    if (regionValue && card.getAttribute("data-region") !== regionValue) {
                        matched = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
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
            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.initMoviePlayer = function (videoSrc) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("player-overlay");
        var playButton = document.getElementById("player-play");
        var muteButton = document.getElementById("player-mute");
        var fullscreenButton = document.getElementById("player-fullscreen");
        var errorBox = document.getElementById("player-error");
        var shell = video ? video.closest(".video-player") : null;
        var hls = null;
        var sourceReady = false;
        if (!video || !videoSrc) {
            return;
        }
        function showError(text) {
            if (errorBox) {
                errorBox.textContent = text;
                errorBox.hidden = false;
            }
        }
        function setupSource() {
            if (sourceReady) {
                return;
            }
            sourceReady = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(videoSrc);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showError("视频暂时无法播放");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoSrc;
            } else {
                showError("当前浏览器暂不支持播放");
            }
        }
        function play() {
            setupSource();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("hidden");
                    }
                });
            }
        }
        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (playButton) {
            playButton.addEventListener("click", togglePlay);
        }
        if (muteButton) {
            muteButton.addEventListener("click", function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "静音" : "音量";
            });
        }
        if (fullscreenButton) {
            fullscreenButton.addEventListener("click", function () {
                var target = shell || video;
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (target.requestFullscreen) {
                    target.requestFullscreen();
                }
            });
        }
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
            if (shell) {
                shell.classList.add("playing");
            }
            if (playButton) {
                playButton.textContent = "暂停";
            }
        });
        video.addEventListener("pause", function () {
            if (!video.ended && overlay) {
                overlay.classList.remove("hidden");
            }
            if (shell) {
                shell.classList.remove("playing");
            }
            if (playButton) {
                playButton.textContent = "▶";
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("hidden");
            }
            if (shell) {
                shell.classList.remove("playing");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
