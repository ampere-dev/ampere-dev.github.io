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
// Pagination – FIXED VERSION
// ────────────────────────────────────────────────
const articlesPerPage = 5;
let currentPage = 1;

const urlParams = new URLSearchParams(window.location.search);
const pageFromUrl = parseInt(urlParams.get('page'), 10);
if (!isNaN(pageFromUrl) && pageFromUrl >= 1) {
    currentPage = pageFromUrl;
}

function setupPagination() {
    const allPosts = Array.from(document.querySelectorAll('article'));
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

        document.querySelectorAll('.page-number').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.page) === page);
        });

        prevBtn.disabled = (page === 1);
        nextBtn.disabled = (page === totalPages || totalPages === 0);

        prevBtn.setAttribute('aria-disabled', page === 1 ? 'true' : 'false');
        nextBtn.setAttribute('aria-disabled', (page === totalPages || totalPages === 0) ? 'true' : 'false');

        const url = new URL(window.location);
        if (page === 1) {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page);
        }
        window.history.replaceState(null, '', url);
    }

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
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        prevBtn.setAttribute('aria-disabled', 'true');
        nextBtn.setAttribute('aria-disabled', 'true');
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayArticles(currentPage);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayArticles(currentPage);
        }
    });

    allPosts.forEach(article => article.classList.remove('hidden'));
    displayArticles(currentPage);
}

document.addEventListener('DOMContentLoaded', setupPagination);