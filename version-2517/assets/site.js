document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('.poster-image, .hero-image, .detail-cover-image').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
    var grid = scope.parentElement.querySelector('.filtered-grid') || document.querySelector('.filtered-grid');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')) : [];
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesCategory = !filters.category || normalize(card.getAttribute('data-category')) === filters.category;
        var matchesType = !filters.type || normalize(card.getAttribute('data-type')) === filters.type;
        var matchesYear = !filters.year || normalize(card.getAttribute('data-year')) === filters.year;
        card.hidden = !(matchesQuery && matchesCategory && matchesType && matchesYear);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
    applyFilter();
  });

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    var button = shell.querySelector('[data-player-button]');
    var video = shell.querySelector('video[data-src]');

    if (!button || !video) {
      return;
    }

    button.addEventListener('click', function () {
      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }

      button.classList.add('is-hidden');

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new window.Hls({ enableWorker: true });
          video.hlsInstance = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
      } else {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        video.play().catch(function () {});
      }
    });
  });
});
