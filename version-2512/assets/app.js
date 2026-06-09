(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });
    show(0);
    play();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    var existing = {};
    Array.prototype.forEach.call(select.options, function (option) {
      existing[option.value] = true;
    });
    values.forEach(function (value) {
      if (value && !existing[value]) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      }
    });
  }

  function setupFilters() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-filter-wrap]'), function (wrap) {
      var input = wrap.querySelector('[data-filter-input]');
      var type = wrap.querySelector('[data-filter-type]');
      var region = wrap.querySelector('[data-filter-region]');
      var year = wrap.querySelector('[data-filter-year]');
      var empty = wrap.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(wrap.querySelectorAll('[data-movie-card]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      var types = [];
      var regions = [];
      var years = [];

      cards.forEach(function (card) {
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        if (types.indexOf(cardType) === -1) {
          types.push(cardType);
        }
        if (regions.indexOf(cardRegion) === -1) {
          regions.push(cardRegion);
        }
        if (years.indexOf(cardYear) === -1) {
          years.push(cardYear);
        }
      });
      years.sort().reverse();
      types.sort();
      regions.sort();
      fillSelect(type, types);
      fillSelect(region, regions);
      fillSelect(year, years);
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var selectedType = type ? type.value : '';
        var selectedRegion = region ? region.value : '';
        var selectedYear = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var ok = true;
          if (term && text.indexOf(term) === -1) {
            ok = false;
          }
          if (selectedType && card.getAttribute('data-type') !== selectedType) {
            ok = false;
          }
          if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
            ok = false;
          }
          if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, region, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('movie-play');
    if (!video || !button || !source) {
      return;
    }
    var hls = null;

    function setButtonHidden(hidden) {
      button.classList.toggle('is-hidden', hidden);
    }

    function attach() {
      if (hls || video.getAttribute('src')) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      setButtonHidden(true);
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setButtonHidden(false);
        });
      }
    }

    attach();
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      setButtonHidden(true);
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        setButtonHidden(false);
      }
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
