const btnMobile = document.getElementById('btn-mobile');
const nav = document.getElementById('nav');
const menu = document.getElementById('menu');
const spanBtn = document.getElementById('spanBtn');
const windowWidth = window.matchMedia('(min-width: 1125px)');
const api = 'bb7d98d462da7e8fab29d731e6823815';
const endpoint = 'https://api.themoviedb.org/3';

// Inicializando o Swiper (Carousel)
const swiper = new Swiper('.swiper-container', {
  // Parâmetros Gerais
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
  // Parâmetros Paginação
  pagination: {
    el: '.swiper-pagination',
    clickable: 'true',
    type: 'bullets',
    color: 'black',
  },
});

// Liga o menu mobile:
// Muda a classe do nav para active;
// Define o height do menu baseando-se na quantidade de elementos;
// Muda o ícone do botão;
const toggleMenu = () => {
  nav.classList.toggle('active');
  if (nav.classList[0] === 'active') {
    menu.style.height = `${menu.scrollHeight}px`;
    spanBtn.setAttribute('class', 'fa fa-times fa-lg');
  } else {
    nav.removeAttribute('class');
    menu.removeAttribute('style');
    spanBtn.setAttribute('class', 'fa fa-bars fa-lg');
  }
};

// Desliga o menu mobile automaticamente caso a view width mude para desktop
const autoToggleMenu = (curWidth) => {
  if (curWidth.matches) {
    if (nav.classList[0] === 'active') {
      toggleMenu();
    }
  }
};

const pauseVideo = () => {
  const previousSlide = document.getElementById(`video${swiper.previousIndex}`);
  previousSlide.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      '*',
  );
};

const tmdbRequest = (get, pars = '') =>
  `${endpoint}${get}?api_key=${api}${pars}`;

btnMobile.addEventListener('click', toggleMenu);
windowWidth.addEventListener('change', autoToggleMenu);
swiper.on('slideChange', pauseVideo);

const buildSlides = (movie) => {
  let link;
  movie[0] !== undefined ? (link = movie[0]) : (link = movie[1]);
  const details = movie[2];
  const credits = movie[3];
  const directors = credits.crew
      .filter((el) => el.department === 'Directing')
      .map((el) => el.name);
  const writers = credits.crew
      .filter((el) => el.department === 'Writing')
      .map((el) => el.name);
  const actors = credits.cast.splice(0, 6).map((el) => el.name);
  const date = new Date(details.release_date);
  const slide = `<div class="lancamentos swiper-slide">
    <div class="video-container">
        <iframe src="https://www.youtube.com/embed/${link}?enablejsapi=1"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write;
            encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen="" frameborder="0"
            id="video${swiper.slides.length}">
        </iframe>
    </div>
    <div class="movie">
        <h1>${details.title} (${date.getFullYear()})</h1>
        <p class="text-italic mb-20px">${details.tagline}</p>
        <p>${details.overview}</p>
        <ul>
            <li><span>Estreia:</span> ${date.toLocaleDateString('pt-BR')}</li>
            <li><span>Nota:</span> ${details.vote_average}</li>
            <li><span>Elenco:</span> ${actors.join(', ')}</li>
            <li><span>Direção:</span> ${directors.join(', ')}</li>
            <li><span>Roteiro:</span> ${writers.join(', ')}</li>
        </ul>
    </div>
</div>`;
  swiper.appendSlide(slide);
};

// Fazer requisição dos filmes em cartaz nos cinemas
// e transformar o retorno dessa requisição (promise) em JSON
const movies = fetch(tmdbRequest('/movie/now_playing', '&language=pt-BR')).then(
    (res) => res.json(),
);

// Pegar apenas os seis primeiros valores do resultado
const sliced = movies.then((data) => data.results.slice(0, 6));

// Iterar sobre o array com map
sliced.then((arr) =>
  arr.map((movie) => {
    // Fazer requisição do vídeo utilizando
    // id da outra requisição (mercado pt-BR)
    const videosPtBr = fetch(
        tmdbRequest(`/movie/${movie.id}/videos`, '&language=pt-BR'),
    )
        .then((res) => res.json())
        .then((video) => {
          if (video.results[0] !== undefined) {
            return video.results[0].key;
          }
        });

    // Fazer requisição do vídeo utilizando id
    // da outra requisição (todos mercados,
    // caso não exista o vídeo em pt-BR)
    const videosAll = fetch(tmdbRequest(`/movie/${movie.id}/videos`))
        .then((res) => res.json())
        .then((video) => {
          if (video.results[0] !== undefined) {
            return video.results[0].key;
          }
        });

    // Fazer requisição dos detalhes do filme
    const details = fetch(
        tmdbRequest(`/movie/${movie.id}`, '&language=pt-BR'),
    ).then((res) => res.json());

    // Fazer requisição dos créditos do filme
    const credits = fetch(tmdbRequest(`/movie/${movie.id}/credits`)).then(
        (res) => res.json(),
    );

    Promise.all([videosPtBr, videosAll, details, credits]).then((res) =>
      buildSlides(res),
    );
  }),
);
