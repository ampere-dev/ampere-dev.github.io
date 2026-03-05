document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js is running on this page!');

  // ==================== Mobile Menu Toggler ====================
  const menuToggler = document.querySelector('.menuToggler');
  const header      = document.querySelector('#header');

  if (menuToggler && header) {
    // Ensure it's a button (semantic + accessible)
    if (menuToggler.tagName !== 'BUTTON') {
      console.warn('menuToggler should be a <button> element for best accessibility');
    }

    // Set initial ARIA (important for screen readers)
    menuToggler.setAttribute('aria-expanded', 'false');
    menuToggler.setAttribute('aria-controls', 'header');

    const toggleMenu = (shouldOpen) => {
      const isOpen = shouldOpen !== undefined ? shouldOpen : !header.classList.contains('active');

      menuToggler.classList.toggle('active', isOpen);
      header.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);

      // ARIA
      menuToggler.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (isOpen) {
        // Move focus to first link for keyboard users
        const firstLink = header.querySelector('a[href]');
        if (firstLink) firstLink.focus();
      } else {
        // Return focus to toggler when closing
        menuToggler.focus();
      }
    };

    // Toggle on click
    menuToggler.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent document click from immediately closing
      toggleMenu();
    });

    // Close when clicking outside (backdrop or page content)
    document.addEventListener('click', (e) => {
      if (header.classList.contains('active') &&
          !menuToggler.contains(e.target) &&
          !header.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close when clicking any nav link
    header.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('active')) {
        toggleMenu(false);
      }
    });

    console.log('Mobile menu toggler initialized with ARIA & scroll lock');
  } else {
    console.warn('Menu toggler or header element not found');
  }

  // ==================== TOC Active Highlight on Scroll ====================
  const tocLinks = document.querySelectorAll('.toc_list.ex2 a');
  const sections = document.querySelectorAll('h2[id]');

  if (tocLinks.length && sections.length) {
    const onScroll = () => {
      let current = '';

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Adjust this value based on your fixed header height (if any)
        if (window.pageYOffset >= sectionTop - 150) {
          current = section.getAttribute('id');
        }
      });

      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true }); // Better perf
    onScroll(); // Initial call
    console.log('TOC active highlighting initialized');
  } else {
    console.warn('TOC links or h2 sections not found');
  }
});