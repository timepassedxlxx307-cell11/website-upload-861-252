(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function createCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"play-badge\">▶</span></a>" +
      "<div class=\"movie-card-body\"><div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
      "<h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  var input = document.querySelector("[data-search-page-input]");
  var heading = document.querySelector("[data-search-title]");
  var resultNode = document.querySelector("[data-search-results]");
  var emptyNode = document.querySelector("[data-search-empty]");

  if (input) input.value = query;
  if (!resultNode) return;

  var movies = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
  var normalized = query.toLowerCase();
  var results = normalized ? movies.filter(function (movie) {
    return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
  }) : [];

  if (heading) {
    heading.textContent = query ? "搜索：" + query : "影片搜索";
  }

  if (results.length) {
    resultNode.innerHTML = results.map(createCard).join("");
    if (emptyNode) emptyNode.style.display = "none";
  } else {
    resultNode.innerHTML = "";
    if (emptyNode) emptyNode.style.display = "block";
  }
})();
