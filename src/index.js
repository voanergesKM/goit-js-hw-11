import PixabayAPI from './js/pixabay-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import makeMarkupEl from './js/markup';

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
  refs.loadMoreBtn.classList.add('is-hidden');

  await fetchImages();
  await smoothScroll();
}

async function fetchImages() {
  try {
    const dataFetch = await pixabay.fetchImages();
    await markup(dataFetch);
  } catch (error) {
    console.log(error);
  }

  await lightbox.refresh();
}

function markup(data) {
  if (!data) {
    hideLoadMoreBtn();
    return;
  } else {
    const markup = data.hits.map(makeMarkupEl).join('');
    refs.galleryEl.insertAdjacentHTML('beforeend', markup);
    showLoadMoreBtn();
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
