(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('.hero-slide', slider);
    var dots = $all('.hero-dot', slider);
    if (!slides.length) {
      return;
    }
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initImages() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initSearch() {
    var panel = $('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var keyword = $('[data-filter-keyword]', panel);
    var region = $('[data-filter-region]', panel);
    var year = $('[data-filter-year]', panel);
    var type = $('[data-filter-type]', panel);
    var cards = $all('[data-movie-card]');
    var status = $('[data-filter-status]');
    var empty = $('[data-empty-state]');

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function apply() {
      var q = valueOf(keyword);
      var r = valueOf(region);
      var y = valueOf(year);
      var t = valueOf(type);
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();

        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && (card.getAttribute('data-region') || '').toLowerCase() !== r) {
          ok = false;
        }
        if (y && (card.getAttribute('data-year') || '').toLowerCase() !== y) {
          ok = false;
        }
        if (t && (card.getAttribute('data-type') || '').toLowerCase() !== t) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '已筛选出 ' + visible + ' 部影片' : '没有匹配的影片';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, region, year, type].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });

    apply();
  }

  function attachHls(video, url, box) {
    if (!video || !url) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          box.classList.add('has-error');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (box) {
      var video = $('video', box);
      var play = $('[data-play]', box);
      var mute = $('[data-mute]', box);
      var fullscreen = $('[data-fullscreen]', box);
      var url = video ? video.getAttribute('data-hls') : '';

      attachHls(video, url, box);

      function start() {
        if (!video) {
          return;
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      function toggle() {
        if (!video) {
          return;
        }
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      }

      if (play) {
        play.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', toggle);
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          box.classList.remove('is-playing');
        });
      }
      if (mute) {
        mute.addEventListener('click', function () {
          if (!video) {
            return;
          }
          video.muted = !video.muted;
          mute.textContent = video.muted ? '取消静音' : '静音';
        });
      }
      if (fullscreen) {
        fullscreen.addEventListener('click', function () {
          if (!video) {
            return;
          }
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (video.requestFullscreen) {
            video.requestFullscreen();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initImages();
    initSearch();
    initPlayers();
  });
})();
