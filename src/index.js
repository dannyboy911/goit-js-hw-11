import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '45012437-b55626f190d71cd0f0306418b';
const BASE_URL = 'https://pixabay.com/api/';
let currentPage = 1;
let searchQuery = '';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function fetchImages(query, page) {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: false,
    page: page,
    per_page: 40,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure('An error occurred while fetching images');
  }
}

function renderImages(images) {
  const markup = images.map(image => `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes</b> ${image.likes}</p>
        <p class="info-item"><b>Views</b> ${image.views}</p>
        <p class="info-item"><b>Comments</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
               </div>
       </div>
     `).join('');
     gallery.insertAdjacentHTML('beforeend', markup);
     lightbox.refresh();
   }

   function clearGallery() {
     gallery.innerHTML = '';
   }

   function onSearch(event) {
     event.preventDefault();
     searchQuery = event.currentTarget.elements.searchQuery.value.trim();
     if (!searchQuery) {
       Notiflix.Notify.failure('Please enter a search query');
       return;
     }
     currentPage = 1;
     clearGallery();
     fetchAndRenderImages();
   }

   async function fetchAndRenderImages() {
     const data = await fetchImages(searchQuery, currentPage);
     if (data.hits.length === 0) {
       Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
       loadMoreBtn.style.display = 'none';
       return;
     }
     renderImages(data.hits);
     Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
     loadMoreBtn.style.display = 'block';
   }

   async function onLoadMore() {
     currentPage += 1;
     const data = await fetchImages(searchQuery, currentPage);
     renderImages(data.hits);

     const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();
     window.scrollBy({
       top: cardHeight * 2,
       behavior: 'smooth',
     });

     if (currentPage * 40 >= data.totalHits) {
       loadMoreBtn.style.display = 'none';
       Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
     }
   }

   const lightbox = new SimpleLightbox('.gallery a');

