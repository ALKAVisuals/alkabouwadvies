(function () {
    'use strict';

    const forms = document.querySelectorAll('form[data-unified-contact="true"]');

    forms.forEach((form) => {
        const fields = {
            name: form.querySelector('[name="name"]'),
            email: form.querySelector('[name="email"]'),
            subject: form.querySelector('[name="subject"]'),
            gemeente: form.querySelector('[name="gemeente"]'),
            message: form.querySelector('[name="message"]')
        };
        const submitButton = form.querySelector('[type="submit"]');
        const status = form.querySelector('.contact-status');
        const defaultButtonText = submitButton ? submitButton.textContent : '';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const validationRules = [
            { field: fields.name, valid: () => Boolean(fields.name.value.trim()) },
            { field: fields.email, valid: () => emailPattern.test(fields.email.value.trim()) },
            { field: fields.subject, valid: () => Boolean(fields.subject.value) },
            { field: fields.gemeente, valid: () => Boolean(fields.gemeente.value.trim()) },
            { field: fields.message, valid: () => Boolean(fields.message.value.trim()) }
        ];

        const setFieldState = (field, isValid) => {
            const errorId = field.getAttribute('aria-describedby');
            const error = errorId ? document.getElementById(errorId) : null;
            field.classList.toggle('error', !isValid);
            field.setAttribute('aria-invalid', String(!isValid));
            if (error) error.classList.toggle('visible', !isValid);
        };

        const clearFieldState = (event) => {
            const field = event.target;
            if (!field.matches('input, select, textarea')) return;
            setFieldState(field, true);
        };

        const setStatus = (message, type) => {
            if (!status) return;
            status.textContent = message;
            status.classList.toggle('is-success', type === 'success');
            status.classList.toggle('is-error', type === 'error');
        };

        form.addEventListener('input', clearFieldState);
        form.addEventListener('change', clearFieldState);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            let firstInvalid = null;
            validationRules.forEach(({ field, valid }) => {
                const isValid = valid();
                setFieldState(field, isValid);
                if (!isValid && !firstInvalid) firstInvalid = field;
            });

            if (firstInvalid) {
                setStatus('Controleer de gemarkeerde velden.', 'error');
                firstInvalid.focus();
                return;
            }

            if (!submitButton) return;

            submitButton.disabled = true;
            submitButton.textContent = 'Verzenden...';
            setStatus('', '');

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: new FormData(form)
                });

                if (!response.ok) throw new Error('Formulier kon niet worden verzonden');

                form.reset();
                validationRules.forEach(({ field }) => setFieldState(field, true));
                submitButton.textContent = 'Verzonden!';
                setStatus('Uw aanvraag is verzonden. Onze streeftijd is om binnen één werkdag contact op te nemen.', 'success');
            } catch (error) {
                submitButton.textContent = defaultButtonText;
                setStatus('Er ging iets mis. Probeer het opnieuw of bel ons direct.', 'error');
            } finally {
                window.setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = defaultButtonText;
                }, 3000);
            }
        }, true);
    });
})();
