(function () {
    'use strict';

    const section = document.querySelector('[data-review-section]');
    const desktopGrid = section?.querySelector('[data-review-desktop]');
    const mobileRoot = section?.querySelector('[data-review-mobile]');
    const mobileCard = mobileRoot?.querySelector('[data-review-card]');
    const mobileName = mobileRoot?.querySelector('[data-review-name]');
    const mobileText = mobileRoot?.querySelector('[data-review-text]');
    const nextButton = mobileRoot?.querySelector('[data-review-next]');
    const dotsRoot = mobileRoot?.querySelector('[data-review-dots]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let selectedReviews = [];
    let activeIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    if (!desktopGrid || !mobileRoot || !mobileCard || !mobileName || !mobileText || !nextButton || !dotsRoot) return;

    function shuffledSelection(reviews, count) {
        const shuffled = reviews.slice();
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
        }
        return shuffled.slice(0, count);
    }

    function createReviewCard(review) {
        const card = document.createElement('article');
        card.className = 'ervaring-card';

        const stars = document.createElement('div');
        stars.className = 'ervaring-sterren';
        stars.setAttribute('aria-label', review.rating + ' van 5 sterren');
        stars.textContent = '★'.repeat(review.rating);

        const name = document.createElement('h3');
        name.className = 'ervaring-auteur';
        name.textContent = review.name;

        const source = document.createElement('p');
        source.className = 'ervaring-bron';
        source.textContent = 'Review via Google';

        const reviewText = document.createElement('p');
        reviewText.className = 'ervaring-tekst';
        reviewText.textContent = review.text;

        card.append(stars, name, source, reviewText);
        return card;
    }

    function updateDots() {
        dotsRoot.querySelectorAll('.ervaring-dot').forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-current', active ? 'true' : 'false');
        });
    }

    function renderMobileReview(index, animate) {
        activeIndex = (index + selectedReviews.length) % selectedReviews.length;
        const render = function () {
            const review = selectedReviews[activeIndex];
            mobileName.textContent = review.name;
            mobileText.textContent = review.text;
            updateDots();
            mobileCard.classList.remove('is-changing');
        };

        if (animate && !reducedMotion.matches) {
            mobileCard.classList.add('is-changing');
            window.setTimeout(render, 140);
        } else {
            render();
        }
    }

    function buildDots() {
        dotsRoot.replaceChildren();
        selectedReviews.forEach(function (_review, index) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'ervaring-dot';
            dot.setAttribute('aria-label', 'Toon beoordeling ' + (index + 1));
            dot.addEventListener('click', function () {
                renderMobileReview(index, true);
            });
            dotsRoot.appendChild(dot);
        });
    }

    function showLoadError() {
        desktopGrid.replaceChildren();
        const message = document.createElement('p');
        message.className = 'ervaringen-loading';
        message.textContent = 'De klantervaringen konden niet worden geladen.';
        desktopGrid.appendChild(message);
        desktopGrid.setAttribute('aria-busy', 'false');
        mobileName.textContent = 'Klantervaringen';
        mobileText.textContent = 'De klantervaringen konden niet worden geladen.';
        nextButton.hidden = true;
    }

    fetch('aanbouw-uitbouw-reviews.json', { credentials: 'same-origin' })
        .then(function (response) {
            if (!response.ok) throw new Error('Reviews konden niet worden geladen.');
            return response.json();
        })
        .then(function (reviews) {
            if (!Array.isArray(reviews) || reviews.length < 3) throw new Error('Onvoldoende reviews.');
            selectedReviews = shuffledSelection(reviews, 3);
            desktopGrid.replaceChildren(...selectedReviews.map(createReviewCard));
            desktopGrid.setAttribute('aria-busy', 'false');
            buildDots();
            renderMobileReview(0, false);
        })
        .catch(showLoadError);

    nextButton.addEventListener('click', function () {
        if (selectedReviews.length) renderMobileReview(activeIndex + 1, true);
    });

    mobileCard.addEventListener('keydown', function (event) {
        if (!selectedReviews.length) return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            renderMobileReview(activeIndex + 1, true);
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            renderMobileReview(activeIndex - 1, true);
        }
    });

    mobileCard.addEventListener('touchstart', function (event) {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    mobileCard.addEventListener('touchend', function (event) {
        if (!selectedReviews.length) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
        renderMobileReview(activeIndex + (deltaX < 0 ? 1 : -1), true);
    }, { passive: true });
}());
