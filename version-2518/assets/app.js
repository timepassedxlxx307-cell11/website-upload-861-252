(function () {
  function toggleMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
      button.textContent = expanded ? "☰" : "×";
    });
  }

  function initCarousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-control.prev");
    var next = root.querySelector(".hero-control.next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
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

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initSearchPage() {
    var input = document.getElementById("searchInput");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results) {
      return;
    }
    var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function apply(value) {
      var keyword = String(value || "").trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-meta")).toLowerCase();
        var matched = keyword === "" || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    input.addEventListener("input", function () {
      apply(input.value);
    });

    var buttons = document.querySelectorAll("[data-filter-buttons] button");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        input.value = button.getAttribute("data-filter") || "";
        apply(input.value);
      });
    });

    apply(query);
  }

  window.setupMoviePlayer = function (sourceUrl) {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var started = false;
    var hls = null;

    function activate() {
      if (!video || !sourceUrl) {
        return;
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = sourceUrl;
        video.play().catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", activate);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          activate();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    toggleMobileMenu();
    initCarousel();
    initSearchPage();
  });
})();
