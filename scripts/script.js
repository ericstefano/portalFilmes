const btnMobile = document.getElementById('btn-mobile');
const carregarBtnCards = document.getElementById('btn-carregar-cards');
const carregarBtnAvaliacoes = document.getElementById(
    'btn-carregar-avaliacoes',
);
const btnDropdown = document.getElementById('btn-dropdown');
const spanBtn = document.getElementById('span-btn');
const menu = document.getElementById('menu');
const gridCards = document.getElementById('grid-cards');
const dropdownContent = document.getElementById('dropdown-content');
const modalDiv = document.getElementById('modal');
const windowWidth = window.matchMedia('(min-width: 1160px)');
const ultimasAvaliacoesCardContainer = document.getElementById(
    'ultimas-avaliacoes__card-container',
);
const endpoint = 'https://api.themoviedb.org/3';
const api = 'bb7d98d462da7e8fab29d731e6823815';

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

const getDistanceFromTheTop = (element) => {
  const id = element.getAttribute('href');
  return document.querySelector(id).offsetTop;
};

const nativeScroll = (distanceFromTheTop) => {
  window.scroll({
    top: distanceFromTheTop,
    behavior: 'smooth',
  });
};

const scrollToSection = (event) => {
  event.preventDefault();
  menuToggleOff();
  const distanceFromTheTop = getDistanceFromTheTop(event.target) - 64;
  nativeScroll(distanceFromTheTop);
};

const menuLinks = document.querySelectorAll('.header__menu a[href^="#"]');
menuLinks.forEach((link) => {
  link.addEventListener('click', scrollToSection);
});

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
      details[1].results[0].key :
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
        <h3>${movie.title} (${date.getFullYear()})</h3>
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

buildEmDestaqueCards = (movies, quantity = 4) => {
  movies.length <= quantity ?
    carregarBtnCards.setAttribute(
        'class',
        'btn-carregar__button btn-carregar__button--disabled',
    ) :
    carregarBtnCards.setAttribute('class', 'btn-carregar__button');
  buildCards(movies, quantity);
};

const fetchMovie = async (id) => {
  const res = await fetch(
      tmdbRequest(
          `/movie/${id}`,
          '&language=pt-BR&append_to_response=videos,credits',
      ),
  );
  return res.json();
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
    toAppendDiv.onclick = async () => {
      const morefrommovie = await fetchMovie(movie.id);
      buildModals(morefrommovie);
    };
    gridCards.appendChild(toAppendDiv);
  });
};

const updateCards = (movies) => {
  removeAllChildNodes(gridCards);
  buildEmDestaqueCards(movies);
  carregarBtnCards.onclick = () => {
    buildEmDestaqueCards(movies);
  };
};

const fetchMovieByGenre = async (id = '') => {
  const res = await fetch(
      tmdbRequest(
          '/discover/movie',
          `&language=pt-BR&sort_by=popularity.desc${id}`,
      ),
  );
  return await res.json();
};

const dropdownButtonItems = async (name, id = '') => {
  const toAppend = document.createElement('li');
  toAppend.setAttribute('class', 'btn-dropdown__item');
  toAppend.textContent = name;
  toAppend.onclick = async () => {
    btnDropdown.textContent = name;
    const spanIcon = document.createElement('span');
    spanIcon.setAttribute('class', 'fas fa-caret-down fa-lg');
    btnDropdown.appendChild(spanIcon);
    const res = await fetchMovieByGenre(id);
    updateCards(res.results);
  };
  dropdownContent.appendChild(toAppend);
};

const fetchEmDestaque = async () => {
  const res = await fetchMovieByGenre();
  updateCards(res.results);
};

fetchEmDestaque();

const fetchNowPlaying = async () => {
  const res = await fetch(tmdbRequest('/movie/now_playing', '&language=pt-BR'));
  return res.json();
};

const fetchVideo = async (id) => {
  const res = await fetch(tmdbRequest(`/movie/${id}/videos`));
  return res.json();
};

const fetchLancamentos = async () => {
  const movies = await fetchNowPlaying();
  movies.results.slice(0, 6).map(async (movie) => {
    const details = fetchMovie(movie.id);
    const video = fetchVideo(movie.id);
    const resp = await Promise.all([details, video]);
    swiper.appendSlide(buildSlide(resp));
  });
};

fetchLancamentos();

const fetchGenreList = async () => {
  const res = await fetch(tmdbRequest('/genre/movie/list', '&language=pt-BR'));
  return res.json();
};

const fetchEmDestaqueGeneros = async () => {
  dropdownButtonItems('Tudo');
  const res = await fetchGenreList();
  await res.genres.map(async (genre) => {
    dropdownButtonItems(genre.name, `&with_genres=${genre.id}`);
  });
};

fetchEmDestaqueGeneros();

const fetchPopular = async (page = 1) => {
  const res = await fetch(
      tmdbRequest('/movie/popular', `&language=pt-BR&page=${page}`),
  );
  return res.json();
};

const fetchReview = async (id) => {
  const res = await fetch(
      tmdbRequest(`/movie/${id}/reviews`, '&language=pt-BR'),
  );
  return res.json();
};

let contador = 1;
let qtdReviews = 0;
const fetchReviews = async () => {
  const pop = await fetchPopular(contador);
  const revs = await Promise.all(
      pop.results.map(async (el) => {
        const res = await fetchReview(el.id);
        return {title: el.title, review: res.results[0]};
      }),
  );

  const final = revs.filter((el) => {
    return el.review !== undefined;
  });

  contador += 1;
  qtdReviews += final.length;

  if (qtdReviews > 20) {
    carregarBtnAvaliacoes.setAttribute(
        'class',
        'btn-carregar__button btn-carregar__button--disabled',
    );
  }

  if (final.length === 0) {
    return fetchReviews(contador);
  }
  return final;
};

const buildReviews = async () => {
  const data = await fetchReviews(contador);
  data.forEach(async (review) => {
    const title = await review.title;
    review = await review.review;
    const cardItem = document.createElement('div');
    cardItem.setAttribute('class', 'ultimas-avaliacoes__card-item');
    const iconContainer = document.createElement('div');
    iconContainer.setAttribute(
        'class',
        'ultimas-avaliacoes__card-item-icon-container ',
    );
    const icon = document.createElement('div');

    icon.setAttribute(
        'class',
        ' ultimas-avaliacoes__card-item-icon far fa-user fa-lg',
    );
    const text = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = `${review.author} - avaliando "${title}"`;
    const p = document.createElement('p');
    p.setAttribute('class', 'ultimas_avaliacoes__card-text');
    p.textContent = review.content;
    const data = document.createElement('p');
    data.setAttribute('class', 'text-bold');
    const formatDate = new Date(review.created_at).toLocaleDateString('pt-BR');
    data.textContent = `Adicionado em ${formatDate}`;
    const link = document.createElement('a');
    link.setAttribute('href', review.url);
    link.setAttribute('target', '_blank');
    link.setAttribute('style', 'color: blue;');
    link.textContent = `Ver no TMDB`;
    iconContainer.appendChild(icon);
    cardItem.appendChild(iconContainer);
    text.appendChild(h3);
    text.appendChild(p);
    text.appendChild(data);
    text.appendChild(link);
    cardItem.appendChild(text);
    ultimasAvaliacoesCardContainer.appendChild(cardItem);
  });
};
buildReviews();
carregarBtnAvaliacoes.addEventListener('click', () => {
  buildReviews();
});
