(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menuPanel = document.querySelector('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function () {
      menuPanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

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

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var channelSelect = document.querySelector('[data-channel-filter]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterCount = document.querySelector('[data-filter-count]');

  if (filterList && (filterInput || channelSelect)) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var empty = document.createElement('div');

    empty.className = 'no-results';
    empty.textContent = '没有找到匹配的影片';

    function applyFilter() {
      var keyword = normalizeText(filterInput ? filterInput.value : '');
      var channel = channelSelect ? channelSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute('data-search'));
        var cardChannel = card.getAttribute('data-channel') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedChannel = !channel || cardChannel === channel;
        var shown = matchedKeyword && matchedChannel;

        card.classList.toggle('is-hidden', !shown);

        if (shown) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
      }

      if (visible === 0 && !empty.parentNode) {
        filterList.appendChild(empty);
      }

      if (visible > 0 && empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (channelSelect) {
      channelSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  function playWithNative(video, stream) {
    video.src = stream;
    return video.play();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.defer = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var loading = false;

    function startVideo() {
      if (!video || !stream || loading) {
        return;
      }

      loading = true;

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        playWithNative(video, stream).finally(function () {
          loading = false;
        });
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }

          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().finally(function () {
              loading = false;
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            loading = false;
          });
        } else {
          playWithNative(video, stream).finally(function () {
            loading = false;
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.currentSrc && video.paused) {
          startVideo();
        }
      });
    }
  });
}());
