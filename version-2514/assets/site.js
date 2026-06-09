(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(() => {
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', () => {
        const open = mobileNav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-hero]').forEach((hero) => {
      const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
      const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
      let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));

      const show = (next) => {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      };

      const next = () => show(index + 1);
      const prev = () => show(index - 1);

      hero.querySelector('[data-hero-next]')?.addEventListener('click', next);
      hero.querySelector('[data-hero-prev]')?.addEventListener('click', prev);
      dots.forEach((dot) => {
        dot.addEventListener('click', () => show(Number(dot.dataset.heroDot || 0)));
      });

      window.setInterval(next, 6500);
    });

    document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
      const scope = panel.parentElement || document;
      const input = panel.querySelector('.filter-input');
      const selects = Array.from(panel.querySelectorAll('.filter-select'));
      const cards = Array.from(scope.querySelectorAll('[data-card]'));

      const apply = () => {
        const query = (input?.value || '').trim().toLowerCase();
        const activeFilters = selects.map((select) => ({
          key: select.dataset.filter || '',
          value: (select.value || '').trim().toLowerCase(),
        }));

        cards.forEach((card) => {
          const haystack = (card.dataset.searchText || '').toLowerCase();
          const queryMatched = !query || haystack.includes(query);
          const selectMatched = activeFilters.every((filter) => {
            if (!filter.value) {
              return true;
            }
            const dataValue = (card.dataset[filter.key] || '').toLowerCase();
            return dataValue.includes(filter.value) || haystack.includes(filter.value);
          });
          card.classList.toggle('is-filtered-out', !(queryMatched && selectMatched));
        });
      };

      input?.addEventListener('input', apply);
      selects.forEach((select) => select.addEventListener('change', apply));
    });

    document.querySelectorAll('.js-player').forEach((video) => {
      const source = video.querySelector('source[type="application/vnd.apple.mpegurl"]');
      const stream = source?.getAttribute('src');
      const shell = video.closest('.player-shell');
      const button = shell?.querySelector('.player-toggle');
      let hls = null;

      if (stream && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }

      const playToggle = () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      };

      button?.addEventListener('click', playToggle);
      video.addEventListener('click', playToggle);
      video.addEventListener('play', () => shell?.classList.add('is-playing'));
      video.addEventListener('pause', () => shell?.classList.remove('is-playing'));
      video.addEventListener('ended', () => shell?.classList.remove('is-playing'));
      window.addEventListener('pagehide', () => {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
