const btnMobile = document.getElementById('btn-mobile');
const carregarBtn = document.getElementById('btn-carregar');
const btnDropdown = document.getElementById('btn-dropdown');
const spanBtn = document.getElementById('spanBtn');
const nav = document.getElementById('nav');
const header = document.getElementById('header');
const menu = document.getElementById('menu');

const gridCards = document.getElementById('grid-cards');
const dropdownContent = document.getElementById('dropdown-content');
const lancamentos = document.getElementById('lancamentos');
const emDestaque = document.getElementById('em-destaque');
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

const goToElement = (element) => {
  element.scrollIntoView({behavior: 'smooth'});
  toggleMenu();
};

// Função para pausar vídeo do YouTube
const pauseVideo = () => {
  const previousSlide = document.getElementById(`video${swiper.previousIndex}`);
  previousSlide.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      '*',
  );
};

// Função para facilitar requisições do The Movie Database
const tmdbRequest = (get, pars = '') =>
  `${endpoint}${get}?api_key=${api}${pars}`;

// Construtor dos slides
const buildSlide = (details) => {
  const movie = details[0];
  const credits = movie.credits;
  const directors = credits.crew
      .filter((el) => el.department === 'Directing')
      .map((el) => el.name);
  const writers = credits.crew
      .filter((el) => el.department === 'Writing')
      .map((el) => el.name);
  const actors = credits.cast.splice(0, 6).map((el) => el.name);
  const date = new Date(movie.release_date);
  const slide = `<div class="slides swiper-slide">
    <div class="video-container">
        <iframe src="https://www.youtube-nocookie.com/embed/${
          movie.videos.results.length === 0 ?
            details[1] :
            movie.videos.results[0].key
}?enablejsapi=1"
            allowfullscreen="" frameborder="0"
            id="video${swiper.slides.length}">
        </iframe>
    </div>
    <div class="movie">
        <h1>${movie.title} (${date.getFullYear()})</h1>
        <p class="text-italic mb-20px">${movie.tagline}</p>
        <p>${movie.overview}</p>
        <ul>
            <li><span>Estreia:</span> ${date.toLocaleDateString('pt-BR')}</li>
            <li><span>Nota:</span> ${movie.vote_average}</li>
            <li><span>Elenco:</span> ${actors.join(', ')}</li>
            <li><span>Direção:</span> ${directors.join(', ')}</li>
            <li><span>Roteiro:</span> ${writers.join(', ')}</li>
        </ul>
    </div>
</div>`;
  swiper.appendSlide(slide);
};

// Função construtora das cards de imagens
const buildCard = (movies) => {
  // Esconder botão caso a lista esvazie
  if (movies.length <= 4) {
    carregarBtn.style.visibility = 'hidden';
  } else {
    carregarBtn.style.visibility = 'visible';
  }
  // Mostrar 4 cards de imagens por vez
  movies.splice(0, 4).map((movie) => {
    const toAppendDiv = document.createElement('div');
    const toAppendImg = document.createElement('img');
    toAppendImg.setAttribute(
        'src',
        `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
    );
    toAppendImg.setAttribute('id', movie.id);
    toAppendImg.setAttribute('class', 'hover-shadow');
    toAppendDiv.appendChild(toAppendImg);
    gridCards.appendChild(toAppendDiv);
  });
};

// Função para limpar todos os elementos de um node
const removeAllChildNodes = (parent) => {
  parent.querySelectorAll('*').forEach((el) => el.remove());
};

// Função para atualizar as cards de imagens
const updateBuildCard = (movies) => {
  // Limpar elementos antigos
  removeAllChildNodes(gridCards);
  // Construir novos quatro elementos iniciais
  buildCard(movies);
  // Atualizar o botão para para a lista de filmes nova
  carregarBtn.onclick = () => {
    buildCard(movies);
  };
};

// Construir cards de imagens baseado no gênero
const genreCards = (id = '') =>
  fetch(
      tmdbRequest(
          '/discover/movie',
          `&language=pt-BR&sort_by=popularity.desc${id}`,
      ),
  )
      .then((res) => res.json())
      .then((res) => updateBuildCard(res.results));

// Fazer requisição dos filmes em cartaz nos cinemas
// e transformar o retorno dessa requisição (promise) em JSON
const nowplaying = fetch(
    tmdbRequest('/movie/now_playing', '&language=pt-BR'),
).then((res) => res.json());

// Pegar apenas os seis primeiros valores do resultado
const sliced = nowplaying.then((data) => data.results.slice(0, 6));

// Iterar sobre o array com map
sliced.then((arr) =>
  arr.map((movie) => {
    // Fazer requisição dos detalhes do filme
    const mainReq = fetch(
        tmdbRequest(
            `/movie/${movie.id}`,
            '&language=pt-BR&append_to_response=videos,credits',
        ),
    ).then((res) => res.json());
    const extraReq = fetch(tmdbRequest(`/movie/${movie.id}/videos`))
        .then((res) => res.json())
        .then((res) => res.results[0].key);

    Promise.all([mainReq, extraReq]).then((res) => buildSlide(res));
  }),
);

// Construtor das cards de imagens iniciais
const startingCards = fetch(
    tmdbRequest('/discover/movie', `&language=pt-BR&sort_by=popularity.desc`),
).then((res) => res.json());
startingCards.then((res) => updateBuildCard(res.results));

const genres = fetch(tmdbRequest('/genre/movie/list', '&language=pt-BR')).then(
    (res) => res.json(),
);

genres.then((res) => {
  // Criar a primeira categoria 'todos'
  const todos = document.createElement('li');
  todos.appendChild(document.createTextNode('Tudo'));
  todos.onclick = () => {
    btnDropdown.textContent = 'Tudo';
    genreCards();
  };
  dropdownContent.appendChild(todos);
  // Criar todas as categorias com a resposta da requisição
  res.genres.map((genre) => {
    const toAppend = document.createElement('li');
    toAppend.appendChild(document.createTextNode(`${genre.name}`));
    toAppend.onclick = () => {
      btnDropdown.textContent = genre.name;
      genreCards(`&with_genres=${genre.id}`);
    };
    dropdownContent.appendChild(toAppend);
  });
});

btnMobile.addEventListener('click', toggleMenu);
const windowWidth = window.matchMedia('(min-width: 1130px)');
windowWidth.addEventListener('change', autoToggleMenu);
swiper.on('slideChange', pauseVideo);
