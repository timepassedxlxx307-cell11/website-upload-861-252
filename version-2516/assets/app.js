(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        const next = Number(dot.getAttribute('data-slide-to'));
        show(next);
        restart();
      });
    });

    show(0);
    start();
  }

  const input = document.querySelector('[data-filter-input]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const list = document.querySelector('[data-filter-list]');

  if (input && list) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const cards = Array.from(list.children);

    input.value = query;

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function getText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
    }

    function filter() {
      const keyword = normalize(input.value);
      const selectedType = typeFilter ? normalize(typeFilter.value) : '';

      cards.forEach(function(card) {
        const text = getText(card);
        const cardType = normalize(card.getAttribute('data-type'));
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchType = !selectedType || cardType === selectedType;
        card.hidden = !(matchKeyword && matchType);
      });
    }

    input.addEventListener('input', filter);

    if (typeFilter) {
      typeFilter.addEventListener('change', filter);
    }

    filter();
  }
})();
