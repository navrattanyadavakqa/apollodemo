import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function optimizePicture(picture) {
  const img = picture.querySelector('img');
  if (!img) return;
  const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
    { width: '600' },
    { width: '1200' },
  ]);
  moveInstrumentation(img, optimizedPic.querySelector('img'));
  picture.replaceWith(optimizedPic);
}

function moveRowContent(row, target) {
  const cell = row.querySelector(':scope > div') || row;
  moveInstrumentation(row, target);
  if (cell !== row) moveInstrumentation(cell, target);
  target.append(...cell.childNodes);
}

function decorateDetails(row) {
  const details = document.createElement('div');
  details.className = 'product-details';
  moveRowContent(row, details);

  const heading = details.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('product-title');

  const paragraphs = [...details.querySelectorAll('p')];
  if (paragraphs[0]) paragraphs[0].classList.add('product-id');
  if (paragraphs.length > 1) {
    paragraphs[paragraphs.length - 1].classList.add('product-price');
  }
  if (paragraphs.length > 2) {
    paragraphs.slice(1, -1).forEach((p) => p.classList.add('product-description'));
  } else if (paragraphs[1]) {
    paragraphs[1].classList.add('product-description');
  }

  return details;
}

function createCarouselButton(label, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

function setupCarousel(carousel) {
  const track = carousel.querySelector('.product-carousel-track');
  const slides = [...carousel.querySelectorAll('.product-carousel-slide')];
  const prev = carousel.querySelector('.product-carousel-prev');
  const next = carousel.querySelector('.product-carousel-next');
  const dots = carousel.querySelector('.product-carousel-dots');

  if (slides.length <= 1) {
    carousel.classList.add('product-carousel-single');
    return;
  }

  let activeIndex = 0;

  const goTo = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== activeIndex);
    });
    dots.querySelectorAll('button').forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === activeIndex);
      dot.tabIndex = i === activeIndex ? 0 : -1;
    });
  };

  prev.addEventListener('click', () => goTo(activeIndex - 1));
  next.addEventListener('click', () => goTo(activeIndex + 1));

  dots.querySelectorAll('button').forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
    if (e.key === 'ArrowRight') goTo(activeIndex + 1);
  });

  goTo(0);
}

function buildCarousel(slides) {
  const carousel = document.createElement('div');
  carousel.className = 'product-carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Product images');
  carousel.tabIndex = 0;

  const viewport = document.createElement('div');
  viewport.className = 'product-carousel-viewport';

  const track = document.createElement('div');
  track.className = 'product-carousel-track';

  slides.forEach((slide, index) => {
    slide.classList.add('product-carousel-slide');
    slide.setAttribute('aria-hidden', index !== 0);
    track.append(slide);
  });

  viewport.append(track);
  carousel.append(viewport);

  if (slides.length > 1) {
    carousel.append(
      createCarouselButton('Previous image', 'product-carousel-prev'),
      createCarouselButton('Next image', 'product-carousel-next'),
    );

    const dots = document.createElement('div');
    dots.className = 'product-carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Choose product image');

    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'product-carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', slide.querySelector('img')?.alt || `Image ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0);
      dot.tabIndex = index === 0 ? 0 : -1;
      dots.append(dot);
    });

    carousel.append(dots);
  }

  setupCarousel(carousel);
  return carousel;
}

/**
 * loads and decorates the product block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const layout = document.createElement('div');
  layout.className = 'product-layout';

  const slides = [];
  const detailsFragments = [];

  rows.forEach((row) => {
    const picture = row.querySelector('picture');
    if (picture) {
      optimizePicture(picture);
      const figure = document.createElement('figure');
      moveRowContent(row, figure);
      slides.push(figure);
      return;
    }

    detailsFragments.push(decorateDetails(row));
  });

  if (slides.length) {
    layout.append(buildCarousel(slides));
  }

  layout.append(...detailsFragments);
  block.replaceChildren(layout);
}
