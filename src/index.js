import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PixabayAPI from './js/pixabay-api';
import makeMarkupEl from './js/markup';

const pixabay = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

export const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.more__btn'),
  searchBtn: document.querySelector('button[type="submit"]'),
};

refs.formEl.addEventListener('submit', onSearchSubmit);
refs.loadMoreBtn.addEventListener('click', onMoreBtnClick);

async function onSearchSubmit(evt) {
  evt.preventDefault();

  refs.galleryEl.innerHTML = '';
  pixabay.resetPage();

  pixabay.query = evt.currentTarget.elements.searchQuery.value;

  refs.loadMoreBtn.classList.add('is-hidden');
  refs.searchBtn.classList.add('is-hidden');

  await fetchImages();
  await refs.searchBtn.classList.remove('is-hidden');

  if (evt.currentTarget) {
    evt.currentTarget.reset();
  }
}

async function onMoreBtnClick() {
  refs.loadMoreBtn.classList.add('is-hidden');

  await fetchImages();
  await smoothScroll();
}

async function fetchImages() {
  try {
    const dataFetch = await pixabay.fetchImages();
    await makeMarkup(dataFetch);
  } catch (error) {
    console.log(error);
  }

  await lightbox.refresh();
}

function makeMarkup(data) {
  if (!data) {
    hideLoadMoreBtn();
    return;
  } else if (data.hits.length < 40) {
    markup(data);
    Notify.info(`We're sorry, but you've reached the end of search results.`);
  } else {
    markup(data);
    showLoadMoreBtn();
    console.dir(data);
  }
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function hideLoadMoreBtn() {
  refs.loadMoreBtn.classList.add('visually-hidden');
}

function showLoadMoreBtn() {
  refs.loadMoreBtn.classList.remove('visually-hidden');
  refs.loadMoreBtn.classList.remove('is-hidden');
}

function markup(data) {
  const markup = data.hits.map(makeMarkupEl).join('');
  refs.galleryEl.insertAdjacentHTML('beforeend', markup);
}
