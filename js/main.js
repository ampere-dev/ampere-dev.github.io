document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js is running on this page!'); // Debugging

  // ==================== Mobile Menu Toggler ====================
  const menuToggler = document.querySelector('.menuToggler');
  const header = document.querySelector('#header');

  if (menuToggler && header) {
    // Toggle menu on click
    menuToggler.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent immediate close from outside click
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

    // Close menu when clicking any nav link (great for mobile UX)
    header.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggler.classList.remove('active');
        header.classList.remove('active');
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('active')) {
        menuToggler.classList.remove('active');
        header.classList.remove('active');
      }
    });

    console.log('Mobile menu toggler initialized');
  } else {
    console.warn('Menu toggler or header element not found');
  }

  // ==================== TOC Active Highlight on Scroll ====================
  const tocLinks = document.querySelectorAll('.toc_list.ex2 a');
  const sections = document.querySelectorAll('h2[id]');

  if (tocLinks.length && sections.length) {
    const onScroll = () => {
      let current = '';

      // Find the section closest to the top of the viewport
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Adjust offset based on your header height (e.g., 150px if header is tall)
        if (window.pageYOffset >= sectionTop - 150) {
          current = section.getAttribute('id');
        }
      });

      // Update active class on matching TOC link
      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', onScroll);
    // Run once on load to highlight current section
    onScroll();
    console.log('TOC active highlighting initialized');
  } else {
    console.warn('TOC links or h2 sections not found');
  }
});