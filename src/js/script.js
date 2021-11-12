const menu = document.getElementById('menu');
const btnMobile = document.getElementById('btn-mobile');
const btnMobileIcon = document.getElementById('btn-mobile__icon');
const btnDropdown = document.getElementById('btn-dropdown');
const btnDropdownContent = document.getElementById('btn-dropdown__content');
const btnCarregarCards = document.getElementById('btn-carregar-cards');
const moviesCards = document.getElementById('movie-cards');
const avaliacoesCards = document.getElementById('avaliacoes__card-container');
const btnCarregarAvaliacoes = document.getElementById(
  'btn-carregar-avaliacoes'
);
const bastidoresCards = document.getElementById('bastidores__making-container');
const btnCarregarBastidores = document.getElementById(
  'btn-carregar-bastidores'
);
const novidadesCards = document.getElementById('novidades__card-container');
const modalDiv = document.getElementById('modal');
const endpoint = 'https://api.themoviedb.org/3';
const api = 'bb7d98d462da7e8fab29d731e6823815';
const swiper = new Swiper('.swiper-container', {
  direction: 'horizontal',
  loop: false,
  simulateTouch: true,
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
    '*'
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
    movie.videos.results.length === 0
      ? details[1].results[0]?.key
      : movie.videos.results[0]?.key;
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
              ', '
            )}</li>
            <li><span class="text-bold">Roteiro:</span> ${writers.join(
              ', '
            )}</li>
        </ul>
    </div>
</div>`;
  return slide;
};

const buildModals = (res) => {
  const genres = res.genres.map((genre) => genre.name);
  let link;
  res.videos.results[0] != undefined
    ? (link = `https://www.youtube.com/watch?v=${res.videos.results[0].key}`)
    : (link = `https://www.youtube.com/results?search_query=${res.title}`);

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
    res.release_date
  ).getFullYear()})</h1>
<p class="modal__tagline">${res.tagline}</p>
              <div class="modal__text-container">
                <p class="modal__text">${res.overview}</p>
              </div>
              <div class="modal__pill-container" id="pills">
              <button class="modal__pill">${new Date(
                res.release_date
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
  movies.length <= quantity
    ? btnCarregarCards.setAttribute(
        'class',
        'btn-carregar__button btn-carregar__button--disabled'
      )
    : btnCarregarCards.setAttribute('class', 'btn-carregar__button');
  buildCards(movies, quantity);
};

const fetchMovie = async (id) => {
  const res = await fetch(
    tmdbRequest(
      `/movie/${id}`,
      '&language=pt-BR&append_to_response=videos,credits'
    )
  );
  return res.json();
};

buildCards = (movies, quantity) => {
  movies.splice(0, quantity).map((movie) => {
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
    toAppendImg.setAttribute('draggable', 'false');
    toAppendDiv.setAttribute('class', 'movie-cards__card');
    toAppendDiv.appendChild(toAppendImg);
    toAppendDiv.onclick = async () => {
      const morefrommovie = await fetchMovie(movie.id);
      buildModals(morefrommovie);
    };
    moviesCards.appendChild(toAppendDiv);
  });
};

const updateCards = (movies) => {
  removeAllChildNodes(moviesCards);
  buildEmDestaqueCards(movies);
  btnCarregarCards.onclick = () => {
    buildEmDestaqueCards(movies);
  };
};

const fetchMovieByGenre = async (id = '') => {
  const res = await fetch(
    tmdbRequest(
      '/discover/movie',
      `&language=pt-BR&sort_by=popularity.desc${id}`
    )
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
  btnDropdownContent.appendChild(toAppend);
};

const fetchEmDestaque = async () => {
  const res = await fetchMovieByGenre();
  updateCards(res.results);
};

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
    tmdbRequest('/movie/popular', `&language=pt-BR&page=${page}`)
  );
  return res.json();
};

const fetchReview = async (id) => {
  const res = await fetch(
    tmdbRequest(`/movie/${id}/reviews`, '&language=pt-BR')
  );
  return res.json();
};

const fetchReviews = async () => {
  const final = [];
  let contador = 1;
  while (final.length <= 20) {
    const pop = await fetchPopular(contador);
    const revs = await Promise.all(
      pop.results.map(async (el) => {
        const res = await fetchReview(el.id);
        return {
          title: el.title,
          review: res.results[0],
          year: new Date(el.release_date).getFullYear(),
        };
      })
    );
    final.push(
      ...revs.filter((el) => {
        return el.review !== undefined;
      })
    );
    contador += 1;
  }
  return final.splice(0, 20);
};

const buildReviews = async (data) => {
  data.splice(0, 4).forEach(async (review) => {
    const title = await review.title;
    const year = await review.year;
    review = await review.review;
    const cardItem = document.createElement('div');
    cardItem.setAttribute('class', 'avaliacoes__card-item');
    const iconContainer = document.createElement('div');
    iconContainer.setAttribute(
      'class',
      'avaliacoes__card-item-icon-container '
    );
    const icon = document.createElement('div');

    icon.setAttribute('class', ' avaliacoes__card-item-icon far fa-user fa-lg');
    const text = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = `${review.author} - avaliando "${title} (${year})"`;
    const p = document.createElement('p');
    p.setAttribute('class', 'avaliacoes__card-text');
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
    avaliacoesCards.appendChild(cardItem);
  });
};

