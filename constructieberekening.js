(function () {
    'use strict';

    const form = document.querySelector('[data-construction-form]');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll('[data-form-step]'));
    const progress = Array.from(document.querySelectorAll('[data-progress-step]'));
    const status = form.querySelector('[data-form-status]');
    const success = document.querySelector('[data-form-success]');
    const submitButton = form.querySelector('[type="submit"]');
    const maxCombinedBytes = 7 * 1024 * 1024;
    const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
    const allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png']);
    let currentStep = 0;
    let submissionPending = false;

    function showStep(index, shouldFocus) {
        currentStep = Math.max(0, Math.min(index, steps.length - 1));
        steps.forEach((step, stepIndex) => {
            const active = stepIndex === currentStep;
            step.hidden = !active;
            step.setAttribute('aria-hidden', String(!active));
        });
        progress.forEach((item, stepIndex) => {
            item.classList.toggle('is-active', stepIndex === currentStep);
            item.classList.toggle('is-complete', stepIndex < currentStep);
            if (stepIndex === currentStep) item.setAttribute('aria-current', 'step');
            else item.removeAttribute('aria-current');
        });
        if (shouldFocus) {
            const legend = steps[currentStep].querySelector('legend');
            legend.setAttribute('tabindex', '-1');
            legend.focus({ preventScroll: true });
            document.getElementById('constructie-aanvraag').scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    }

    function errorElement(control) {
        const describedBy = control.getAttribute('aria-describedby');
        return describedBy ? document.getElementById(describedBy.split(' ')[0]) : null;
    }

    function setFieldError(control, invalid) {
        control.setAttribute('aria-invalid', String(invalid));
        errorElement(control)?.classList.toggle('is-visible', invalid);
    }

    function radioGroupValid(name) {
        const inputs = Array.from(form.querySelectorAll(`input[type="radio"][name="${name}"]`));
        const invalid = !inputs.some((input) => input.checked);
        inputs.forEach((input) => input.setAttribute('aria-invalid', String(invalid)));
        document.getElementById(`error-${name}`)?.classList.toggle('is-visible', invalid);
        return !invalid;
    }

    function validateFiles() {
        const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
        const files = fileInputs.flatMap((input) => Array.from(input.files || []));
        const total = files.reduce((sum, file) => sum + file.size, 0);
        const wrongType = files.some((file) => {
            const extension = file.name.toLowerCase().split('.').pop();
            return !allowedExtensions.has(extension) || (file.type && !allowedMimeTypes.has(file.type));
        });
        const invalid = total > maxCombinedBytes || wrongType;
        fileInputs.forEach((input) => input.setAttribute('aria-invalid', String(invalid)));
        const error = document.getElementById('error-constructie-bestanden');
        if (error) {
            error.textContent = wrongType
                ? 'Gebruik alleen PDF-, JPG-, JPEG- of PNG-bestanden.'
                : 'De gekozen bestanden zijn samen groter dan 7 MB.';
            error.classList.toggle('is-visible', invalid);
        }
        return !invalid;
    }

    function syncAvailableDocuments() {
        const values = Array.from(form.querySelectorAll('[data-document-option]:checked')).map((input) => input.value);
        const output = document.getElementById('bestaandetekeningen');
        if (output) output.value = values.join(', ');
    }

    function validateStep(index) {
        const step = steps[index];
        let valid = true;

        step.querySelectorAll('input[required]:not([type="radio"]):not([type="checkbox"]), select[required], textarea[required]').forEach((control) => {
            const valueValid = control.type === 'email'
                ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value.trim())
                : Boolean(control.value.trim());
            setFieldError(control, !valueValid);
            if (!valueValid) valid = false;
        });

        const requiredRadioNames = Array.from(new Set(
            Array.from(step.querySelectorAll('input[type="radio"][required]')).map((input) => input.name)
        ));
        requiredRadioNames.forEach((name) => { if (!radioGroupValid(name)) valid = false; });

        step.querySelectorAll('input[type="checkbox"][required]').forEach((control) => {
            const invalid = !control.checked;
            setFieldError(control, invalid);
            if (invalid) valid = false;
        });

        if (step.querySelector('input[type="file"]') && !validateFiles()) valid = false;
        if (!valid) step.querySelector('[aria-invalid="true"]')?.focus();
        return valid;
    }

    function storeAttribution() {
        const url = new URL(window.location.href);
        const allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid'];
        const values = allowed
            .map((key) => [key, url.searchParams.get(key)])
            .filter((entry) => entry[1])
            .map((entry) => `${entry[0]}=${String(entry[1]).slice(0, 200)}`);
        const source = document.getElementById('bron');
        if (source) source.value = ['constructieberekening-landingspagina', `landing_page=${url.pathname}`, ...values].join(';');
    }

    form.addEventListener('input', (event) => {
        if (event.target.matches('input, select, textarea')) setFieldError(event.target, false);
        if (event.target.matches('[data-document-option]')) syncAvailableDocuments();
        if (event.target.type === 'file') validateFiles();
        if (event.target.name === 'projecttype') document.getElementById('error-projecttype')?.classList.remove('is-visible');
    });

    form.querySelectorAll('[data-next-step]').forEach((button) => button.addEventListener('click', () => {
        if (validateStep(currentStep)) showStep(currentStep + 1, true);
    }));
    form.querySelectorAll('[data-previous-step]').forEach((button) => button.addEventListener('click', () => showStep(currentStep - 1, true)));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submissionPending) return;

        let firstInvalid = -1;
        steps.forEach((step, index) => {
            if (!validateStep(index) && firstInvalid < 0) firstInvalid = index;
        });
        if (firstInvalid >= 0) {
            showStep(firstInvalid, true);
            status.textContent = 'Controleer de gemarkeerde velden.';
            status.className = 'construction-form-status is-error';
            return;
        }

        syncAvailableDocuments();
        storeAttribution();
        submissionPending = true;
        submitButton.disabled = true;
        submitButton.textContent = 'Aanvraag verzenden…';
        status.textContent = 'Uw aanvraag wordt veilig verzonden.';
        status.className = 'construction-form-status';

        try {
            const response = await fetch('/', { method: 'POST', body: new FormData(form) });
            if (!response.ok) throw new Error('Netlify Forms gaf geen succesvolle status terug.');
            if (typeof window.tbaTrackLead === 'function') window.tbaTrackLead('offerteaanvraag');
            form.hidden = true;
            success.hidden = false;
            success.focus();
            form.reset();
        } catch (error) {
            submissionPending = false;
            submitButton.disabled = false;
            submitButton.textContent = 'Constructieaanvraag versturen';
            status.textContent = 'De aanvraag kon niet worden verzonden. Probeer het opnieuw of mail naar info@technischbouwadvies.nl.';
            status.className = 'construction-form-status is-error';
        }
    });

    storeAttribution();
    syncAvailableDocuments();
    showStep(0, false);
}());
