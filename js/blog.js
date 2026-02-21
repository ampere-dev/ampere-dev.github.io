// js/blog.js

function togglePost(titleElement) {
    const article = titleElement.closest('article');
    const content = article.querySelector('.teaser-content');
    
    if (article.classList.contains('collapsed')) {
        content.style.height = content.scrollHeight + 'px';
        article.classList.remove('collapsed');
    } else {
        content.style.height = content.scrollHeight + 'px';
        setTimeout(() => {
            content.style.height = '0';
        }, 10);
        article.classList.add('collapsed');
    }

    const handler = function() {
        if (!article.classList.contains('collapsed')) {
            content.style.height = 'auto';
        }
        content.removeEventListener('transitionend', handler);
    };
    content.addEventListener('transitionend', handler);
}

// ────────────────────────────────────────────────
// Pagination – FIXED for nested <article> wrappers
// ────────────────────────────────────────────────
const articlesPerPage = 5;
let currentPage = 1;

// Read ?page= from URL
const urlParams = new URLSearchParams(window.location.search);
const pageFromUrl = parseInt(urlParams.get('page'), 10);
if (!isNaN(pageFromUrl) && pageFromUrl >= 1) {
    currentPage = pageFromUrl;
}

function setupPagination() {
    // THIS IS THE KEY FIX — only select real posts
    const allPosts = Array.from(document.querySelectorAll('h2[onclick="togglePost(this)"]'))
                         .map(h2 => h2.closest('article'));

    const totalArticles = allPosts.length;
    const totalPages = Math.ceil(totalArticles / articlesPerPage);

    const pageNumbersContainer = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (!pageNumbersContainer || !prevBtn || !nextBtn) {
        console.warn('Pagination elements not found.');
        return;
    }

    function displayArticles(page) {
        page = Math.max(1, Math.min(page, totalPages || 1));

        const start = (page - 1) * articlesPerPage;
        const end = start + articlesPerPage;

        allPosts.forEach((article, index) => {
            const shouldBeVisible = (index >= start && index < end);
            article.classList.toggle('hidden', !shouldBeVisible);
        });

        // Update active page button
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.page) === page);
        });

        prevBtn.disabled = (page === 1);
        nextBtn.disabled = (page === totalPages || totalPages === 0);

        prevBtn.setAttribute('aria-disabled', page === 1 ? 'true' : 'false');
        nextBtn.setAttribute('aria-disabled', (page === totalPages || totalPages === 0) ? 'true' : 'false');

        // Update URL
        const url = new URL(window.location);
        if (page === 1) url.searchParams.delete('page');
        else url.searchParams.set('page', page);
        window.history.replaceState(null, '', url);
    }

    // Build page buttons
    pageNumbersContainer.innerHTML = '';
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-number';
            btn.dataset.page = i;
            btn.textContent = i;
            btn.setAttribute('aria-label', `Go to page ${i}`);
            btn.addEventListener('click', () => {
                currentPage = i;
                displayArticles(currentPage);
            });
            pageNumbersContainer.appendChild(btn);
        }
    }

    if (totalPages === 0) {
        pageNumbersContainer.innerHTML = '<span>No posts found</span>';
        prevBtn.disabled = nextBtn.disabled = true;
    }

    // Button listeners
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; displayArticles(currentPage); } });
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; displayArticles(currentPage); } });

    // Clean initial state
    allPosts.forEach(article => article.classList.remove('hidden'));

    // Show correct page
    displayArticles(currentPage);
}

document.addEventListener('DOMContentLoaded', setupPagination);