/**
 * VELOURA PMU & BROW STUDIO - CLIENT PROFILE & PASSWORD CONTROLLER
 */
(function () {
  const PROFILE_KEY = 'veloura_client_profile';
  const NOTIFS_KEY = 'veloura_client_notifications';
  const PASSWORD_KEY = 'veloura_client_password';
  const PASSWORD_UPDATED_AT_KEY = 'veloura_client_password_updated_at';

  function initClientProfile() {
    initProfileForm();
    initNotificationToggles();
    initPasswordToggles();
    initPasswordForm();
  }

  function initProfileForm() {
    const form = document.getElementById('client-profile-form');
    if (!form) return;

    const nameEl = document.getElementById('profile-full-name');
    const emailEl = document.getElementById('profile-email');
    const phoneEl = document.getElementById('profile-phone');
    const emergencyEl = document.getElementById('profile-emergency');
    const skinEl = document.getElementById('profile-skin-notes');
    const statusEl = document.getElementById('profile-save-feedback');

    const currentUser = window.PMUStorage && typeof PMUStorage.getCurrentUser === 'function'
      ? PMUStorage.getCurrentUser()
      : null;

    let savedProfile = null;
    try {
      savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (savedProfile) {
        if (nameEl && savedProfile.fullName) {
          nameEl.value = savedProfile.fullName;
          syncSidebarName(savedProfile.fullName);
        }
        if (emailEl && savedProfile.email) emailEl.value = savedProfile.email;
        if (phoneEl && savedProfile.phone) phoneEl.value = savedProfile.phone;
        if (emergencyEl && savedProfile.emergencyContact) emergencyEl.value = savedProfile.emergencyContact;
        if (skinEl && savedProfile.skinNotes) skinEl.value = savedProfile.skinNotes;
      }
    } catch (e) {}

    if (currentUser) {
      if (nameEl && currentUser.name && !(savedProfile && savedProfile.fullName)) {
        nameEl.value = currentUser.name;
      }
      if (emailEl && currentUser.email && !(savedProfile && savedProfile.email)) {
        emailEl.value = currentUser.email;
      }
      if (nameEl && nameEl.value.trim()) {
        syncSidebarName(nameEl.value.trim());
      }
    }

    const clearInlineError = (el) => {
      if (!el) return;
      el.classList.remove('is-invalid');
      const errEl = el.parentElement && el.parentElement.querySelector('.invalid-feedback');
      if (errEl) errEl.style.display = 'none';
    };

    [nameEl, emailEl, phoneEl, emergencyEl].forEach(el => {
      if (el) el.addEventListener('input', () => clearInlineError(el));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (statusEl) statusEl.classList.add('d-none');
      if (window.PMUValidation && typeof PMUValidation.clearErrors === 'function') {
        PMUValidation.clearErrors(form);
      }

      const fullName = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const emergency = emergencyEl ? emergencyEl.value.trim() : '';
      const skinNotes = skinEl ? skinEl.value.trim() : '';

      const errors = [];
      const addErr = (el, msg) => {
        errors.push({ el, msg });
        if (window.PMUValidation && typeof PMUValidation.showError === 'function' && el) {
          PMUValidation.showError(el, msg);
        } else if (el) {
          el.classList.add('is-invalid');
        }
      };

      if (!fullName) {
        addErr(nameEl, 'Please enter your full name.');
      } else if (window.PMUValidation && !PMUValidation.validateName(fullName)) {
        addErr(nameEl, 'Please enter a valid full name (at least 2 letters).');
      }

      if (!email) {
        addErr(emailEl, 'Please enter your email address.');
      } else if (window.PMUValidation && !PMUValidation.validateEmail(email)) {
        addErr(emailEl, 'Please enter a valid email address (e.g., name@domain.com).');
      }

      if (!phone) {
        addErr(phoneEl, 'Please enter your phone number.');
      } else if (window.PMUValidation && !PMUValidation.validatePhone(phone)) {
        addErr(phoneEl, 'Please enter a valid phone number (10-15 digits).');
      }

      if (emergency && window.PMUValidation && !PMUValidation.validatePhone(emergency)) {
        addErr(emergencyEl, 'Please enter a valid emergency contact number (10-15 digits).');
      }

      if (errors.length > 0) {
        if (errors[0].el) errors[0].el.focus();
        if (window.PMUNotifications) PMUNotifications.warning(errors[0].msg);
        return;
      }

      const payload = {
        fullName,
        email,
        phone,
        emergencyContact: emergency,
        skinNotes
      };

      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
        const activeUser = window.PMUStorage && typeof PMUStorage.getCurrentUser === 'function'
          ? PMUStorage.getCurrentUser()
          : currentUser;
        if (activeUser && window.PMUStorage && typeof PMUStorage.setCurrentUser === 'function') {
          PMUStorage.setCurrentUser({
            ...activeUser,
            name: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            skinType: payload.skinNotes || activeUser.skinType
          });
        }
      } catch (err) {}

      syncSidebarName(payload.fullName);

      if (statusEl) {
        statusEl.className = 'alert alert-success py-2 px-3 small mt-3 mb-0';
        statusEl.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Profile settings updated successfully.';
        statusEl.classList.remove('d-none');
      }

      if (window.PMUNotifications) {
        PMUNotifications.success('Profile settings updated successfully!');
      }
    });
  }

  function syncSidebarName(name) {
    document.querySelectorAll('.dashboard-sidebar h6.font-serif, .client-user-name').forEach(el => {
      el.textContent = name;
    });
  }

  function initNotificationToggles() {
    const ids = ['smsReminders', 'touchupAlert', 'vipPromos'];
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(NOTIFS_KEY) || 'null');
    } catch (e) {}

    ids.forEach(id => {
      const cb = document.getElementById(id);
      if (!cb) return;
      if (saved && typeof saved[id] === 'boolean') {
        cb.checked = saved[id];
      }
      cb.addEventListener('change', () => {
        const nextState = {};
        ids.forEach(k => {
          const el = document.getElementById(k);
          if (el) nextState[k] = el.checked;
        });
        try {
          localStorage.setItem(NOTIFS_KEY, JSON.stringify(nextState));
        } catch (e) {}
        if (window.PMUNotifications) {
          PMUNotifications.info('Notification preferences saved.', 2000);
        }
      });
    });
  }

  function initPasswordToggles() {
    document.querySelectorAll('.btn-toggle-password[data-toggle-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.toggleTarget);
        if (!target) return;
        const show = target.getAttribute('type') === 'password';
        target.setAttribute('type', show ? 'text' : 'password');
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
        const label = show ? 'Hide password' : 'Show password';
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
      });
    });
  }

  function clearFieldError(input, errEl) {
    if (input) input.classList.remove('is-invalid');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('d-none');
    }
  }

  function setFieldError(input, errEl, message) {
    if (input) input.classList.add('is-invalid');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.remove('d-none');
    }
  }

  function initPasswordForm() {
    const form = document.getElementById('client-password-form');
    if (!form) return;

    const currentEl = document.getElementById('current-password');
    const newEl = document.getElementById('new-password');
    const currentErrEl = document.getElementById('current-password-error');
    const newErrEl = document.getElementById('new-password-error');
    const feedbackEl = document.getElementById('password-update-feedback');
    const submitBtn = document.getElementById('update-password-btn');

    if (currentEl) {
      currentEl.addEventListener('input', () => clearFieldError(currentEl, currentErrEl));
    }
    if (newEl) {
      newEl.addEventListener('input', () => clearFieldError(newEl, newErrEl));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldError(currentEl, currentErrEl);
      clearFieldError(newEl, newErrEl);
      if (feedbackEl) feedbackEl.classList.add('d-none');

      const currentPwd = currentEl ? currentEl.value : '';
      const newPwd = newEl ? newEl.value : '';

      if (!currentPwd.trim()) {
        const msg = 'Please enter your current password.';
        setFieldError(currentEl, currentErrEl, msg);
        if (currentEl) currentEl.focus();
        if (window.PMUNotifications) PMUNotifications.warning(msg);
        return;
      }

      if (window.PMUValidation && typeof PMUValidation.validatePassword === 'function') {
        const currentCheck = PMUValidation.validatePassword(currentPwd, { minLength: 6, maxLength: 64 });
        if (!currentCheck.valid) {
          setFieldError(currentEl, currentErrEl, currentCheck.message);
          if (currentEl) currentEl.focus();
          if (window.PMUNotifications) PMUNotifications.warning(currentCheck.message);
          return;
        }
      }

      let storedPwd = null;
      try {
        storedPwd = localStorage.getItem(PASSWORD_KEY);
      } catch (err) {}

      if (storedPwd && currentPwd !== storedPwd) {
        const msg = 'Current password does not match your updated password.';
        setFieldError(currentEl, currentErrEl, msg);
        if (currentEl) currentEl.focus();
        if (window.PMUNotifications) PMUNotifications.error(msg);
        return;
      }

      if (window.PMUValidation && typeof PMUValidation.validatePassword === 'function') {
        const newCheck = PMUValidation.validatePassword(newPwd, { minLength: 6, maxLength: 64 });
        if (!newCheck.valid) {
          setFieldError(newEl, newErrEl, newCheck.message);
          if (newEl) newEl.focus();
          if (window.PMUNotifications) PMUNotifications.warning(newCheck.message);
          return;
        }
      } else if (newPwd.length < 6 || /\s/.test(newPwd)) {
        const msg = 'New password must be at least 6 characters with no spaces.';
        setFieldError(newEl, newErrEl, msg);
        if (newEl) newEl.focus();
        if (window.PMUNotifications) PMUNotifications.warning(msg);
        return;
      }

      if (newPwd === currentPwd) {
        const msg = 'New password must be different from your current password.';
        setFieldError(newEl, newErrEl, msg);
        if (newEl) newEl.focus();
        if (window.PMUNotifications) PMUNotifications.warning(msg);
        return;
      }

      try {
        localStorage.setItem(PASSWORD_KEY, newPwd);
        localStorage.setItem(PASSWORD_UPDATED_AT_KEY, new Date().toISOString());
      } catch (err) {}

      form.reset();
      [currentEl, newEl].forEach(el => {
        if (el) el.setAttribute('type', 'password');
      });
      form.querySelectorAll('.btn-toggle-password i').forEach(icon => {
        icon.className = 'fa-regular fa-eye';
      });

      if (feedbackEl) {
        feedbackEl.className = 'alert alert-success py-2 px-3 small mt-3 mb-0';
        feedbackEl.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Password changed successfully.';
        feedbackEl.classList.remove('d-none');
      }

      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Password Updated';
        setTimeout(() => {
          submitBtn.textContent = 'Update Password';
        }, 2000);
      }

      if (window.PMUNotifications) {
        PMUNotifications.success('Password changed successfully.');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClientProfile);
  } else {
    initClientProfile();
  }
})();
