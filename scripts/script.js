const btnMobile = document.getElementById('btn-mobile');
const carregarBtn = document.getElementById('btn-carregar');
const btnDropdown = document.getElementById('btn-dropdown');
const spanBtn = document.getElementById('span-btn');
const menu = document.getElementById('menu');
const gridCards = document.getElementById('grid-cards');
const dropdownContent = document.getElementById('dropdown-content');
const modalDiv = document.getElementById('modal');
const windowWidth = window.matchMedia('(min-width: 1160px)');
const topScreen = document.getElementById('top-screen');
const topScreenAnchor = document.getElementById('top-screen-anchor');
const emDestaque = document.getElementById('em-destaque');
const emDestaqueAnchor = document.getElementById('em-destaque-anchor');
const endpoint = 'https://api.themoviedb.org/3';
const api = 'bb7d98d462da7e8fab29d731e6823815';

// Inicializando o Swiper (Carousel)
const swiper = new Swiper('.swiper-container', {
  direction: 'horizontal',
  loop: false,
  simulateTouch: false,
  effect: 'slide',
  keyboard: {
    enabled: true,
    onlyInViewport: false,
  },
  autoHeight: true,
  spaceBetween: 20,
  pagination: {
    el: '.swiper-pagination',
    clickable: 'true',
    type: 'bullets',
    color: 'black',
  },
});

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
  spanBtn.setAttribute('class', 'btn-mobile__icon fa fa-times fa-lg');
};

const setMenuIconDeactive = () => {
  spanBtn.setAttribute('class', 'btn-mobile__icon fa fa-bars fa-lg');
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

const goToElement = (element) => {
  element.scrollIntoView({behavior: 'smooth'});
};

// #Todo
const sections = [topScreen, emDestaque];
const anchors = [topScreenAnchor, emDestaqueAnchor];
for (let i = 0; i < 2; i++) {
  anchors[i].addEventListener('click', () => {
    goToElement(sections[i]);
    menuToggleOff();
  });
}

const pauseVideo = (el) => {
  el.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      '*',
  );
};
swiper.on('slideChange', () => {
  pauseVideo(document.getElementById(`video${swiper.previousIndex}`));
});

const tmdbRequest = (get, pars = '') =>
  `${endpoint}${get}?api_key=${api}${pars}`;

const removeAllChildNodes = (parent) => {
  parent.querySelectorAll('*').forEach((el) => el.remove());
};

const buildSlide = (details) => {
  const movie = details[0];
  const video =
    movie.videos.results.length === 0 ?
      details[1] :
      movie.videos.results[0].key;
  const credits = movie.credits;
  const directors = credits.crew
      .filter((el) => el.department === 'Directing')
      .map((el) => el.name)
      .reduce((arr, el) => (arr.includes(el) ? arr : [...arr, el]), []);
  const writers = credits.crew
      .filter((el) => el.department === 'Writing')
      .map((el) => el.name)
      .reduce((arr, el) => (arr.includes(el) ? arr : [...arr, el]), []);
  const actors = credits.cast.splice(0, 8).map((el) => el.name);
  const date = new Date(movie.release_date);

  const slide = `<div class="swiper-slide">
    <div class="video-container">
        <iframe class="video-container__video" src="
        https://www.youtube-nocookie.com/embed/${video}?enablejsapi=1"
            allowfullscreen="" frameborder="0"
            id="video${swiper.slides.length}">
        </iframe>
    </div>
    <div class="movie-description">
      <div class="movie-description__header">
        <h1>${movie.title} (${date.getFullYear()})</h1>
      </div>
      <div class="movie-description__content">
        <p class="text-italic mb-20px">${movie.tagline}</p>

        <p><span class="text-bold">Descrição:</span> ${movie.overview}</p>
        <ul class="movie-description__crew">
            <li><span class="text-bold">Estreia:</span>
            ${date.toLocaleDateString('pt-BR')}</li>
            <li><span class="text-bold">Nota:</span> ${movie.vote_average}</li>
            <li><span class="text-bold">Elenco:</span> ${actors.join(', ')}</li>
            <li><span class="text-bold">Direção:</span> ${directors.join(
      ', ',
  )}</li>
            <li><span class="text-bold">Roteiro:</span> ${writers.join(
      ', ',
  )}</li>
        </ul>
    </div>
</div>`;
  return slide;
};

