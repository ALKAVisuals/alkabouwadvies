(function () {
    'use strict';

    const forms = document.querySelectorAll('form[data-newsletter-form="true"]');

    forms.forEach((form) => {
        const input = form.querySelector('input[name="email"]');
        const button = form.querySelector('button[type="submit"]');
        const statusId = input ? input.getAttribute('aria-describedby') : '';
        const status = statusId ? document.getElementById(statusId) : null;
        const defaultButtonText = button ? button.textContent : '';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const showStatus = (message, type) => {
            if (!status) return;
            status.textContent = message;
            status.classList.toggle('is-success', type === 'success');
            status.classList.toggle('is-error', type === 'error');
        };

        if (input) {
            input.addEventListener('input', () => {
                input.removeAttribute('aria-invalid');
                showStatus('', '');
            });
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            if (!input || !emailPattern.test(input.value.trim())) {
                if (input) {
                    input.setAttribute('aria-invalid', 'true');
                    input.focus();
                }
                showStatus('Vul een geldig e-mailadres in.', 'error');
                return;
            }

            if (!button) return;

            button.disabled = true;
            button.textContent = 'Bezig...';
            showStatus('Uw inschrijving wordt verwerkt.', '');

            try {
                const formData = new FormData(form);
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (!response.ok) throw new Error('Nieuwsbriefinschrijving mislukt');

                form.reset();
                button.textContent = 'Ingeschreven!';
                showStatus('Bedankt! Uw inschrijving is ontvangen.', 'success');
            } catch (error) {
                button.textContent = defaultButtonText;
                showStatus('Inschrijven lukt nu niet. Probeer het later opnieuw.', 'error');
            } finally {
                window.setTimeout(() => {
                    button.disabled = false;
                    button.textContent = defaultButtonText;
                }, 3000);
            }
        }, true);
    });
})();
