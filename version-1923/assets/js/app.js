(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = qs('.mobile-toggle');
        var nav = qs('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = qs('.js-hero');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var prev = qs('.hero-prev', hero);
        var next = qs('.hero-next', hero);
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var grids = qsa('.filter-grid');
        if (!grids.length) {
            return;
        }
        var input = qs('.js-filter-input');
        var year = qs('.js-filter-year');
        var type = qs('.js-filter-type');
        var category = qs('.js-filter-category');
        var empty = qs('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var selectedYear = normalize(year ? year.value : '');
            var selectedType = normalize(type ? type.value : '');
            var selectedCategory = normalize(category ? category.value : '');
            var visible = 0;

            grids.forEach(function (grid) {
                qsa('[data-title]', grid).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-category')
                    ].join(' '));
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (selectedYear && normalize(card.getAttribute('data-year')).indexOf(selectedYear) === -1) {
                        ok = false;
                    }
                    if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
                        ok = false;
                    }
                    if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayers() {
        qsa('.js-player').forEach(function (shell) {
            var video = qs('.js-video', shell);
            var play = qs('.js-play', shell);
            var playSmall = qs('.js-play-small', shell);
            var mute = qs('.js-mute', shell);
            var full = qs('.js-fullscreen', shell);
            var message = qs('.player-message', shell);
            if (!video) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var attached = false;
            var hls = null;

            function showMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.hidden = false;
                }
            }

            function attach() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
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
                            showMessage('视频暂时无法播放，请稍后再试');
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function togglePlay(event) {
                if (event) {
                    event.preventDefault();
                }
                attach();
                if (video.paused) {
                    var result = video.play();
                    if (result && result.catch) {
                        result.catch(function () {
                            showMessage('请再次点击播放');
                        });
                    }
                } else {
                    video.pause();
                }
            }

            function sync() {
                shell.classList.toggle('is-playing', !video.paused);
                if (playSmall) {
                    playSmall.textContent = video.paused ? '播放' : '暂停';
                }
            }

            attach();
            if (play) {
                play.addEventListener('click', togglePlay);
            }
            if (playSmall) {
                playSmall.addEventListener('click', togglePlay);
            }
            video.addEventListener('click', function (event) {
                if (event.target === video) {
                    togglePlay(event);
                }
            });
            video.addEventListener('play', sync);
            video.addEventListener('pause', sync);
            video.addEventListener('ended', sync);
            if (mute) {
                mute.addEventListener('click', function () {
                    video.muted = !video.muted;
                    mute.textContent = video.muted ? '取消静音' : '静音';
                });
            }
            if (full) {
                full.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (shell.requestFullscreen) {
                        shell.requestFullscreen();
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
            sync();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
