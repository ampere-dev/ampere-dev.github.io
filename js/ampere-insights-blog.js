(function () {
    const ARTICLES_PER_PAGE = 10;
    let currentPage = 1;
    let searchTimeout = null;

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function searchPosts() {
        if (!document.querySelector('main')) return;
        const query = sanitizeInput(document.getElementById('search').value.toLowerCase().trim());
        const posts = document.querySelectorAll('.post');
        let hasResults = false;

        const visibleArticles = [];
        posts.forEach(post => {
            const text = post.textContent.toLowerCase();
            const matches = text.includes(query);
            if (matches || query === '') {
                visibleArticles.push(post);
                post.classList.remove('hidden');
                hasResults = true;
            } else {
                post.classList.add('hidden');
            }
        });

        let noResults = document.querySelector('.no-results');
        if (!noResults) {
            noResults = document.createElement('p');
            noResults.className = 'no-results';
            noResults.textContent = 'No results found.';
            document.querySelector('main').appendChild(noResults);
        }
        noResults.style.display = hasResults || query === '' ? 'none' : 'block';

        currentPage = 1;
        setupPagination(visibleArticles);
        updateWordMap();
    }

    function debounceSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchPosts, 300);
    }

    function togglePost(titleElement) {
        const article = titleElement.closest('article');
        const content = article.querySelector('.post-content');
        
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
        
        content.addEventListener('transitionend', function handler() {
            if (!article.classList.contains('collapsed')) {
                content.style.height = 'auto';
            }
            content.removeEventListener('transitionend', handler);
        }, { once: true });
    }

    function setupPagination(visibleArticles = Array.from(document.querySelectorAll('.post'))) {
        const totalArticles = visibleArticles.length;
        const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
        const pageNumbersContainer = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        function displayArticles(page) {
            const start = (page - 1) * ARTICLES_PER_PAGE;
            const end = start + ARTICLES_PER_PAGE;

            document.querySelectorAll('.post').forEach(article => {
                article.classList.add('hidden');
            });

            visibleArticles.forEach((article, index) => {
                if (index >= start && index < end) {
                    article.classList.remove('hidden');
                }
            });

            document.querySelectorAll('.page-number').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.page) === page);
            });

            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages || totalPages === 0;
            prevBtn.setAttribute('aria-disabled', page === 1 ? 'true' : 'false');
            nextBtn.setAttribute('aria-disabled', (page === totalPages || totalPages === 0) ? 'true' : 'false');
        }

        pageNumbersContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number';
            pageBtn.dataset.page = i;
            pageBtn.textContent = i;
            pageBtn.setAttribute('aria-label', `Page ${i}`);
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayArticles(currentPage);
            });
            pageNumbersContainer.appendChild(pageBtn);
        }

        if (totalPages === 0) {
            pageNumbersContainer.innerHTML = '';
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

        displayArticles(currentPage);
    }

    function updateWordMap() {
        const wordMapContainer = document.getElementById('word-map');
        const articles = Array.from(document.querySelectorAll('.post:not(.hidden)'));
        const maxWords = 20;

        const wordCounts = {};
        const wordToArticles = {};

        articles.forEach(article => {
            const tags = article.dataset.tags ? article.dataset.tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
            const titleElement = article.querySelector('h2 a');
            const title = titleElement?.textContent || '';
            const link = titleElement?.getAttribute('href') || '';

            if (!title || !link || link.trim() === '') {
                console.warn('Invalid article data:', { title, link, article });
                return;
            }

            tags.forEach(tag => {
                const words = tag.split(/\s+/);
                words.forEach(word => {
                    if (!wordCounts[word]) {
                        wordCounts[word] = 0;
                        wordToArticles[word] = [];
                    }
                    wordCounts[word]++;
                    if (!wordToArticles[word].some(a => a.link === link)) {
                        wordToArticles[word].push({ title, link });
                    }
                });
            });
        });

        const sortedWords = Object.keys(wordCounts)
            .sort((a, b) => wordCounts[b] - wordCounts[a])
            .slice(0, maxWords);

        wordMapContainer.innerHTML = '';

        if (sortedWords.length === 0) {
            const noWords = document.createElement('p');
            noWords.textContent = 'No topics available.';
            wordMapContainer.appendChild(noWords);
            return;
        }

        const counts = sortedWords.map(word => wordCounts[word]);
        const maxCount = Math.max(...counts);
        const minCount = Math.min(...counts);
        const range = maxCount - minCount || 1;

        sortedWords.forEach(word => {
            const count = wordCounts[word];
            const relatedArticles = wordToArticles[word];

            if (!relatedArticles.length) {
                console.warn(`No articles found for word: ${word}`);
                return;
            }

            const sizeLevel = Math.ceil(((count - minCount) / range) * 4) + 1;
            const wordElement = document.createElement('a');
            wordElement.className = `word-size-${sizeLevel}`;
            wordElement.textContent = word;
            wordElement.setAttribute('aria-label', `Explore articles tagged with ${word}`);

            if (relatedArticles.length === 1) {
                wordElement.href = relatedArticles[0].link;
            } else {
                wordElement.href = '#';
                wordElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    showModal(word, relatedArticles);
                });
            }

            wordMapContainer.appendChild(wordElement);
        });
    }

    function showModal(word, articles) {
        document.querySelectorAll('.word-modal, .modal-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);

        const modal = document.createElement('div');
        modal.className = 'word-modal';
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', `Articles tagged with ${word}`);
        modal.tabIndex = -1;

        const content = document.createElement('div');
        content.className = 'modal-content';

        const title = document.createElement('h4');
        title.textContent = `Articles tagged with "${word}"`;
        content.appendChild(title);

        const list = document.createElement('ul');
        articles.forEach(article => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = article.link;
            a.textContent = article.title;
            a.addEventListener('click', () => {
                modal.remove();
                overlay.remove();
            });
            li.appendChild(a);
            list.appendChild(li);
        });
        content.appendChild(list);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.className = 'modal-close';
        closeButton.setAttribute('aria-label', 'Close modal');
        closeButton.addEventListener('click', () => {
            modal.remove();
            overlay.remove();
        });
        content.appendChild(closeButton);

        modal.appendChild(content);
        document.body.appendChild(modal);

        overlay.addEventListener('click', () => {
            modal.remove();
            overlay.remove();
        });

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                overlay.remove();
            }
        });

        modal.focus();

        // Trap focus within modal
        const focusableElements = modal.querySelectorAll('a, button');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupPagination();
        updateWordMap();
        document.getElementById('search').addEventListener('input', debounceSearch);
    });
})();
