(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var root = panel.parentElement;
    var input = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var emptyState = root.querySelector('[data-empty-state]');

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var keywordOk = !keyword || searchText.indexOf(keyword) !== -1;
        var regionOk = !regionValue || cardRegion.indexOf(regionValue) !== -1 || searchText.indexOf(regionValue) !== -1;
        var typeOk = !typeValue || cardType.indexOf(typeValue) !== -1 || searchText.indexOf(typeValue) !== -1;
        var shouldShow = keywordOk && regionOk && typeOk;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();

function initPlayer(source) {
  var video = document.querySelector('.movie-player');
  var overlay = document.querySelector('.player-overlay');
  var errorBox = document.querySelector('[data-player-error]');
  var hlsInstance = null;
  var isReady = false;

  if (!video || !source) {
    return;
  }

  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add('is-visible');
    }
  }

  function setupPlayer() {
    if (isReady) {
      return;
    }

    isReady = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showError('视频加载失败，请稍后重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      showError('当前浏览器暂不支持该视频播放');
    }
  }

  function playVideo() {
    setupPlayer();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  function toggleVideo() {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', toggleVideo);

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && !video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
