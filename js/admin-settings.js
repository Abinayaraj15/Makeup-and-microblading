/**
 * VELOURA PMU & BROW STUDIO - ADMIN SETTINGS CONTROLLER
 */
(function () {
  const SETTINGS_KEY = 'veloura_studio_settings';

  function clearInputValidation(el) {
    if (!el) return;
    el.classList.remove('is-invalid');
    const errEl = el.parentElement && el.parentElement.querySelector('.invalid-feedback');
    if (errEl) errEl.style.display = 'none';
  }

  function initStudioSettingsForm() {
    const form = document.getElementById('studio-settings-form');
    if (!form) return;

    const nameEl = document.getElementById('studio-name');
    const phoneEl = document.getElementById('studio-phone');
    const emailEl = document.getElementById('studio-email');
    const addressEl = document.getElementById('studio-address');
    const hoursEl = document.getElementById('studio-hours');
    const feedbackEl = document.getElementById('studio-settings-feedback');

    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (saved) {
        if (nameEl && saved.name) nameEl.value = saved.name;
        if (phoneEl && saved.phone) phoneEl.value = saved.phone;
        if (emailEl && saved.email) emailEl.value = saved.email;
        if (addressEl && saved.address) addressEl.value = saved.address;
        if (hoursEl && saved.hours) hoursEl.value = saved.hours;
      }
    } catch (e) {}

    [nameEl, phoneEl, emailEl, addressEl, hoursEl].forEach(el => {
      if (el) el.addEventListener('input', () => clearInputValidation(el));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (feedbackEl) feedbackEl.classList.add('d-none');

      const valid = window.PMUValidation && typeof PMUValidation.validateForm === 'function'
        ? PMUValidation.validateForm(form)
        : form.checkValidity();

      if (!valid) {
        const firstInvalid = form.querySelector('.is-invalid');
        const firstMsgEl = firstInvalid && firstInvalid.parentElement
          ? firstInvalid.parentElement.querySelector('.invalid-feedback')
          : null;
        if (firstInvalid) firstInvalid.focus();
        if (window.PMUNotifications) {
          PMUNotifications.warning(
            (firstMsgEl && firstMsgEl.textContent) || 'Please correct the highlighted studio settings.'
          );
        }
        return;
      }

      const payload = {
        name: nameEl ? nameEl.value.trim() : '',
        phone: phoneEl ? phoneEl.value.trim() : '',
        email: emailEl ? emailEl.value.trim() : '',
        address: addressEl ? addressEl.value.trim() : '',
        hours: hoursEl ? hoursEl.value.trim() : ''
      };

      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
      } catch (err) {}

      if (feedbackEl) {
        feedbackEl.className = 'alert alert-success py-2 px-3 small mt-3 mb-0';
        feedbackEl.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Studio settings saved successfully.';
        feedbackEl.classList.remove('d-none');
      }

      if (window.PMUNotifications) {
        PMUNotifications.success('Studio settings saved successfully!');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudioSettingsForm);
  } else {
    initStudioSettingsForm();
  }
})();
