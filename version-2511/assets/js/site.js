(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
        toggle.textContent = expanded ? "☰" : "×";
      });
    }

    var hero = document.querySelector(".hero");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var contents = Array.prototype.slice.call(hero.querySelectorAll(".hero-copy"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        contents.forEach(function (copy, i) {
          copy.hidden = i !== index;
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
          dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      function stop() {
        if (timer) clearInterval(timer);
      }

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
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterBar = document.querySelector(".filter-bar");
    if (filterBar) {
      var keywordInput = filterBar.querySelector("[data-filter-keyword]");
      var yearSelect = filterBar.querySelector("[data-filter-year]");
      var typeSelect = filterBar.querySelector("[data-filter-type]");
      var resetButton = filterBar.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));
      var empty = document.querySelector(".empty-state");

      function applyFilters() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-tags") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType.indexOf(type) !== -1);
          card.style.display = matched ? "" : "none";
          if (matched) visible += 1;
        });
        if (empty) empty.style.display = visible ? "none" : "block";
      }

      [keywordInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) control.addEventListener("input", applyFilters);
        if (control) control.addEventListener("change", applyFilters);
      });
      if (resetButton) {
        resetButton.addEventListener("click", function () {
          if (keywordInput) keywordInput.value = "";
          if (yearSelect) yearSelect.value = "";
          if (typeSelect) typeSelect.value = "";
          applyFilters();
        });
      }
      applyFilters();
    }
  });
})();
