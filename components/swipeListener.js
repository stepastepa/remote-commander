export function swipeListener(onSwipeLeft, onSwipeRight) {
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
  }

  function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipeGesture();
  }

  function handleSwipeGesture() {
    const swipeThreshold = 50; // минимальная дистанция для свайпа

    if (touchEndX < touchStartX - swipeThreshold) {
      // Свайп влево
      if (typeof onSwipeLeft === 'function') {
        onSwipeLeft();
      }
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Свайп вправо
      if (typeof onSwipeRight === 'function') {
        onSwipeRight();
      }
    }
  }

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  // Можно вернуть функцию для отключения слушателей
  return function removeSwipeListener() {
    document.removeEventListener('touchstart', handleTouchStart, false);
    document.removeEventListener('touchend', handleTouchEnd, false);
  };
}


// использование:
/*
import { swipeListener } from './swipeListener.js';

const stopListening = swipeListener(
  () => console.log('Свайп влево!'),
  () => console.log('Свайп вправо!')
);

// Чтобы потом отключить:
stopListening();
*/