document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.chapternav');
    const leftArrow = document.querySelector('.chapternav-arrow-left');
    const rightArrow = document.querySelector('.chapternav-arrow-right');

    // Early exit if critical elements are missing
    if (!scrollContainer || !leftArrow || !rightArrow) {
        console.warn('Chapter nav controls not found in DOM');
        return;
    }

    let scrollAmount = 90; // fallback

    // Dynamically calculate scroll amount based on first item + gap
    function updateScrollAmount() {
        const firstItem = scrollContainer.querySelector('.chapternav-item');
        if (firstItem) {
            const itemWidth = firstItem.offsetWidth;
            const computedStyle = getComputedStyle(scrollContainer);
            const gap = parseFloat(computedStyle.gap) || 20;
            scrollAmount = itemWidth + gap; // scroll one full item + gap
        }
    }

    function toggleArrows() {
        const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth + 1; // +1 for subpixel rounding
        leftArrow.style.display = hasOverflow ? 'block' : 'none';
        rightArrow.style.display = hasOverflow ? 'block' : 'none';
        updateArrowStates();
    }

    function updateArrowStates() {
        const atStart = scrollContainer.scrollLeft <= 0;
        const atEnd = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;

        leftArrow.disabled = atStart;
        rightArrow.disabled = atEnd;

        // Optional: visual feedback beyond disabled
        leftArrow.style.opacity = atStart ? '0.4' : '1';
        rightArrow.style.opacity = atEnd ? '0.4' : '1';
    }

    // Scroll functions with smooth behavior
    function scrollLeft() {
        if (!leftArrow.disabled) {
            scrollContainer.scrollTo({
                left: scrollContainer.scrollLeft - scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    function scrollRight() {
        if (!rightArrow.disabled) {
            scrollContainer.scrollTo({
                left: scrollContainer.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    // Attach listeners
    leftArrow.addEventListener('click', scrollLeft);
    rightArrow.addEventListener('click', scrollRight);

    scrollContainer.addEventListener('scroll', updateArrowStates);

    // Handle resize (with simple debounce)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateScrollAmount();
            toggleArrows();
        }, 150);
    });

    // Initial setup
    updateScrollAmount();
    toggleArrows();
    updateArrowStates();
});