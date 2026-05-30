import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(player) {
  const video = player.querySelector("video[data-video-src]");
  const trigger = player.querySelector("[data-play-trigger]");
  if (!video || !trigger) {
    return;
  }
  const source = video.dataset.videoSrc;
  let hls = null;
  let loaded = false;

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  }

  function play() {
    attachSource();
    player.classList.add("is-playing");
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        player.classList.remove("is-playing");
      });
    }
  }

  trigger.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => player.classList.add("is-playing"));
  video.addEventListener("pause", () => {
    if (video.currentTime === 0) {
      player.classList.remove("is-playing");
    }
  });
  window.addEventListener("beforeunload", () => {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
