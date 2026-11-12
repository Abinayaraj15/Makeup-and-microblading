/**
 * VELOURA PMU & BROW STUDIO - FORM VALIDATION ENGINE
 */

const PMUValidation = (function() {
  function validateEmail(email) {
    const trimmed = String(email || '').trim();
    if (!trimmed || trimmed.length > 254 || trimmed.includes('..')) return false;
    const parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.')) return false;
    if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) return false;
    const labels = domain.split('.');
    if (labels.length < 2) return false;
    const tld = labels[labels.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
    return labels.every(label => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
  }

  function validatePhone(phone) {
    const trimmed = String(phone || '').trim();
    if (!trimmed || !/^\+?[\d\s\-().]+$/.test(trimmed)) return false;
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openParens !== closeParens) return false;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    return true;
  }

  function validatePassword(password, options = {}) {
    const minLength = options.minLength || 6;
    const maxLength = options.maxLength || 64;
    const str = typeof password === 'string' ? password : String(password || '');
    if (!str) {
      return { valid: false, message: 'Password is required.' };
    }
    if (/\s/.test(str)) {
      return { valid: false, message: 'Password cannot contain spaces.' };
    }
    if (str.length < minLength) {
      return { valid: false, message: `Password must be at least ${minLength} characters.` };
    }
    if (str.length > maxLength) {
      return { valid: false, message: `Password cannot exceed ${maxLength} characters.` };
    }
    if (/^(.)\1+$/.test(str)) {
      return { valid: false, message: 'Password cannot consist of a single repeated character.' };
    }
    return { valid: true, message: '' };
  }

  function validateName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2) return false;
    // Prevent numeric-only or entries without alphabetical letters
    if (/^\d+$/.test(trimmed)) return false;
    if (!/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) return false;
    if (/^[0-9\W]+$/.test(trimmed)) return false;
    return true;
  }

  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      // Clear previous error
      input.classList.remove('is-invalid');
      const errEl = input.parentElement.querySelector('.invalid-feedback');
      if (errEl) errEl.style.display = 'none';

      // Check required
      if (input.hasAttribute('required')) {
        if (input.type === 'checkbox' && !input.checked) {
          showError(input, 'You must accept this field to proceed.');
          isValid = false;
        } else if (!input.value.trim()) {
          showError(input, 'This field is required.');
          isValid = false;
        }
      }

      // Check name fields
      const isNameField = input.type === 'text' && (
        (input.id && /name/i.test(input.id)) ||
        (input.name && /name/i.test(input.name)) ||
        (input.getAttribute('autocomplete') && /name/i.test(input.getAttribute('autocomplete')))
      );
      if (isNameField && input.value.trim()) {
        if (!validateName(input.value)) {
          showError(input, 'Please enter a valid full name (letters only, cannot be numbers only).');
          isValid = false;
        }
      }

      // Check email
      if (input.type === 'email' && input.value.trim()) {
        if (!validateEmail(input.value)) {
          showError(input, 'Please enter a valid email address (e.g., name@domain.com).');
          isValid = false;
        }
      }

      // Check phone
      if (input.type === 'tel' && input.value.trim()) {
        if (!validatePhone(input.value)) {
          showError(input, 'Please enter a valid phone number (10-15 digits, e.g., +1 (555) 234-5678).');
          isValid = false;
        }
      }

      // Check password rules
      if ((input.type === 'password' || (input.id && input.id.toLowerCase().includes('password'))) && input.value) {
        const minLen = (input.minLength && input.minLength > 0) ? input.minLength : 6;
        const maxLen = (input.maxLength && input.maxLength > 0) ? input.maxLength : 64;
        const pwdCheck = validatePassword(input.value, { minLength: minLen, maxLength: maxLen });
        if (!pwdCheck.valid) {
          showError(input, pwdCheck.message);
          isValid = false;
        }
      }
    });

    return isValid;
  }

  function showError(input, message) {
    input.classList.add('is-invalid');
    let errEl = input.parentElement.querySelector('.invalid-feedback');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'invalid-feedback text-danger';
      errEl.style.fontSize = '0.82rem';
      errEl.style.marginTop = '0.35rem';
      input.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
  }

  function clearErrors(form) {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');
  }

  return {
    validateForm,
    validateName,
    validateEmail,
    validatePhone,
    validatePassword,
    showError,
    clearErrors
  };
})();

window.PMUValidation = PMUValidation;
