document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js is running on this page!'); // Debugging

  // Initialize Slick carousel
  if (jQuery('.carousel').length) {
    jQuery('.carousel').slick({
      slidesToShow: 3,
      dots: true,
      arrows: true, // Add arrows for navigation
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 500,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    });
  }

  // Menu toggler logic
  const menuToggler = document.querySelector('.menuToggler');
  const header = document.querySelector('#header');

  if (menuToggler && header) {
    menuToggler.addEventListener('click', () => {
      menuToggler.classList.toggle('active');
      header.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuToggler.contains(e.target) && !header.contains(e.target)) {
        menuToggler.classList.remove('active');
        header.classList.remove('active');
      }
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('active')) {
        menuToggler.classList.remove('active');
        header.classList.remove('active');
      }
    });
  }
});
