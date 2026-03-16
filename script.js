const API_KEY = "08af22ea8de3ace1784da78f4764bbdb";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER = "https://via.placeholder.com/500x750/1b1b1b/f3efe6?text=No+Poster";

const moviesContainer = document.getElementById("movies");
const statusMessage = document.getElementById("statusMessage");
const resultsTitle = document.getElementById("resultsTitle");
const resultsMeta = document.getElementById("resultsMeta");
const nowPlayingBtn = document.getElementById("nowPlayingBtn");
const popularBtn = document.getElementById("popularBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalPoster = document.getElementById("modalPoster");
const modalTagline = document.getElementById("modalTagline");
const modalTitle = document.getElementById("modalTitle");
const modalOverview = document.getElementById("modalOverview");
const modalDate = document.getElementById("modalDate");
const modalRating = document.getElementById("modalRating");
const modalLanguage = document.getElementById("modalLanguage");

let currentView = "now_playing";

function getMoviePoster(path) {
  return path ? `${IMAGE_BASE}${path}` : FALLBACK_POSTER;
}

function formatDate(dateString) {
  if (!dateString) {
    return "Unknown";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRating(value) {
  return typeof value === "number" ? `${value.toFixed(1)}/10` : "Not rated";
}

function setStatus(message = "", type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message${type ? ` status-message--${type}` : ""}`;
}

function setActiveTab(activeButton) {
  [nowPlayingBtn, popularBtn].forEach((button) => {
    button.classList.toggle("active", button === activeButton);
  });
}

function updateResultsMeta(count, label) {
  resultsTitle.textContent = label;
  resultsMeta.textContent = count === 1 ? "1 movie found" : `${count} movies found`;
}

async function requestMovies(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

async function loadMovies(endpoint, label, params = {}) {
  setStatus("Loading movies...", "loading");
  moviesContainer.innerHTML = "";
  resultsTitle.textContent = label;
  resultsMeta.textContent = "Fetching live data";

  try {
    const movies = await requestMovies(endpoint, params);
    displayMovies(movies);
    updateResultsMeta(movies.length, label);

    if (!movies.length) {
      setStatus("No movies matched this view.", "empty");
    } else {
      setStatus("");
    }
  } catch (error) {
    console.error("Movie request failed:", error);
    resultsMeta.textContent = "Unable to reach the movie service";
    setStatus("Failed to load movies. Check the API key or network access.", "error");
  }
}

function displayMovies(movies) {
  moviesContainer.innerHTML = "";

  movies.forEach((movie) => {
    const movieEl = document.createElement("article");
    movieEl.className = "movie";
    movieEl.tabIndex = 0;
    movieEl.setAttribute("role", "button");
    movieEl.setAttribute("aria-label", `View details for ${movie.title}`);

    movieEl.innerHTML = `
      <div class="movie__poster-wrap">
        <img src="${getMoviePoster(movie.poster_path)}" alt="${movie.title}">
        <span class="movie__rating">${formatRating(movie.vote_average)}</span>
      </div>
      <div class="movie__body">
        <p class="movie__date">${formatDate(movie.release_date)}</p>
        <h3>${movie.title}</h3>
        <p class="movie__overview">${movie.overview || "No overview available."}</p>
      </div>
    `;

    const openMovie = () => showModal(movie);
    movieEl.addEventListener("click", openMovie);
    movieEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMovie();
      }
    });

    moviesContainer.appendChild(movieEl);
  });
}

function showModal(movie) {
  modalPoster.src = getMoviePoster(movie.poster_path);
  modalPoster.alt = movie.title;
  modalTagline.textContent = movie.original_title && movie.original_title !== movie.title ? movie.original_title : "Movie details";
  modalTitle.textContent = movie.title;
  modalOverview.textContent = movie.overview || "No overview available.";
  modalDate.textContent = formatDate(movie.release_date);
  modalRating.textContent = formatRating(movie.vote_average);
  modalLanguage.textContent = movie.original_language ? movie.original_language.toUpperCase() : "Unknown";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeMovieModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function runNowPlaying() {
  currentView = "now_playing";
  setActiveTab(nowPlayingBtn);
  loadMovies("/movie/now_playing", "Now Playing");
}

function runPopular() {
  currentView = "popular";
  setActiveTab(popularBtn);
  loadMovies("/movie/popular", "Popular Movies");
}

function runSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    setStatus("Enter a movie title to search.", "empty");
    return;
  }

  currentView = "search";
  setActiveTab(null);
  loadMovies("/search/movie", `Search: ${query}`, { query });
}

closeModal.addEventListener("click", closeMovieModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeMovieModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeMovieModal();
  }
});

nowPlayingBtn.addEventListener("click", runNowPlaying);
popularBtn.addEventListener("click", runPopular);
searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runSearch();
  }
});

runNowPlaying();
