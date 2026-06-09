(function () {
  function setupMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !source) return;

    var loaded = false;
    var hls = null;

    function loadSource() {
      if (loaded) return;
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      loadSource();
      if (overlay) overlay.hidden = true;
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) overlay.hidden = false;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) startPlayback();
    });

    window.addEventListener("beforeunload", function () {
      if (hls) hls.destroy();
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
