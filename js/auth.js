/**
 * VELOURA PMU & BROW STUDIO - AUTHENTICATION & DEMO SESSION CONTROLLER
 */

const PMUAuth = (function() {
  const DEMO_USERS = {
    client: {
      id: "usr-client-01",
      name: "Sarah Jenkins",
      email: "client@velourapmu.com",
      role: "client",
      avatar: "assets/images/testimonials/client-1.jpg",
      phone: "+1 (555) 234-5678",
      skinType: "Fitzpatrick Type II - Sensitive"
    },
    admin: {
      id: "usr-admin-01",
      name: "Elena Rostova (Studio Director)",
      email: "admin@velourapmu.com",
      role: "admin",
      avatar: "assets/images/artists/artist-1.jpg",
      phone: "+1 (555) 789-0123"
    }
  };

  function init() {
    updateAuthHeaderUI();
    bindAuthForms();
    checkAuthRedirectNotice();
  }

  function checkAuthRedirectNotice() {
    const notice = sessionStorage.getItem('pmu_auth_redirect_msg');
    if (notice) {
      sessionStorage.removeItem('pmu_auth_redirect_msg');
      if (window.PMUNotifications) {
        window.PMUNotifications.warning(notice, 4000);
      }
    }
  }

  function login(email, password, roleHint = 'client') {
    let user;
    if (email.includes('admin') || roleHint === 'admin') {
      user = { ...DEMO_USERS.admin };
    } else {
      user = { ...DEMO_USERS.client };
      if (email && email !== 'client@velourapmu.com') {
        user.email = email;
        user.name = email.split('@')[0].replace('.', ' ');
      }
    }

    PMUStorage.setCurrentUser(user);

    if (window.PMUNotifications) {
      window.PMUNotifications.success(`Welcome back, ${user.name}!`, 2500);
    }

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');

    setTimeout(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'client-dashboard.html';
      }
    }, 800);
  }

  const SOCIAL_PROVIDERS = {
    google: {
      label: 'Google Account',
      email: 'sarah.jenkins@gmail.com'
    },
    apple: {
      label: 'Apple ID',
      email: 'sarah.jenkins@privaterelay.appleid.com'
    },
    facebook: {
      label: 'Facebook Account',
      email: 'sarah.jenkins@facebook.com'
    }
  };

  function loginWithProvider(provider) {
    const providerConfig = SOCIAL_PROVIDERS[provider] || {};
    const providerLabel = providerConfig.label || provider;

    if (window.PMUNotifications) {
      window.PMUNotifications.info(`Connecting securely via ${providerLabel}...`, 1800);
    }

    document
      .querySelectorAll('[data-auth-provider], #login-form button[type="submit"], #register-form button[type="submit"]')
      .forEach(btn => {
        btn.disabled = true;
      });

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');

    setTimeout(() => {
      const ssoUser = {
        id: "usr-" + provider + "-" + Date.now().toString().slice(-4),
        name: "Sarah Jenkins",
        email: providerConfig.email || `sarah.jenkins@${provider}.com`,
        role: "client",
        avatar: "assets/images/testimonials/client-1.jpg",
        phone: "+1 (555) 234-5678",
        skinType: "Fitzpatrick Type II - Sensitive",
        provider: provider
      };

      PMUStorage.setCurrentUser(ssoUser);

      if (window.PMUNotifications) {
        window.PMUNotifications.success(`Authenticated via ${providerLabel}. Welcome to the Lounge!`, 2500);
      }

      setTimeout(() => {
        window.location.href = redirectUrl || 'client-dashboard.html';
      }, 700);
    }, 900);
  }

  function register(formData) {
    const newUser = {
      id: "usr-" + Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "+1 (555) 000-0000",
      role: "client",
      avatar: "assets/images/testimonials/client-2.jpg",
      skinType: formData.skinType || "Normal"
    };

    PMUStorage.setCurrentUser(newUser);

    if (window.PMUNotifications) {
      window.PMUNotifications.success('Account successfully created! Redirecting to client lounge...', 2500);
    }

    setTimeout(() => {
      window.location.href = 'client-dashboard.html';
    }, 1000);
  }

  function logout() {
    PMUStorage.setCurrentUser(null);
    if (window.PMUNotifications) {
      window.PMUNotifications.info('You have been securely logged out.', 2000);
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  }

  function requireAuth(allowedRole = 'client') {
    const user = PMUStorage.getCurrentUser();
    const currentPath = window.location.pathname.split('/').pop() || 'client-dashboard.html';

    if (!user) {
      sessionStorage.setItem('pmu_auth_redirect_msg', 'Please sign in to access your customer dashboard.');
      window.location.replace(`login.html?redirect=${encodeURIComponent(currentPath)}`);
      return false;
    }

    if (allowedRole === 'admin' && user.role !== 'admin') {
      sessionStorage.setItem('pmu_auth_redirect_msg', 'Access restricted. Studio Administrator credentials required.');
      window.location.replace('client-dashboard.html');
      return false;
    }

    return true;
  }

  function updateAuthHeaderUI() {
    const user = PMUStorage.getCurrentUser();
    const authContainers = document.querySelectorAll('.header-user-status');

    authContainers.forEach(container => {
      if (user) {
        const dashboardLink = user.role === 'admin' ? 'admin-dashboard.html' : 'client-dashboard.html';
        const label = user.role === 'admin' ? 'Studio Admin' : user.name.split(' ')[0];
        container.innerHTML = `
          <div class="dropdown">
            <button class="btn-header-signin dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="${user.avatar || 'assets/images/testimonials/client-1.jpg'}" alt="${user.name}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
              <span>${label}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li><a class="dropdown-item" href="${dashboardLink}"><i class="fa-solid fa-gauge text-gold me-2"></i> Dashboard</a></li>
              <li><a class="dropdown-item" href="${user.role === 'admin' ? 'admin-settings.html' : 'client-profile.html'}"><i class="fa-solid fa-user-gear text-gold me-2"></i> Profile &amp; Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="PMUAuth.logout(); return false;"><i class="fa-solid fa-right-from-bracket me-2"></i> Sign Out</a></li>
            </ul>
          </div>
        `;
      } else {
        container.innerHTML = `
          <a href="login.html" class="btn-header-signin" title="Client Sign In">
            <i class="fa-regular fa-user"></i>
            <span>Client Sign In</span>
          </a>
        `;
      }
    });
  }

  function bindAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      const emailInput = document.getElementById('login-email');
      const rememberCheckbox = document.getElementById('rememberMe');

      // Load remembered email if present
      const rememberedEmail = localStorage.getItem('veloura_remembered_email');
      if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
      }

      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (PMUValidation.validateForm(loginForm)) {
          const email = emailInput ? emailInput.value.trim() : '';
          const passwordInput = document.getElementById('login-password');
          const password = passwordInput ? passwordInput.value : '';
          const roleHint = loginForm.dataset.roleHint || (email.includes('admin') ? 'admin' : 'client');

          if (rememberCheckbox && rememberCheckbox.checked && email) {
            localStorage.setItem('veloura_remembered_email', email);
          } else {
            localStorage.removeItem('veloura_remembered_email');
          }

          login(email, password, roleHint);
        }
      });

      // Show/Hide Password Toggle
      const togglePasswordBtn = document.getElementById('btn-toggle-password');
      const passwordInput = document.getElementById('login-password');
      const toggleIcon = document.getElementById('toggle-password-icon');

      if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isPassword = passwordInput.getAttribute('type') === 'password';
          passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
          if (toggleIcon) {
            toggleIcon.className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
          }
          const label = isPassword ? 'Hide password' : 'Show password';
          togglePasswordBtn.setAttribute('title', label);
          togglePasswordBtn.setAttribute('aria-label', label);
        });
      }

    }

    // Social Sign-In / Sign-Up Buttons (Login & Register)
    document.querySelectorAll('[data-auth-provider]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = btn.dataset.authProvider;
        if (provider) {
          loginWithProvider(provider);
        }
      });
    });

    // Register form
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (PMUValidation.validateForm(regForm)) {
          const name = regForm.querySelector('#reg-name').value;
          const email = regForm.querySelector('#reg-email').value;
          const phone = regForm.querySelector('#reg-phone').value;
          const skinType = regForm.querySelector('#reg-skin-type') ? regForm.querySelector('#reg-skin-type').value : 'Normal';
          register({ name, email, phone, skinType });
        }
      });
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (PMUValidation.validateForm(forgotForm)) {
          const email = forgotForm.querySelector('#forgot-email').value;
          const submitBtn = forgotForm.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Link...';

          setTimeout(() => {
            const successBox = document.getElementById('forgot-success-alert');
            if (successBox) successBox.classList.remove('d-none');
            forgotForm.classList.add('d-none');
            if (window.PMUNotifications) {
              window.PMUNotifications.success(`Password reset instructions sent to ${email}`, 4000);
            }
          }, 1200);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, login, loginWithProvider, register, logout, requireAuth, DEMO_USERS };
})();

window.PMUAuth = PMUAuth;
