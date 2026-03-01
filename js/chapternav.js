document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.chapternav');
    const leftArrow       = document.querySelector('.chapternav-arrow-left');
    const rightArrow      = document.querySelector('.chapternav-arrow-right');

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
        const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth + 1;
        leftArrow.style.display = hasOverflow ? 'block' : 'none';
        rightArrow.style.display = hasOverflow ? 'block' : 'none';
        updateArrowStates();
    }

    function updateArrowStates() {
        const atStart = scrollContainer.scrollLeft <= 0;
        const atEnd   = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;

        leftArrow.disabled = atStart;
        rightArrow.disabled = atEnd;

        leftArrow.style.opacity   = atStart ? '0.4' : '1';
        rightArrow.style.opacity  = atEnd  ? '0.4' : '1';
    }

    // Scroll functions
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

    // ───────────────────────────────────────────────
    // Justification logic (center short lists, left-align long ones)
    function updateJustification() {
        const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth + 1;
        if (hasOverflow) {
            scrollContainer.style.justifyContent = 'flex-start';
            scrollContainer.scrollLeft = 0;
        } else {
            scrollContainer.style.justifyContent = 'center';
        }
    }

    // ───────────────────────────────────────────────
    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateScrollAmount();
            updateJustification();
            toggleArrows();
            updateArrowStates(); // good measure after resize
        }, 150);
    };

    window.addEventListener('resize', handleResize);

    // ───────────────────────────────────────────────
    // Initial setup
    updateScrollAmount();
    toggleArrows();
    updateArrowStates();
    updateJustification();

    // Optional: re-run justification after a tiny delay (helps with late-loading fonts/images)
    setTimeout(updateJustification, 100);
});