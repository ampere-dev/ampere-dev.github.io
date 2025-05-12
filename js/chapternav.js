document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.chapternav-scroll');
    const leftArrow = document.querySelector('.chapternav-arrow-left');
    const rightArrow = document.querySelector('.chapternav-arrow-right');
    const scrollAmount = 90; /* Matches item width */

    /* Check if content overflows and toggle arrows */
    function toggleArrows() {
        const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth;
        leftArrow.style.display = hasOverflow ? 'block' : 'none';
        rightArrow.style.display = hasOverflow ? 'block' : 'none';
        updateArrowStates(); /* Update disabled state */
    }

    /* Update button states based on scroll position */
    function updateArrowStates() {
        leftArrow.disabled = scrollContainer.scrollLeft <= 0;
        rightArrow.disabled = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;
    }

    /* Initial check */
    toggleArrows();
    updateArrowStates();

    /* Scroll left */
    leftArrow.addEventListener('click', () => {
        scrollContainer.scrollLeft -= scrollAmount;
    });

    /* Scroll right */
    rightArrow.addEventListener('click', () => {
        scrollContainer.scrollLeft += scrollAmount;
    });

    /* Update on scroll */
    scrollContainer.addEventListener('scroll', updateArrowStates);

    /* Recheck overflow on window resize */
    window.addEventListener('resize', toggleArrows);
});
