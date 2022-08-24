import PixabayAPI from './js/pixabay-api';
import makeMarkupEl from './js/markup';
import Notiflix from 'notiflix';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const pixabay = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.more__btn'),
};

refs.formEl.addEventListener('submit', onSearchSubmit);
refs.loadMoreBtn.addEventListener('click', onMoreBtnClick);

async function onSearchSubmit(evt) {
  evt.preventDefault();

  refs.galleryEl.innerHTML = '';
  pixabay.resetPage();

  pixabay.query = evt.currentTarget.elements.searchQuery.value;

  await fetchImages();

  if (evt.currentTarget) {
    evt.currentTarget.reset();
  }
}

async function onMoreBtnClick() {
  refs.loadMoreBtn.setAttribute('disabled', '');

  await fetchImages();

  await refs.loadMoreBtn.removeAttribute('disabled');

  await smoothScroll();
}

function markup(data) {
  if (!data) {
    refs.loadMoreBtn.classList.add('visually-hidden');
    return;
  } else {
    try {
      const markup = data.hits.map(makeMarkupEl).join('');
      refs.galleryEl.insertAdjacentHTML('beforeend', markup);
      refs.loadMoreBtn.classList.remove('visually-hidden');
    } catch (error) {
      console.log(error);
    }
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

async function fetchImages() {
  const dataFetch = await pixabay.fetchImages();
  await markup(dataFetch);
  await lightbox.refresh();
}
