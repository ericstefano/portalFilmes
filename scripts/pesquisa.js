const endpoint = 'https://api.themoviedb.org/3';
const api = 'bb7d98d462da7e8fab29d731e6823815';
const tmdbRequest = (get, pars = '') =>
  `${endpoint}${get}?api_key=${api}${pars}`;
const titulo = document.getElementById('titulo-pesquisa');
const gridCards = document.getElementById('gridCards');
const modalDiv = document.getElementById('modal');
const link = new URLSearchParams(window.location.search);
const menu = document.getElementById('menu');
const btnMobile = document.getElementById('btn-mobile');
const btnMobileIcon = document.getElementById('btn-mobile__icon');
const windowWidth = window.matchMedia('(min-width: 1160px)');

const activateMenu = () => {
  menu.classList.add('mobile-active');
};

const deactivateMenu = () => {
  menu.classList.remove('mobile-active');
};

const addMenuHeight = () => {
  menu.style.height = `${menu.scrollHeight}px`;
};

const removeMenuHeight = () => {
  menu.removeAttribute('style');
};

const setMenuIconActive = () => {
  btnMobileIcon.setAttribute('class', 'btn-mobile__icon fa fa-times fa-lg');
};

const setMenuIconDeactive = () => {
  btnMobileIcon.setAttribute('class', 'btn-mobile__icon fa fa-bars fa-lg');
};

const menuToggleOn = () => {
  activateMenu();
  addMenuHeight();
  setMenuIconActive();
};

const menuToggleOff = () => {
  deactivateMenu();
  removeMenuHeight();
  setMenuIconDeactive();
};

const menuToggle = () => {
  if (menu.classList.contains('mobile-active')) {
    menuToggleOff();
  } else {
    menuToggleOn();
  }
};
btnMobile.addEventListener('click', menuToggle);

const autoToggleMenu = (currentWindowWidth) => {
  if (currentWindowWidth.matches) {
    menuToggleOff();
  }
};
windowWidth.addEventListener('change', autoToggleMenu);

const query = link.get('filme');
const btnCarregar = document.getElementById('btn-carregar-cards');
let page = 1;

const fetchMovie = async (id) => {
  const res = await fetch(
      tmdbRequest(
          `/movie/${id}`,
          '&language=pt-BR&append_to_response=videos,credits',
      ),
  );
  return res.json();
};

const fetchQuery = async (query = '', page) => {
  const res = await fetch(
      tmdbRequest('/search/movie', `&language=pt-BR&query=${query}&page=${page}`),
  );
  return res.json();
};

const buildModals = (res) => {
  const genres = res.genres.map((genre) => genre.name);
  let link;
  res.videos.results[0] != undefined ?
    (link = `https://www.youtube.com/watch?v=${res.videos.results[0].key}`) :
    (link = `https://www.youtube.com/results?search_query=${res.title}`);

  modalDiv.innerHTML = `
              <div class="modal__container" id="${res.id}"
              style="background: rgba(0,0,0, 0.7) url('https://image.tmdb.org/t/p/original/${
  res.backdrop_path
}') no-repeat center center; background-size: cover;">
              <div class="modal">
              <button class="modal__button modal__button--close" id="modal-${
  res.id
}"><span class="fa fa-times"></span></button>
              <h1 class="modal__title">${res.title} (${new Date(
    res.release_date,
).getFullYear()})</h1>
  <p class="modal__tagline">${res.tagline}</p>
                <div class="modal__text-container">
                  <p class="modal__text">${res.overview}</p>
                </div>
                <div class="modal__pill-container" id="pills">
                <button class="modal__pill">${new Date(
      res.release_date,
  ).toLocaleDateString('pt-BR')}</button>
                <button class="modal__pill">${res.vote_average}</button>
                </div>
                <div class="modal__button-container">
                  <a href="${link}" target="_blank"><button class="modal__button
                   modal__button--red">Trailer <span class="fas fa-hand-pointer">
                   </span></button></a>
                  <a href="https://www.themoviedb.org/movie/${
  res.id
}" target="_blank"><button class="modal__button
   modal__button--blue">TMDB <span class="fas fa-hand-pointer"></span></button>
        <a href="https://image.tmdb.org/t/p/original/${
  res.backdrop_path
}" target="_blank"><button class="modal__button
   modal__button--green">Wallpaper <span class="fas fa-hand-pointer">
   </span></button></a>
                  </div>
                </div>
              </div>`;
  const close = document.getElementById(`modal-${res.id}`);
  const modal = document.getElementById(res.id);
  const pills = document.getElementById('pills');
  genres.map((genre) => {
    pills.innerHTML += `<button class="modal__pill">${genre}</button>`;
  });

  modal.onclick = (e) => {
    if (e.target !== modal) {
      return;
    }
    modal.classList.remove('modal__container--show');
    document.body.style.removeProperty('overflow');
  };

  close.onclick = () => {
    modal.classList.remove('modal__container--show');
    document.body.style.removeProperty('overflow');
  };
  document.body.style.overflow = 'hidden';
  modal.classList.add('modal__container--show');
};

buildCards = async () => {
  titulo.textContent = `Resultados da Pesquisa "${query}":`;
  const movies = await fetchQuery(query, page);
  page++;
  if (page >= movies.total_pages) {
    btnCarregar.setAttribute(
        'class',
        'btn-carregar__button btn-carregar__button--disabled ',
    );
  }
  movies.results.map((movie) => {
    const toAppendDiv = document.createElement('div');
    const toAppendImg = document.createElement('img');
    let poster;
    if (movie.poster_path === null) {
      poster =
        'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg';
    } else {
      poster = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    }
    toAppendImg.setAttribute('src', poster);
    toAppendImg.setAttribute('alt', movie.title);
    toAppendDiv.setAttribute('class', 'movie-cards__card');
    toAppendDiv.appendChild(toAppendImg);
    toAppendDiv.onclick = async () => {
      const morefrommovie = await fetchMovie(movie.id);
      buildModals(morefrommovie);
    };
    gridCards.appendChild(toAppendDiv);
  });
};
buildCards();
btnCarregar.addEventListener('click', buildCards);
