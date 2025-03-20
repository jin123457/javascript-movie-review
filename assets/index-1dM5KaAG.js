(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const createDOMElement = ({
  tag,
  children = [],
  attributes = {},
  event = {},
  ...props
}) => {
  const element = document.createElement(tag);
  Object.entries(event).forEach(([eventName, eventHandler]) => {
    element.addEventListener(eventName, eventHandler);
  });
  Object.entries(attributes).forEach(([attrName, attributes2]) => {
    element.setAttribute(attrName, attributes2);
  });
  Object.entries(props).forEach(([propName, propValue]) => {
    if (propName in element) {
      element[propName] = propValue;
    }
  });
  children.forEach((child) => element.appendChild(child));
  return element;
};
function MessageDisplay({ text }) {
  return createDOMElement({
    tag: "div",
    className: "no-result",
    children: [
      createDOMElement({
        tag: "img",
        attributes: {
          src: "images/으아아행성이.svg"
        }
      }),
      createDOMElement({
        tag: "p",
        textContent: text
      })
    ]
  });
}
function $(selector) {
  return document.querySelector(selector);
}
const BASE_URL = "https://api.themoviedb.org/3";
const getPopularMovies = async ({ page }) => {
  var _a;
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?language=en-US&page=${page}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZmZjMDYwYWMxNGJkMWM5YzM0NGM4MzI1ZDQ5N2ZiZSIsIm5iZiI6MTc0MjI2NjM1Mi42MzMsInN1YiI6IjY3ZDhkZmYwNmE3Yjk4MDQzNmM2YTAxNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXaXxbn6ng9NcMdNnjkk_beeZmh2fNnpv9Oi_M-ILwY"}`
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    const skeleton = $(".skeleton");
    skeleton == null ? void 0 : skeleton.remove();
    const errorUI = createDOMElement({
      tag: "div",
      className: "error-ui",
      children: [MessageDisplay({ text: "새로고침을 해주세요!" })]
    });
    (_a = $(".container")) == null ? void 0 : _a.replaceChildren(errorUI);
    return null;
  }
};
function Button({ text, onClick, id }) {
  return createDOMElement({
    tag: "button",
    className: "primary",
    innerText: text,
    event: onClick ? { click: onClick } : void 0,
    attributes: {
      id
    }
  });
}
function Footer() {
  return createDOMElement({
    tag: "footer",
    className: "footer",
    children: [
      createDOMElement({
        tag: "p",
        innerText: "© 우아한테크코스 All Rights Reserved."
      }),
      createDOMElement({
        tag: "p",
        children: [
          createDOMElement({
            tag: "img",
            attributes: {
              src: "./images/woowacourse_logo.png",
              width: "180"
            }
          })
        ]
      })
    ]
  });
}
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
function Banner({ movie }) {
  const { backdrop_path, vote_average, title } = movie;
  return createDOMElement({
    tag: "header",
    children: [
      createDOMElement({
        tag: "div",
        className: "background-container",
        children: [BackDrop({ backDropUrl: backdrop_path }), TopRatedMovie({ vote_average, title })]
      })
    ]
  });
}
function BackDrop({ backDropUrl }) {
  return createDOMElement({
    tag: "div",
    className: "overlay",
    attributes: { "aria-hidden": "true" },
    children: [
      createDOMElement({
        tag: "img",
        attributes: { src: `${IMAGE_BASE_URL}/w1920/${backDropUrl}` }
      })
    ]
  });
}
function TopRatedMovie({ vote_average, title }) {
  return createDOMElement({
    tag: "div",
    className: "top-rated-container",
    children: [
      createDOMElement({
        tag: "div",
        className: "top-rated-movie",
        children: [
          createDOMElement({
            tag: "div",
            className: "rate",
            children: [
              createDOMElement({
                tag: "img",
                className: "star",
                attributes: { src: "images/star_empty.png" }
              }),
              createDOMElement({
                tag: "span",
                className: "rate-value",
                textContent: vote_average.toFixed(1)
              })
            ]
          }),
          createDOMElement({
            tag: "div",
            className: "title",
            textContent: title
          }),
          Button({ text: "자세히보기" })
        ]
      })
    ]
  });
}
const DEFAULT_IMAGE_URL = "https://placehold.co/200x300?text=No+Image";
function Movie({ movie }) {
  const poster_path = movie.poster_path ? IMAGE_BASE_URL + "/w440_and_h660_face/" + movie.poster_path : DEFAULT_IMAGE_URL;
  return createDOMElement({
    tag: "li",
    className: "item",
    children: [
      createDOMElement({
        tag: "img",
        className: "thumbnail",
        attributes: {
          src: poster_path,
          alt: movie.title
        }
      }),
      createDOMElement({
        tag: "div",
        className: "item-desc",
        children: [
          createDOMElement({
            tag: "p",
            className: "rate",
            children: [
              createDOMElement({
                tag: "img",
                className: "star",
                attributes: { src: "images/star_empty.png" }
              }),
              createDOMElement({
                tag: "span",
                innerText: movie.vote_average.toFixed(1)
              })
            ]
          }),
          createDOMElement({
            tag: "strong",
            innerText: movie.title
          })
        ]
      })
    ]
  });
}
function MovieList({ title, movies }) {
  return createDOMElement({
    tag: "div",
    children: [
      createDOMElement({
        tag: "h2",
        textContent: title
      }),
      movies.length !== 0 ? createDOMElement({
        tag: "ul",
        className: "thumbnail-list",
        children: movies.map((movie) => Movie({ movie }))
      }) : MessageDisplay({ text: "검색 결과가 없습니다." })
    ]
  });
}
const getSearchMovies = async ({
  page,
  query
}) => {
  var _a;
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?include_adult=false&language=en-US&page=${page}&query=${query}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZmZjMDYwYWMxNGJkMWM5YzM0NGM4MzI1ZDQ5N2ZiZSIsIm5iZiI6MTc0MjI2NjM1Mi42MzMsInN1YiI6IjY3ZDhkZmYwNmE3Yjk4MDQzNmM2YTAxNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXaXxbn6ng9NcMdNnjkk_beeZmh2fNnpv9Oi_M-ILwY"}`
        }
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    const skeleton = $(".skeleton");
    skeleton == null ? void 0 : skeleton.remove();
    const errorUI = createDOMElement({
      tag: "div",
      className: "error-ui",
      children: [MessageDisplay({ text: "새로고침을 해주세요!" })]
    });
    (_a = $(".container")) == null ? void 0 : _a.replaceChildren(errorUI);
    return null;
  }
};
const Skeleton = ({ height }) => {
  return createDOMElement({
    tag: "div",
    className: "skeleton",
    attributes: {
      style: `height: ${height}px`
    }
  });
};
const SkeletonList = ({ height }) => {
  return createDOMElement({
    tag: "ul",
    className: "thumbnail-list",
    children: Array.from({ length: 20 }, () => {
      return Skeleton({ height });
    })
  });
};
function SearchBar() {
  return createDOMElement({
    tag: "form",
    id: "searchForm",
    className: "search-form",
    children: [
      createDOMElement({
        tag: "input",
        attributes: { placeholder: "검색어를 입력하세요", type: "text", name: "keyword" }
      }),
      createDOMElement({
        tag: "button",
        children: [
          createDOMElement({
            tag: "img",
            attributes: { src: "images/search.png", alt: "검색 아이콘" }
          })
        ]
      })
    ],
    event: { submit: handleSearchMovies }
  });
}
const removeHeader = () => {
  const banner = document.querySelector("header");
  banner == null ? void 0 : banner.remove();
  const main = document.querySelector("main");
  if (!main) return;
  main.style.padding = "100px 0 64px";
};
const handleSearchMovies = async (e) => {
  e.preventDefault();
  removeHeader();
  const form = e.target;
  const data = new FormData(form);
  const searchKeyword = String(data.get("keyword"));
  const container = $(".container");
  const skeletonList = SkeletonList({ height: 300 });
  container == null ? void 0 : container.replaceChildren(skeletonList);
  let currentPage = 1;
  const response = await getSearchMovies({ page: currentPage, query: searchKeyword });
  if (!response) return;
  const { results: movies, total_pages, page } = response;
  const searchedMovieList = MovieList({ movies, title: `"${searchKeyword}" 검색 결과` });
  container == null ? void 0 : container.replaceChildren(searchedMovieList);
  if (total_pages !== page) {
    const moreButton = Button({
      text: "더보기",
      id: "moreButton",
      onClick: () => handleMoreButtonClick$1(++currentPage, searchKeyword, total_pages, moreButton)
    });
    container == null ? void 0 : container.appendChild(moreButton);
  }
};
const handleMoreButtonClick$1 = async (page, query, total_pages, moreButton) => {
  if (page >= total_pages) {
    moreButton.remove();
  }
  const container = $(".thumbnail-list");
  if (!container) return;
  const skeletonList = SkeletonList({ height: 300 });
  container.appendChild(skeletonList);
  const response = await getSearchMovies({ page, query });
  if (!response) return;
  const { results: newMovies } = response;
  skeletonList.remove();
  const fragment = document.createDocumentFragment();
  newMovies.forEach((movie) => {
    const newMovie = Movie({ movie });
    fragment.appendChild(newMovie);
  });
  container.appendChild(fragment);
};
function Header() {
  return createDOMElement({
    tag: "div",
    className: "logo",
    children: [
      createDOMElement({
        tag: "a",
        attributes: {
          href: "/javascript-movie-review"
        },
        children: [
          createDOMElement({
            tag: "img",
            className: "logo-img",
            attributes: {
              src: "images/logo.png",
              alt: "MovieList"
            }
          })
        ]
      }),
      SearchBar()
    ]
  });
}
const API_PAGE_LIMIT = 500;
const INITIAL_PAGE = 1;
const MOVIE_INDEX_FOR_BANNER = 1;
addEventListener("load", async () => {
  renderBanner();
  renderHeader();
  renderMovieList();
  renderFooter();
});
const renderBanner = async () => {
  const wrap = $("#wrap");
  const bannerSkeleton = Skeleton({ height: 500 });
  wrap == null ? void 0 : wrap.prepend(bannerSkeleton);
  const response = await getPopularMovies({ page: 1 });
  if (!response) return;
  const movies = response.results;
  if (movies.length !== 0) {
    const banner = Banner({ movie: movies[MOVIE_INDEX_FOR_BANNER] });
    bannerSkeleton == null ? void 0 : bannerSkeleton.replaceWith(banner);
  }
};
const renderHeader = () => {
  const wrap = $("#wrap");
  const header = Header();
  wrap == null ? void 0 : wrap.prepend(header);
};
const renderMovieList = async () => {
  const container = $(".container");
  if (!container) return;
  const skeletonList = SkeletonList({ height: 300 });
  container.appendChild(skeletonList);
  let page = INITIAL_PAGE;
  const response = await getPopularMovies({ page });
  if (!response) return;
  const movies = response.results;
  if (movies.length !== 0) {
    const movieList = MovieList({ movies, title: "지금 인기 있는 영화" });
    const moreButton = Button({
      text: "더보기",
      id: "moreButton",
      onClick: () => handleMoreButtonClick(++page, moreButton)
    });
    skeletonList.replaceWith(movieList);
    container.appendChild(moreButton);
  }
};
const renderFooter = () => {
  const wrap = $("#wrap");
  if (!wrap) return;
  const footer = Footer();
  wrap.appendChild(footer);
};
const handleMoreButtonClick = async (page, moreButton) => {
  if (page >= API_PAGE_LIMIT - 1) {
    moreButton.remove();
  }
  const container = $(".thumbnail-list");
  if (!container) return;
  const skeletonList = SkeletonList({ height: 300 });
  container.appendChild(skeletonList);
  const response = await getPopularMovies({ page });
  if (!response) return;
  const newMovies = response.results;
  skeletonList.remove();
  const fragment = document.createDocumentFragment();
  newMovies.forEach((movie) => {
    const newMovie = Movie({ movie });
    fragment.appendChild(newMovie);
  });
  container.appendChild(fragment);
};