const buildModals = (res) => {
  const genres = res.genres.map((genre) => genre.name);
  let link;
  res.videos.results[0] != undefined ?
    (link = `https://www.youtube.com/watch?v=${res.videos.results[0].key}`) :
    (link = `https://www.youtube.com/results?search_query=${res.title}`);

  modalDiv.innerHTML = `
            <div class="modal__container" id="${res.id}"
            style="background-image: url('https://image.tmdb.org/t/p/original/${
  res.backdrop_path
}');">
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
                 modal__button--red">Vídeo <span class="fas fa-hand-pointer">
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

buildEmDestaqueCards = (movies, quantity = 4) => {
  movies.length <= quantity ?
    (carregarBtn.style.visibility = 'hidden') :
    (carregarBtn.style.visibility = 'visible');
  buildCards(movies, quantity);
};

buildCards = (movies, quantity) => {
  movies.splice(0, quantity).map((movie) => {
    const toAppendDiv = document.createElement('div');
    const toAppendImg = document.createElement('img');
    toAppendImg.setAttribute(
        'src',
        `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
    );
    toAppendDiv.setAttribute('class', 'movie-cards__card');
    toAppendDiv.appendChild(toAppendImg);
    toAppendDiv.onclick = () => {
      fetch(
          tmdbRequest(
              `/movie/${movie.id}`,
              '&language=pt-BR&append_to_response=videos',
          ),
      )
          .then((res) => res.json())
          .then((res) => buildModals(res));
    };
    gridCards.appendChild(toAppendDiv);
  });
};

// Função para atualizar as cards de imagens
const updateCards = (movies) => {
  // Limpar elementos antigos
  removeAllChildNodes(gridCards);
  // Construir novos quatro elementos iniciais
  buildEmDestaqueCards(movies);
  // Atualizar o botão para que carregue a lista de filmes nova
  carregarBtn.onclick = () => {
    buildEmDestaqueCards(movies);
  };
};

// Fazer requisição de filmes por gênero e atualizar cards
const moviesByGenre = (id = '') =>
  fetch(
      tmdbRequest(
          '/discover/movie',
          `&language=pt-BR&sort_by=popularity.desc${id}`,
      ),
  )
      .then((res) => res.json())
      .then((res) => updateCards(res.results));

// Fazer requisição dos filmes em cartaz nos cinemas

const dropdownButtonItems = (name, id = '') => {
  const toAppend = document.createElement('li');
  toAppend.setAttribute('class', 'btn-dropdown__item');
  toAppend.textContent = name;
  toAppend.onclick = () => {
    btnDropdown.textContent = name;
    const spanIcon = document.createElement('span');
    spanIcon.setAttribute('class', 'fas fa-caret-down fa-lg');
    btnDropdown.appendChild(spanIcon);
    moviesByGenre(id);
  };
  dropdownContent.appendChild(toAppend);
};

fetch(tmdbRequest('/movie/now_playing', '&language=pt-BR'))
    .then((res) => res.json())
    .then((data) => data.results.slice(0, 6))
    .then((arr) =>
      arr.map((movie) => {
        const mainReq = fetch(
            tmdbRequest(
                `/movie/${movie.id}`,
                '&language=pt-BR&append_to_response=videos,credits',
            ),
        ).then((res) => res.json());
        const extraReq = fetch(tmdbRequest(`/movie/${movie.id}/videos`))
            .then((res) => res.json())
            .then((res) => res.results[0].key);

        Promise.all([mainReq, extraReq]).then((res) =>
          swiper.appendSlide(buildSlide(res)),
        );
      }),
    );

const genres = fetch(tmdbRequest('/genre/movie/list', '&language=pt-BR')).then(
    (res) => res.json(),
);

genres.then((res) => {
  // Criar todas as categorias com a resposta da requisição
  res.genres.map((genre) => {
    dropdownButtonItems(genre.name, `&with_genres=${genre.id}`);
  });
});

// Construir as quatro cards de imagens iniciais (ao carregar a página)
moviesByGenre();
dropdownButtonItems('Tudo');
