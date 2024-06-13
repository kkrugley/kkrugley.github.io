document.addEventListener('DOMContentLoaded', function() {
  const mainImage = document.querySelector('.main-image');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const modal = document.getElementById("myModal");
  const modalImg = document.getElementById("modalImg");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  let currentIndex = 0;

  // Добавляем обработчики клика на миниатюры
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', function() {
      mainImage.src = thumbnail.src;
      mainImage.dataset.src = thumbnail.src; // Обновляем data-src для главного изображения
      currentIndex = index; // Обновляем текущий индекс
    });
  });

  // Открываем модальное окно с текущим изображением при клике на главное изображение
  mainImage.addEventListener('click', function() {
    modal.style.display = "block";
    modalImg.src = mainImage.dataset.src;
  });

  // Закрываем модальное окно при клике на кнопку закрытия
  const closeBtn = document.getElementsByClassName("close")[0];
  closeBtn.addEventListener('click', function() {
    modal.style.display = "none";
  });

  // Переключение на предыдущее изображение
  prevBtn.addEventListener('click', function() {
    currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    mainImage.src = thumbnails[currentIndex].src;
    mainImage.dataset.src = thumbnails[currentIndex].src;
    modalImg.src = thumbnails[currentIndex].src;
  });

  // Переключение на следующее изображение
  nextBtn.addEventListener('click', function() {
    currentIndex = (currentIndex + 1) % thumbnails.length;
    mainImage.src = thumbnails[currentIndex].src;
    mainImage.dataset.src = thumbnails[currentIndex].src;
    modalImg.src = thumbnails[currentIndex].src;
  });

  // Закрываем модальное окно при клике за его пределами
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Добавляем поддержку свайпа для мобильных устройств
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
  });

  modal.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchEndX < touchStartX) {
      // Swipe left
      nextBtn.click();
    } else if (touchEndX > touchStartX) {
      // Swipe right
      prevBtn.click();
    }
  }

  // Добавляем обработчик клавиатурных событий
  document.addEventListener('keydown', function(event) {
    switch(event.key) {
      case 'ArrowLeft':
        prevBtn.click();
        break;
      case 'ArrowRight':
        nextBtn.click();
        break;
      case 'Escape':
        modal.style.display = "none";
        break;
    }
  });

  // Установка текущего года
  var currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;
});
