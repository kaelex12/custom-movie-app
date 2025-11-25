const API_KEY = '08af22ea8de3ace1784da78f4764bbdb'; // Replace with your TMDb key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.getElementById('movies');
const nowPlayingBtn = document.getElementById('nowPlayingBtn');
const popularBtn = document.getElementById('popularBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Modal elements
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalOverview = document.getElementById('modalOverview');
const modalDate = document.getElementById('modalDate');
const modalRating = document.getElementById('modalRating');

// Fetch movies
async function fetchMovies(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    console.error('Error fetching movies:', err);
    moviesContainer.innerHTML = '<p>Failed to load movies.</p>';
  }
}

// Search movies
async function searchMovies(query) {
  if (!query) return;
  try {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=en-US&page=1`);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    console.error('Error searching movies:', err);
    moviesContainer.innerHTML = '<p>Search failed.</p>';
  }
}

// Display movies
function displayMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach(movie => {
    const poster = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';
    const movieEl = document.createElement('div');
    movieEl.className = 'movie';
    movieEl.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
    `;
    movieEl.addEventListener('click', () => showModal(movie));
    moviesContainer.appendChild(movieEl);
  });
}

// Modal functions
function showModal(movie) {
  modalPoster.src = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : '';
  modalTitle.textContent = movie.title;
  modalOverview.textContent = movie.overview;
  modalDate.textContent = movie.release_date;
  modalRating.textContent = movie.vote_average;
  modal.style.display = 'block';
}

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target == modal) modal.style.display = 'none'; }

// Event listeners
nowPlayingBtn.addEventListener('click', () => {
  fetchMovies('/movie/now_playing');
  nowPlayingBtn.classList.add('active');
  popularBtn.classList.remove('active');
});

popularBtn.addEventListener('click', () => {
  fetchMovies('/movie/popular');
  popularBtn.classList.add('active');
  nowPlayingBtn.classList.remove('active');
});

searchBtn.addEventListener('click', () => searchMovies(searchInput.value));
searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') searchMovies(searchInput.value); });

// Initial load
fetchMovies('/movie/now_playing');