const startReviews = async () => {
  const data = await fetchReviews();
  buildReviews(data);
  btnCarregarAvaliacoes.addEventListener('click', (e) => {
    if (data.length <= 4) {
      e.target.setAttribute(
        'class',
        'btn-carregar__button btn-carregar__button--disabled'
      );
    }
    buildReviews(data);
  });
};

const fetchYoutube = async (query) => {
  const res = await fetch(
    `https://yt-scrap.herokuapp.com/api/search?q=${query}`
  );
  return res.json();
};

const fetchMaking = async () => {
  const res = await fetchPopular();
  const titles = await res.results.map((el) => el.title);
  const final = await Promise.all(
    titles.map(async (el) => {
      const res = await fetchYoutube(`${el} entrevista bastidores making of`);
      const temp = await res.results[0];
      return { req: temp, movieName: el.toLowerCase() };
    })
  );
  let filtered = [];

  for await (const el of final) {
    if (el.req.video !== undefined) {
      const title = el.req.video.title.toLowerCase();
      if (
        (!title.includes('trailer') &&
          title.includes(el.movieName) &&
          title.includes('bastidores')) ||
        title.includes('making of') ||
        title.includes('makingof') ||
        title.includes('entrevista') ||
        title.includes('elenco')
      ) {
        filtered.push(el.req);
      }
    }
  }
  filtered = filtered.filter(
    (el, i, arr) => arr.findIndex((t) => t.video.title === el.video.title) === i
  );
  return filtered;
};

const updateMaking = async (el) => {
  const id = el.video.id;
  const itemCard = document.createElement('div');
  itemCard.setAttribute('class', 'bastidores__item-card');
  const videoContainer = document.createElement('div');
  videoContainer.setAttribute('class', 'video-container');
  const video = document.createElement('iframe');
  video.setAttribute('class', 'video-container__video');
  video.setAttribute(
    'src',
    `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1"`
  );
  video.setAttribute(
    'srcdoc',
    `
  <style>
  * {
  padding: 0;
  margin: 0;
  overflow: hidden;
  }
  
  body, html {
    height: 100%;
  }
  
  img, svg {
    position: absolute;
    width: 100%;
    top: 0;
    bottom: 0;
    margin: auto;
  }
  
  svg {
    filter: drop-shadow(1px 1px 10px hsl(206.5, 70.7%, 8%));
    transition: all 250ms ease-in-out;
  }
  
  body:hover svg {
    filter: drop-shadow(1px 1px 10px hsl(206.5, 0%, 10%));
    transform: scale(1.2);
  }
</style>
<a href='https://www.youtube.com/embed/${id}?autoplay=1'>
  <img src='https://img.youtube.com/vi/${id}/hqdefault.jpg' alt='Coffee Recipe Javascript Project'>
  <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-play-circle'><circle cx='12' cy='12' r='10'></circle><polygon points='10 8 16 12 10 16 10 8'></polygon></svg>
</a>`
  );
  video.setAttribute('allowfullscreen', '');
  video.setAttribute('frameborder', '0');
  const title = document.createElement('h3');
  title.setAttribute('class', 'bastidores__titulo');
  title.textContent = el.video.title;
  videoContainer.appendChild(video);
  itemCard.appendChild(videoContainer);
  itemCard.appendChild(title);
  bastidoresCards.appendChild(itemCard);
};

const treatMaking = async (res) => {
  const temp = res.splice(0, 3);
  if (res.length == 0) {
    btnCarregarBastidores.setAttribute(
      'class',
      'btn-carregar__button btn-carregar__button--disabled'
    );
  }
  temp.map(updateMaking);
  btnCarregarBastidores.onclick = () => {
    treatMaking(res);
  };
};

const buildMaking = async () => {
  const res = await fetchMaking();
  treatMaking(res);
};

const fetchNovidades = async () => {
  const res = await fetch('https://gnews-scrap-api.herokuapp.com/news');
  return res.json();
};

const buildNovidades = async (news) => {
  news = await news.noticias;
  news.forEach((el) => {
    const title = el.title;
    const link = el.link;
    const figure = el.figure;
    const cardContainer = document.createElement('a');
    cardContainer.setAttribute('class', 'novidades__card');
    cardContainer.setAttribute('href', link);
    cardContainer.setAttribute('target', '_blank');
    const h3 = document.createElement('h3');
    h3.textContent = title;
    const img = document.createElement('img');
    img.setAttribute('src', figure);
    const div = document.createElement('div');
    div.appendChild(h3);
    const imgContainer = document.createElement('div');
    imgContainer.appendChild(img);
    cardContainer.appendChild(imgContainer);
    cardContainer.appendChild(div);
    novidadesCards.appendChild(cardContainer);
  });
};

const startNovidades = async () => {
  const req = await fetchNovidades();
  buildNovidades(req);
};
(async () => {
  NProgress.configure({ minimum: 0.0 });
  NProgress.configure({ trickle: false });
  NProgress.configure({ showSpinner: false });
  NProgress.start();
  fetchLancamentos();
  NProgress.set(0.2);
  fetchEmDestaque();
  NProgress.set(0.4);
  await startReviews();
  NProgress.set(0.6);
  await buildMaking();
  NProgress.set(0.8);
  await startNovidades();
  NProgress.done();
})();
