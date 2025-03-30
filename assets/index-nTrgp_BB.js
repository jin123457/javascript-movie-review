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
const convertMovieData = (raw) => {
  return {
    backdropPath: raw.backdropPath,
    id: raw.id,
    posterPath: raw.posterPath,
    title: raw.title,
    voteAverage: raw.voteAverage,
    voteCount: raw.voteCount
  };
};
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
  Object.keys(props).forEach((key) => {
    const value = props[key];
    if (value !== void 0 && value !== null) {
      element[key] = value;
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
function $all(selector) {
  return document.querySelectorAll(selector);
}
const errorUi = (message) => {
  var _a, _b;
  const errorUI = createDOMElement({
    tag: "div",
    className: "error-ui",
    children: [MessageDisplay({ text: message })]
  });
  if ($(".error-ui")) {
    (_a = $(".error-ui")) == null ? void 0 : _a.replaceWith(errorUI);
  } else {
    (_b = $(".thumbnail-list")) == null ? void 0 : _b.replaceWith(errorUI);
  }
};
const convertSnakeCaseToCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
const transformKeysToCamel = (input) => {
  if (Array.isArray(input)) {
    return input.map(transformKeysToCamel);
  }
  if (input !== null && typeof input === "object") {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      const camelKey = convertSnakeCaseToCamelCase(key);
      result[camelKey] = transformKeysToCamel(value);
    }
    return result;
  }
  return input;
};
const BASE_URL = "https://api.themoviedb.org/3";
const ERROR = {
  VALID_INPUT: "입력한 정보에 문제가 있습니다. 다시 확인해주세요.",
  VALID_AUTHENTICATION: "접근 권한이 없습니다. 로그인 상태를 확인하거나, 권한이 필요한 작업인지 확인해주세요.",
  NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
  TOO_MANY_REQUEST: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  SERVER_REQUEST: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  UNEXPECTED: "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
  NETWORK: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
  NO_SEARCH_RESULTS: "검색 결과가 없습니다."
};
const httpErrorStatus = (status) => {
  switch (status) {
    case 400:
    case 422:
      throw new Error(ERROR.VALID_INPUT);
    case 401:
    case 403:
      throw new Error(ERROR.VALID_AUTHENTICATION);
    case 404:
      throw new Error(ERROR.NOT_FOUND);
    case 429:
      throw new Error(ERROR.TOO_MANY_REQUEST);
    case 500:
    case 502:
    case 503:
    case 504:
      throw new Error(ERROR.SERVER_REQUEST);
    default:
      throw new Error(ERROR.UNEXPECTED);
  }
};
const requestAppClient = async (method, query, params) => {
  const newParams = new URLSearchParams(params);
  const newUrl = `${BASE_URL}${query}?${newParams.toString()}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZmZjMDYwYWMxNGJkMWM5YzM0NGM4MzI1ZDQ5N2ZiZSIsIm5iZiI6MTc0MjI2NjM1Mi42MzMsInN1YiI6IjY3ZDhkZmYwNmE3Yjk4MDQzNmM2YTAxNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXaXxbn6ng9NcMdNnjkk_beeZmh2fNnpv9Oi_M-ILwY"}`
    }
  };
  try {
    const response = await fetch(newUrl, options);
    if (!response.ok) {
      httpErrorStatus(response.status);
    }
    const data = transformKeysToCamel(await response.json());
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(ERROR.NETWORK);
    }
    if (error instanceof Error) {
      throw Error(ERROR.NOT_FOUND);
    }
  }
};
const getAppClient = (query, params) => {
  return requestAppClient("GET", query, params);
};
const getPopularMovies = async (params) => {
  try {
    const movies = await getAppClient("/movie/popular", params);
    if (movies.results.length === 0) {
      throw Error(ERROR.NO_SEARCH_RESULTS);
    }
    const convertMovies = { ...movies, results: movies.results.map(convertMovieData) };
    return convertMovies;
  } catch (error) {
    if (error instanceof Error) {
      errorUi(error.message);
    }
  }
};
const bannerSkeletons = () => {
  const header = $("#wrap");
  if (!header) return;
  const fragment = document.createDocumentFragment();
  fragment.appendChild(
    createDOMElement({
      tag: "div",
      className: "banner-skeleton",
      children: [
        createDOMElement({
          tag: "div",
          className: "skeleton_loading",
          children: [
            createDOMElement({
              tag: "div",
              className: "skeleton_img"
            })
          ]
        })
      ]
    })
  );
  header.prepend(fragment);
};
const hideBannerSkeletons = () => {
  const skeletons = $all(".banner-skeleton");
  skeletons.forEach((skeleton) => {
    skeleton.remove();
  });
};
const movieListSkeletons = () => {
  const container = $(".thumbnail-list");
  if (!container) return;
  const fragment = document.createDocumentFragment();
  Array.from({ length: 20 }, () => {
    fragment.appendChild(
      createDOMElement({
        tag: "li",
        className: "movie-skeleton",
        children: [
          createDOMElement({
            tag: "div",
            className: "movie-skeleton-image",
            children: [
              createDOMElement({
                tag: "div",
                className: "skeleton_loading",
                children: [
                  createDOMElement({
                    tag: "div",
                    className: "skeleton_img"
                  })
                ]
              })
            ]
          }),
          createDOMElement({
            tag: "div",
            className: "movie-skeleton-info",
            children: [
              createDOMElement({
                tag: "p",
                className: "movie-skeleton-rate",
                children: [
                  createDOMElement({
                    tag: "div",
                    className: "skeleton_loading",
                    children: [
                      createDOMElement({
                        tag: "div",
                        className: "skeleton_img"
                      })
                    ]
                  })
                ]
              }),
              createDOMElement({
                tag: "strong",
                className: "movie-skeleton-title",
                children: [
                  createDOMElement({
                    tag: "div",
                    className: "skeleton_loading",
                    children: [
                      createDOMElement({
                        tag: "div",
                        className: "skeleton_img"
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );
  });
  container.appendChild(fragment);
};
const hideSkeletons = () => {
  const skeletons = $all(".movie-skeleton");
  skeletons.forEach((skeleton) => {
    skeleton.remove();
  });
};
const initMovies = async () => {
  bannerSkeletons();
  movieListSkeletons();
  const params = {
    page: "1",
    language: "ko-KR"
  };
  const movies = await getPopularMovies(params);
  return movies;
};
const getSearchMovies = async (params) => {
  try {
    const movies = await getAppClient("/search/movie", params);
    if (movies.results.length === 0) {
      throw Error(ERROR.NO_SEARCH_RESULTS);
    }
    const convertMovies = { ...movies, results: movies.results.map(convertMovieData) };
    return convertMovies;
  } catch (error) {
    if (error instanceof Error) {
      errorUi(error.message);
    }
  }
};
function Button({ text, onClick, id, className }) {
  return createDOMElement({
    className,
    tag: "button",
    textContent: text,
    event: onClick ? { click: onClick } : void 0,
    attributes: {
      id
    }
  });
}
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_IMAGE_URL = "https://placehold.co/200x300?text=No+Image";
const INITIAL_PAGE = 1;
const STORAGE_KEY = "moviesRate";
const RATING_COMMENTS = {
  0: "평가해주세요",
  2: "최악이예요",
  4: "별로예요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const convertMovieDetailData = (raw) => {
  return {
    id: raw.id,
    posterPath: raw.posterPath,
    title: raw.title,
    voteAverage: raw.voteAverage,
    overview: raw.overview,
    genres: raw.genres,
    releaseDate: raw.releaseDate
  };
};
const getMovieDetail = async (params, movieId) => {
  try {
    const movies = await getAppClient(`/movie/${movieId}`, params);
    const convertMovies = convertMovieDetailData(movies);
    return convertMovies;
  } catch (error) {
    if (error instanceof Error) {
      errorUi(error.message);
    }
  }
};
const storageHandler = {
  getItem: (storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? "[]") || [],
  setItem: (storageKey, value) => localStorage.setItem(storageKey, JSON.stringify(value)),
  isFindItem: (storageKey, id) => {
    const data = storageHandler.getItem(storageKey);
    const item = data.filter((item2) => item2.id === id);
    if (item.length > 0) {
      return { rate: item[0].rate, status: true };
    }
    return { rate: 0, status: false };
  },
  addItem: (storageKey, value) => {
    const data = storageHandler.getItem(storageKey);
    storageHandler.setItem(storageKey, [...data, value]);
  },
  updateRate: (storageKey, movies) => {
    const data = storageHandler.getItem(storageKey);
    const updateData = data.map((item) => {
      if (item.id === movies.id) {
        movies.rate = movies.rate;
        return movies;
      }
      return item;
    });
    storageHandler.setItem(storageKey, updateData);
  }
};
const localStorageRate = (clickRate) => {
  const idInput = $("#movieId");
  const movieId = idInput.value;
  const result = storageHandler.isFindItem(STORAGE_KEY, Number(movieId));
  if (result.status) {
    storageHandler.updateRate(STORAGE_KEY, { rate: clickRate, id: Number(movieId) });
  } else {
    storageHandler.addItem(STORAGE_KEY, { rate: clickRate, id: Number(movieId) });
  }
};
const renderRate = (id) => {
  const result = storageHandler.isFindItem(STORAGE_KEY, Number(id));
  return result;
};
function Modal(movieDetail) {
  const genre = movieDetail.genres.map((genre2) => genre2.name).join(", ");
  const releaseYear = movieDetail.releaseDate.substring(0, 4);
  const { rate, status } = renderRate(movieDetail.id);
  const ratingComment = RATING_COMMENTS[rate];
  const ratingScore = `(${rate}/10)`;
  return createDOMElement({
    tag: "dialog",
    className: "modal",
    id: "modal",
    children: [
      createDOMElement({
        tag: "button",
        className: "close-modal",
        id: "closeModal",
        children: [
          createDOMElement({
            tag: "img",
            attributes: {
              src: "images/modal_button_close.png",
              alt: "모달 닫기 버튼"
            }
          })
        ]
      }),
      createDOMElement({
        tag: "div",
        className: "modal-container",
        children: [
          createDOMElement({
            tag: "div",
            className: "modal-image",
            children: [
              createDOMElement({
                tag: "img",
                id: "movieDetailPoster",
                attributes: {
                  src: `https://image.tmdb.org/t/p/original/${movieDetail.posterPath}`,
                  alt: `${movieDetail.title} 포스터 이미지`
                }
              })
            ]
          }),
          createDOMElement({
            tag: "div",
            className: "modal-description",
            children: [
              createDOMElement({
                tag: "h2",
                id: "movieDetailTitle",
                textContent: movieDetail.title
              }),
              createDOMElement({
                tag: "p",
                className: "category",
                id: "movieDetailGenres",
                textContent: `${releaseYear} · ${genre}`
              }),
              createDOMElement({
                tag: "p",
                className: "rate",
                children: [
                  createDOMElement({
                    tag: "span",
                    className: "average-title",
                    textContent: "평균"
                  }),
                  createDOMElement({
                    tag: "img",
                    className: "star",
                    attributes: {
                      src: "images/star_filled.png"
                    }
                  }),
                  createDOMElement({
                    tag: "span",
                    className: "average-score",
                    id: "movieAverage",
                    textContent: movieDetail.voteAverage.toFixed(1).toString()
                  })
                ]
              }),
              createDOMElement({
                tag: "div",
                className: "my-rate-box",
                children: [
                  createDOMElement({
                    tag: "b",
                    className: "rate-title",
                    textContent: "내 별점"
                  }),
                  createDOMElement({
                    tag: "form",
                    className: "rate-form",
                    id: "rateForm",
                    children: [
                      createDOMElement({
                        tag: "input",
                        id: "movieId",
                        attributes: {
                          type: "hidden",
                          name: "movieId",
                          value: movieDetail.id.toString()
                        }
                      }),
                      createRateStars(rate, status),
                      createDOMElement({
                        tag: "div",
                        className: "rate-score",
                        children: [
                          createDOMElement({
                            tag: "b",
                            id: "rateScoreText",
                            textContent: ratingComment
                          }),
                          createDOMElement({
                            tag: "p",
                            id: "rateScore",
                            textContent: ratingScore
                          })
                        ]
                      })
                    ],
                    event: { click: changeStarState }
                  })
                ]
              }),
              createDOMElement({
                tag: "div",
                className: "detail-box",
                children: [
                  createDOMElement({
                    tag: "b",
                    className: "plot-title",
                    textContent: "줄거리"
                  }),
                  createDOMElement({
                    tag: "p",
                    className: "detail",
                    id: "plot",
                    textContent: movieDetail.overview ? movieDetail.overview : "줄거리가 없습니다."
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}
const createRateStars = (rate, status) => {
  const starsBox = document.createElement("div");
  starsBox.classList.add("rate-box");
  Array.from({ length: 5 }, (_, i) => {
    const starRate = (i + 1) * 2;
    const fill = status && starRate <= rate ? "fill-star" : "";
    const label = document.createElement("label");
    label.innerHTML = `<svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg" class="${fill}">
<path d="M16.5514 24.0789L22.8558 28.0731C23.6617 28.5837 24.6622 27.8243 24.4231 26.8836L22.6016 19.7183C22.5503 19.5188 22.5564 19.3088 22.6191 19.1125C22.6819 18.9162 22.7987 18.7417 22.9563 18.6089L28.6097 13.9034C29.3525 13.2851 28.9691 12.0523 28.0147 11.9904L20.6318 11.5112C20.4329 11.497 20.2422 11.4266 20.0818 11.3082C19.9214 11.1898 19.7979 11.0283 19.7258 10.8424L16.9722 3.90828C16.8974 3.71101 16.7643 3.54117 16.5906 3.42133C16.417 3.30149 16.211 3.2373 16 3.2373C15.789 3.2373 15.583 3.30149 15.4094 3.42133C15.2357 3.54117 15.1026 3.71101 15.0278 3.90828L12.2742 10.8424C12.2021 11.0283 12.0786 11.1898 11.9182 11.3082C11.7578 11.4266 11.5671 11.497 11.3682 11.5112L3.98525 11.9904C3.03087 12.0523 2.64746 13.2851 3.3903 13.9034L9.04371 18.6089C9.20126 18.7417 9.31813 18.9162 9.38088 19.1125C9.44362 19.3088 9.4497 19.5188 9.39841 19.7183L7.70918 26.3634C7.42222 27.4922 8.62287 28.4034 9.58991 27.7907L15.4486 24.0789C15.6134 23.974 15.8047 23.9183 16 23.9183C16.1953 23.9183 16.3866 23.974 16.5514 24.0789V24.0789Z" stroke="#FFC700" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "rateInput";
    radioInput.value = `${starRate}`;
    label.appendChild(radioInput);
    starsBox.appendChild(label);
  });
  return starsBox;
};
const changeStarState = (e) => {
  var _a;
  const target = e.target;
  if (target instanceof HTMLInputElement) {
    const currentRate = Number(target.value) || 0;
    const rateStars = (_a = e.currentTarget) == null ? void 0 : _a.querySelectorAll(
      'input[name="rateInput"]'
    );
    localStorageRate(currentRate);
    rateStars == null ? void 0 : rateStars.forEach((star) => {
      var _a2, _b;
      if (parseInt(star.value, 10) <= currentRate) {
        (_a2 = star.previousElementSibling) == null ? void 0 : _a2.classList.add("fill-star");
      } else {
        (_b = star.previousElementSibling) == null ? void 0 : _b.classList.remove("fill-star");
      }
    });
    const rateScoreTextElement = $("#rateScoreText");
    if (rateScoreTextElement) {
      rateScoreTextElement.textContent = RATING_COMMENTS[currentRate];
    }
    const rateScoreElement = $("#rateScore");
    if (rateScoreElement) {
      rateScoreElement.textContent = `(${currentRate}/10)`;
    }
  }
};
const loadingSpinner = () => {
  return createDOMElement({
    tag: "div",
    className: "orbit-spinner",
    children: [
      createDOMElement({
        tag: "div",
        className: "planet"
      }),
      createDOMElement({
        tag: "div",
        className: "orbit",
        children: [
          createDOMElement({
            tag: "div",
            className: "satellite satellite-1"
          }),
          createDOMElement({
            tag: "div",
            className: "satellite satellite-2"
          })
        ]
      })
    ]
  });
};
const modalSkeletons = () => {
  const header = $("#wrap");
  if (!header) return;
  const fragment = document.createDocumentFragment();
  fragment.appendChild(
    createDOMElement({
      tag: "div",
      className: "modal-skeleton",
      children: [
        loadingSpinner(),
        createDOMElement({
          tag: "div",
          className: "skeleton_loading--dark",
          children: [
            createDOMElement({
              tag: "div",
              className: "skeleton_img"
            })
          ]
        })
      ]
    })
  );
  header.prepend(fragment);
};
const hideModalSkeletons = () => {
  const skeletons = $all(".modal-skeleton");
  skeletons.forEach((skeleton) => {
    skeleton.remove();
  });
};
function waitForImageLoad(img) {
  return new Promise((resolve) => {
    if (img.complete) resolve();
    else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}
const renderModal = async (movieDetail) => {
  var _a;
  const modal = Modal(movieDetail);
  const poster = modal.querySelector("#movieDetailPoster");
  modalSkeletons();
  await waitForImageLoad(poster);
  document.body.appendChild(modal);
  modal.showModal();
  hideModalSkeletons();
  modal == null ? void 0 : modal.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      modal == null ? void 0 : modal.close();
      modal.remove();
    }
  });
  modal == null ? void 0 : modal.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      modal == null ? void 0 : modal.close();
      modal.remove();
    }
  });
  (_a = $("#closeModal")) == null ? void 0 : _a.addEventListener("click", () => {
    modal == null ? void 0 : modal.close();
    modal.remove();
  });
};
const handleMovieDetail = async (id) => {
  const params = {
    language: "ko-KR"
  };
  const movieDetail = await getMovieDetail(params, id);
  if (movieDetail) {
    renderModal(movieDetail);
  }
};
function Banner({ movie }) {
  const { backdropPath, voteAverage, title, id } = movie;
  return createDOMElement({
    tag: "header",
    children: [
      createDOMElement({
        tag: "div",
        className: "background-container",
        children: [BackDrop({ backDropUrl: backdropPath }), TopRatedMovie({ voteAverage, title, id })]
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
function TopRatedMovie({ voteAverage, title, id }) {
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
                textContent: voteAverage.toFixed(1)
              })
            ]
          }),
          createDOMElement({
            tag: "div",
            className: "title",
            textContent: title
          }),
          Button({
            text: "자세히보기",
            id: "bannerMovieButton",
            className: "primary",
            onClick: () => handleMovieDetail(id)
          })
        ]
      })
    ]
  });
}
const renderBanner = async (movies) => {
  const wrap = $("#wrap");
  const hasBackdropMovies = movies.filter((movie) => movie.backdropPath !== null);
  const bannerMovie = hasBackdropMovies.length ? hasBackdropMovies[0] : movies[0];
  wrap == null ? void 0 : wrap.prepend(Banner({ movie: bannerMovie }));
};
const removeBanner = () => {
  const banner = document.querySelector("header");
  banner == null ? void 0 : banner.remove();
  const main = document.querySelector("main");
  if (!main) return;
  main.classList.add("search-movie-main");
};
function Movie({ movie }) {
  const posterPath = movie.posterPath ? IMAGE_BASE_URL + "/w440_and_h660_face/" + movie.posterPath : DEFAULT_IMAGE_URL;
  return createDOMElement({
    tag: "li",
    className: "item",
    attributes: { tabIndex: "0", role: "button" },
    children: [
      createDOMElement({
        tag: "img",
        className: "thumbnail",
        attributes: {
          src: posterPath,
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
                textContent: movie.voteAverage.toFixed(1)
              })
            ]
          }),
          createDOMElement({
            tag: "strong",
            textContent: movie.title
          })
        ]
      })
    ],
    event: {
      click: () => {
        handleMovieDetail(movie.id);
      },
      keydown: (e) => {
        const keyboardEvent = e;
        if (keyboardEvent.code === "Enter") {
          handleMovieDetail(movie.id);
        }
      }
    }
  });
}
const searchAddMovies = async (page, keyword) => {
  const params = {
    page: page.toString(),
    language: "ko-KR",
    include_adult: "false",
    query: keyword
  };
  const response = await getSearchMovies(params);
  return response;
};
const popularAddMovies = async (page) => {
  const params = {
    page: page.toString(),
    language: "ko-KR"
  };
  const response = await getPopularMovies(params);
  return response;
};
const addMovies = async (page, keyword) => {
  const response = keyword ? await searchAddMovies(page, keyword) : await popularAddMovies(page);
  const fragment = document.createDocumentFragment();
  await (response == null ? void 0 : response.results.forEach((movie) => {
    fragment.appendChild(Movie({ movie }));
  }));
  return fragment;
};
function createInfiniteScrollHandler(initialKeyword = "", totalPages) {
  let currentPage = 2;
  let isLoading = false;
  let isEnd = false;
  let keyword = initialKeyword;
  const sentinel = document.getElementById("sentinel");
  const container = $(".thumbnail-list");
  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (!entry.isIntersecting || isLoading || isEnd) return;
      isLoading = true;
      movieListSkeletons();
      try {
        if (currentPage > totalPages) {
          isEnd = true;
          observer.unobserve(sentinel);
          return;
        }
        const fragment = await addMovies(currentPage, keyword);
        container == null ? void 0 : container.appendChild(fragment);
        currentPage++;
      } catch (error) {
        console.error("무한 스크롤 중 에러:", error);
      } finally {
        hideSkeletons();
        isLoading = false;
      }
    },
    {
      rootMargin: "100px"
    }
  );
  if (sentinel) observer.observe(sentinel);
  return {
    reset(newKeyword) {
      currentPage = 2;
      isLoading = false;
      isEnd = false;
      keyword = newKeyword;
    },
    destroy() {
      observer.disconnect();
    }
  };
}
let scrollHandler;
const renderMovieList = async (response, keyword) => {
  var _a, _b;
  const movieTitle = $("#movieKindTitle");
  const movieTitleText = keyword ? `"${keyword}" 검색 결과` : "지금 인기 있는 영화";
  if (movieTitle) {
    movieTitle.textContent = movieTitleText;
  }
  if (!response) return;
  const { results, totalPages, totalResults } = response;
  movieListSkeletons();
  const movieList = $(".thumbnail-list");
  const fragment = document.createDocumentFragment();
  results.map((movie) => fragment.appendChild(Movie({ movie })));
  movieList == null ? void 0 : movieList.appendChild(fragment);
  if (!movieList) {
    const newMovieList = createDOMElement({
      tag: "ul",
      className: "thumbnail-list"
    });
    (_a = $(".container")) == null ? void 0 : _a.appendChild(newMovieList);
    newMovieList == null ? void 0 : newMovieList.appendChild(fragment);
    (_b = $(".error-ui")) == null ? void 0 : _b.remove();
  }
  hideSkeletons();
  if (scrollHandler) {
    scrollHandler.destroy();
  }
  if (INITIAL_PAGE < totalPages && totalResults > 20) {
    scrollHandler = createInfiniteScrollHandler(keyword ?? "", totalPages);
  }
};
function SearchBar() {
  return createDOMElement({
    tag: "form",
    id: "searchForm",
    className: "search-form",
    children: [
      createDOMElement({
        tag: "input",
        attributes: { placeholder: "검색어를 입력하세요", type: "text", name: "keyword", required: "true" }
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
const handleSearchMovies = async (e) => {
  e.preventDefault();
  removeBanner();
  const movieList = $(".thumbnail-list");
  movieList == null ? void 0 : movieList.replaceChildren();
  movieListSkeletons();
  const form = $("#searchForm");
  if (form) {
    const keyword = form.keyword.value;
    const params = {
      page: "1",
      language: "ko-KR",
      include_adult: "false",
      query: keyword
    };
    const response = await getSearchMovies(params);
    renderMovieList(response, keyword);
  }
  hideSkeletons();
};
function Header() {
  return createDOMElement({
    tag: "div",
    className: "logo",
    children: [
      createDOMElement({
        tag: "a",
        className: "logo-img",
        attributes: {
          href: "/javascript-movie-review"
        },
        children: [
          createDOMElement({
            tag: "img",
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
const renderHeader = () => {
  const wrap = $("#wrap");
  const header = Header();
  wrap == null ? void 0 : wrap.prepend(header);
  hideBannerSkeletons();
};
function Footer() {
  return createDOMElement({
    tag: "footer",
    className: "footer",
    children: [
      createDOMElement({
        tag: "p",
        textContent: "© 우아한테크코스 All Rights Reserved."
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
const renderFooter = () => {
  const wrap = $("#wrap");
  if (!wrap) return;
  const footer = Footer();
  wrap.appendChild(footer);
};
addEventListener("DOMContentLoaded", async () => {
  const movies = await initMovies();
  renderHeader();
  if ((movies == null ? void 0 : movies.results.length) > 0) {
    renderBanner(movies.results);
    renderMovieList(movies);
  }
  renderFooter();
});
