(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-index')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function bindFilter(input) {
        const grid = document.querySelector('.movie-grid');
        const empty = document.querySelector('.empty-state');
        if (!input || !grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll('.movie-card'));

        function applyFilter() {
            const keyword = normalize(input.value);
            let visible = 0;
            cards.forEach(function (card) {
                const text = normalize(card.getAttribute('data-search'));
                const matched = !keyword || text.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    }

    const liveSearch = document.querySelector('.js-live-search');
    if (liveSearch) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q');
        if (initial) {
            liveSearch.value = initial;
        }
        bindFilter(liveSearch);
    }

    const cardFilter = document.querySelector('.js-card-filter');
    if (cardFilter) {
        bindFilter(cardFilter);
    }
}());
