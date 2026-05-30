document.addEventListener('DOMContentLoaded', function () {
  var Hls = window.Hls;
  var players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-trigger]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    var loadSource = function () {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var startPlay = function () {
      loadSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  });
});
