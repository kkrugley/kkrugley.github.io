document.addEventListener('DOMContentLoaded', function() {
    const mainImage = document.querySelector('.main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        mainImage.src = thumbnail.src;
      });
    });
  });

var currentYear = new Date().getFullYear();
document.getElementById("currentYear").textContent = currentYear;