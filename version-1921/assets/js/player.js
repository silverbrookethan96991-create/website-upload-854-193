(function() {
    function initMoviePlayer(streamUrl) {
        var shell = document.querySelector("[data-player]");
        if (!shell || !streamUrl) {
            return;
        }

        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var hls = null;
        var loaded = false;

        function playVideo() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function() {});
            }
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    playVideo();
                });
                return;
            }

            video.src = streamUrl;
        }

        function start() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            loadSource();
            playVideo();
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function() {
            if (!loaded) {
                start();
            }
        });

        video.addEventListener("canplay", function() {
            if (cover && cover.classList.contains("is-hidden")) {
                playVideo();
            }
        });

        window.addEventListener("beforeunload", function() {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
