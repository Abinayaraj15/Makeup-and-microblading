/**
 * VELOURA PMU & BROW STUDIO - CLIENT DASHBOARD CONTROLLER
 */

const PMUClientDashboard = (function() {
  const CHECKLIST_STORAGE_KEY = 'pmu_aftercare_checklist_v1';
  const PRIVATE_VAULT_SESSION_KEY = 'pmu_private_vault_unlocked';

  const FALLBACK_DEMO_CLIENT = {
    id: 'usr-client-01',
    name: 'Sarah Jenkins',
    email: 'client@velourapmu.com',
    role: 'client',
    avatar: 'assets/images/testimonials/client-1.jpg',
    phone: '+1 (555) 234-5678',
    skinType: 'Fitzpatrick Type II - Sensitive',
    memberId: '#8041',
    isDemoPreview: true
  };

  const FALLBACK_ARTISTS = [
    { id: 'art-elena', name: 'Elena Rostova', role: 'Founder & Master PMU Educator' },
    { id: 'art-sofia', name: 'Sofia Vance', role: 'Senior Lip Blush & Pigment Specialist' },
    { id: 'art-maya', name: 'Maya Lin', role: 'Digital Nano & Powder Brow Master' },
    { id: 'art-camilla', name: 'Camilla Rossi', role: 'Aesthetic PMU Artist & Symmetry Stylist' }
  ];

  const TOUCHUP_SERVICES = [
    {
      id: 'srv-6wk-touchup',
      name: '6-Week Perfecting Touch-Up',
      price: 150,
      duration: '60 mins',
      category: 'brows',
      noteHint: 'Perfecting arch density & symmetry 6-8 weeks post initial session.'
    },
    {
      id: 'srv-annual-touchup',
      name: 'Annual Color Boost & Touch-Up',
      price: 280,
      duration: '90 mins',
      category: 'touch-up',
      noteHint: '12-18 month pigment vibrancy & crisp stroke refresh.'
    },
    {
      id: 'srv-lip-touchup',
      name: 'Velvet Lip Blush Touch-Up',
      price: 175,
      duration: '75 mins',
      category: 'lips',
      noteHint: 'Refining vermilion border & boosting soft rose tint.'
    },
    {
      id: 'srv-color-refresh',
      name: 'Brow Color Neutralization & Refresh',
      price: 220,
      duration: '90 mins',
      category: 'brows',
      noteHint: 'Warming cool undertones & refreshing faded strokes.'
    }
  ];

  const PRIVATE_BEFORE_AFTER_RECORDS = [
    {
      id: 'priv-rec-1',
      title: 'Signature Microblading — Baseline & Healed Arch',
      category: 'brows',
      treatment: 'Signature Microblading',
      date: '2026-10-05',
      artist: 'Elena Rostova',
      stage: 'Healed 6 Weeks',
      beforeImg: 'assets/images/before-after/brow-sparse-before.jpg',
      afterImg: 'assets/images/before-after/brow-sculpt-after.jpg',
      pigment: 'Tina Davies Dark Brown (0.5ml) + Ash Brown (0.2ml)',
      needle: 'U-18 Nano Blade 0.18mm',
      notes: 'Golden ratio arch symmetry restored with natural feathered fronts. Ideal retention for touch-up perfecting.',
      touchupServiceId: 'srv-6wk-touchup'
    },
    {
      id: 'priv-rec-2',
      title: 'Combination Hybrid Brows — Density Progression',
      category: 'brows',
      treatment: 'Combination Hybrid Brows',
      date: '2026-07-18',
      artist: 'Maya Lin',
      stage: 'Healed 12 Weeks',
      beforeImg: 'assets/images/before-after/combo-before.jpg',
      afterImg: 'assets/images/before-after/combo-after.jpg',
      pigment: 'Swiss Color Honey Brown + Warm Neutralizer',
      needle: 'Microblade 14F + 3RS Pixel Shading',
      notes: 'Balanced tail elevation and soft powder depth; healed evenly with warm brunette finish.',
      touchupServiceId: 'srv-annual-touchup'
    },
    {
      id: 'priv-rec-3',
      title: 'Velvet Lip Blush — Vermilion Border Restoration',
      category: 'lips',
      treatment: 'Velvet Lip Blush & Tint',
      date: '2026-05-04',
      artist: 'Sofia Vance',
      stage: 'Healed 16 Weeks',
      beforeImg: 'assets/images/before-after/lip-blush-pair-before.jpg',
      afterImg: 'assets/images/before-after/lip-blush-pair-after.jpg',
      pigment: 'Perma Blend Luxe Cotton Candy + Rosewood Drops',
      needle: '1RL 0.25mm Digital Cartridge',
      notes: 'Soft rose flush evenly settled across upper and lower lip border with zero patchiness.',
      touchupServiceId: 'srv-lip-touchup'
    },
    {
      id: 'priv-rec-4',
      title: 'Annual Color Boost — Crisp Stroke Refresh',
      category: 'brows',
      treatment: 'Annual Color Boost & Touch-Up',
      date: '2026-01-22',
      artist: 'Elena Rostova',
      stage: 'Freshly Perfected',
      beforeImg: 'assets/images/before-after/annual-touchup-before.jpg',
      afterImg: 'assets/images/before-after/annual-touchup-after.jpg',
      pigment: 'Custom Dark Blonde & Warm Taupe Blend',
      needle: 'Nano 0.18mm Single Cartridge',
      notes: 'Refreshed tone vibrancy after 14 months; tail crispness restored.',
      touchupServiceId: 'srv-annual-touchup'
    }
  ];

  let activeVaultFilter = 'all';
  let isPrivatePhotosLocked = sessionStorage.getItem(PRIVATE_VAULT_SESSION_KEY) !== 'true';
  let selectedTouchupTime = '11:00 AM';

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function getActiveClient() {
    const stored = window.PMUStorage ? PMUStorage.getCurrentUser() : null;
    if (stored) {
      return {
        ...stored,
        memberId: stored.memberId || '#8041',
        isDemoPreview: false
      };
    }
    if (window.PMUAuth && window.PMUAuth.DEMO_USERS && window.PMUAuth.DEMO_USERS.client) {
      return {
        ...window.PMUAuth.DEMO_USERS.client,
        memberId: '#8041',
        isDemoPreview: true
      };
    }
    return { ...FALLBACK_DEMO_CLIENT };
  }

  function getAppointmentsSafely() {
    if (!window.PMUStorage) return [];
    let apts = PMUStorage.getAppointments();
    if (!apts || !apts.length) {
      apts = [
        {
          id: 'APT-8041',
          clientName: 'Sarah Jenkins',
          clientEmail: 'client@velourapmu.com',
          clientPhone: '+1 (555) 234-5678',
          serviceId: 'srv-microblading',
          serviceName: 'Signature Microblading',
          artistId: 'art-elena',
          artistName: 'Elena Rostova',
          date: '2026-11-18',
          time: '10:00 AM',
          status: 'Confirmed',
          depositPaid: 150,
          totalPrice: 550,
          healingDay: null,
          pigmentRecord: 'Tina Davies Dark Brown (0.5ml) + Ash Brown (0.2ml)',
          needleType: 'U-18 Nano Blade 0.18mm',
          notes: 'Client requested soft natural arch with feathered fronts.'
        },
        {
          id: 'APT-7810',
          clientName: 'Sarah Jenkins',
          clientEmail: 'client@velourapmu.com',
          clientPhone: '+1 (555) 234-5678',
          serviceId: 'srv-combo-brows',
          serviceName: 'Combination Hybrid Brows',
          artistId: 'art-maya',
          artistName: 'Maya Lin',
          date: '2026-10-05',
          time: '11:30 AM',
          status: 'Completed',
          depositPaid: 180,
          totalPrice: 650,
          healingDay: 7,
          pigmentRecord: 'Swiss Color Honey Brown + Espresso',
          needleType: 'Microblade 14F + 3RS Shading',
          notes: 'Healed cleanly, peeling phase currently day 7. Continue botanical healing balm.'
        },
        {
          id: 'APT-7724',
          clientName: 'Sarah Jenkins',
          clientEmail: 'client@velourapmu.com',
          clientPhone: '+1 (555) 234-5678',
          serviceId: 'srv-lip-blush',
          serviceName: 'Velvet Lip Blush & Tint',
          artistId: 'art-sofia',
          artistName: 'Sofia Vance',
          date: '2026-05-04',
          time: '01:00 PM',
          status: 'Completed',
          depositPaid: 160,
          totalPrice: 600,
          healingDay: 20,
          pigmentRecord: 'Perma Blend Luxe Cotton Candy + Rosewood',
          needleType: '1RL 0.25mm Digital Machine',
          notes: 'Touch-up eligible. Color settled evenly across lip border.'
        }
      ];
      try {
        localStorage.setItem('pmu_appointments', JSON.stringify(apts));
      } catch (e) {}
    }
    return apts;
  }

  function getArtistsSafely() {
    if (window.PMUStorage && typeof PMUStorage.getArtists === 'function') {
      const stored = PMUStorage.getArtists();
      if (stored && stored.length) return stored;
    }
    return FALLBACK_ARTISTS;
  }

  async function init() {
    if (window.PMUStorage && typeof PMUStorage.init === 'function') {
      const hasApts = localStorage.getItem('pmu_appointments');
      const hasArtists = localStorage.getItem('pmu_artists');
      if (!hasApts || !hasArtists) {
        try {
          await PMUStorage.init();
        } catch (e) {}
      }
    }

    updateClientProfileUI();
    renderClientOverview();
    setupTouchUpBooking();
    renderPrivateBeforeAfter();
    setupPrivateVaultControls();
    renderClientAppointments();
    renderTreatmentHistory();
    setupHealingChecklist();
  }

  function updateClientProfileUI() {
    const user = getActiveClient();
    const redirectTarget = encodeURIComponent(window.location.pathname.split('/').pop() || 'dashboard.html');

    document.querySelectorAll('.client-user-name, aside h6.font-serif').forEach(el => {
      el.textContent = user.name;
    });
    document.querySelectorAll('.client-user-email').forEach(el => {
      el.textContent = user.email;
    });
    document.querySelectorAll('.client-user-avatar, aside img.rounded-circle').forEach(el => {
      if (user.avatar) el.src = user.avatar;
    });

    const topbarAccount = document.getElementById('dashboard-account-action');
    if (topbarAccount) {
      if (user.isDemoPreview) {
        topbarAccount.innerHTML = `
          <a href="login.html?redirect=${redirectTarget}" class="btn btn-sm btn-pmu-outline d-none d-sm-inline-flex align-items-center gap-1">
            <i class="fa-regular fa-user"></i>
            <span>Sign In</span>
          </a>`;
      } else {
        topbarAccount.innerHTML = `
          <a href="login.html?redirect=${redirectTarget}" class="btn btn-sm btn-pmu-outline d-none d-sm-inline-flex align-items-center gap-1" title="Switch Account">
            <i class="fa-solid fa-repeat"></i>
            <span>Switch</span>
          </a>`;
      }
    }

    const sidebarFooterAction = document.getElementById('sidebar-auth-action');
    if (sidebarFooterAction) {
      if (user.isDemoPreview) {
        sidebarFooterAction.innerHTML = `
          <a href="login.html?redirect=${redirectTarget}" class="btn btn-sm btn-pmu-gold w-100">
            <i class="fa-solid fa-right-to-bracket me-2"></i> Sign In / Switch Account
          </a>`;
      } else {
        sidebarFooterAction.innerHTML = `
          <button type="button" class="btn btn-sm btn-outline-danger w-100" onclick="PMUAuth.logout();">
            <i class="fa-solid fa-right-from-bracket me-2"></i> Sign Out
          </button>`;
      }
    }
  }

  function renderClientOverview() {
    const user = getActiveClient();
    const apts = getAppointmentsSafely();
    const confirmedCount = apts.filter(a => a.status === 'Confirmed').length;
    const completedCount = apts.filter(a => a.status === 'Completed').length;

    const confirmedEl = document.getElementById('client-metric-confirmed');
    if (confirmedEl) confirmedEl.textContent = confirmedCount;

    const completedEl = document.getElementById('client-metric-completed');
    if (completedEl) completedEl.textContent = completedCount;

    const nextApt = apts.find(a => a.status === 'Confirmed');
    const nextBanner = document.getElementById('client-next-appointment-banner');
    if (nextBanner) {
      if (nextApt) {
        nextBanner.innerHTML = `
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span class="pmu-badge pmu-badge-gold mb-2">Upcoming Session</span>
              <h4 class="font-serif mb-1">${escapeHTML(nextApt.serviceName)}</h4>
              <p class="text-muted small mb-0">
                <i class="fa-regular fa-calendar text-gold me-1"></i> ${escapeHTML(nextApt.date)} at ${escapeHTML(nextApt.time)} &nbsp;|&nbsp;
                <i class="fa-regular fa-user text-gold me-1"></i> Artist: ${escapeHTML(nextApt.artistName)}
              </p>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <a href="#touchup-booking-section" class="btn btn-sm btn-pmu-outline">Book Touch-Up</a>
              <a href="#aftercare-instructions-section" class="btn btn-sm btn-pmu-gold">Aftercare Instructions</a>
            </div>
          </div>
        `;
      } else {
        nextBanner.innerHTML = `
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h5 class="font-serif mb-1">No Upcoming Appointments</h5>
              <p class="text-muted small mb-0">Ready for your 6-week perfecting touch-up or annual color boost?</p>
            </div>
            <a href="#touchup-booking-section" class="btn btn-pmu-gold btn-sm">Schedule Touch-Up</a>
          </div>
        `;
      }
    }
  }

  function setupTouchUpBooking() {
    const form = document.getElementById('dashboard-touchup-form');
    if (!form) return;

    const serviceSelect = document.getElementById('touchup-service-select');
    const artistSelect = document.getElementById('touchup-artist-select');
    const dateInput = document.getElementById('touchup-date-input');
    const timeButtons = document.querySelectorAll('.touchup-time-slot');
    const priceDisplay = document.getElementById('touchup-price-display');
    const depositDisplay = document.getElementById('touchup-deposit-display');
    const durationDisplay = document.getElementById('touchup-duration-display');

    if (serviceSelect) {
      serviceSelect.innerHTML = TOUCHUP_SERVICES.map(s => `
        <option value="${s.id}">${s.name} ($${s.price} — ${s.duration})</option>
      `).join('');
    }

    if (artistSelect) {
      const artists = getArtistsSafely();
      artistSelect.innerHTML = `
        <option value="first-available">First Available Master Artist</option>
        ${artists.map(a => `<option value="${escapeHTML(a.id)}">${escapeHTML(a.name)}</option>`).join('')}
      `;
    }

    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      dateInput.min = tomorrow.toISOString().split('T')[0];
      dateInput.value = defaultDate.toISOString().split('T')[0];
    }

    function updateTouchupPricing() {
      if (!serviceSelect) return;
      const srv = TOUCHUP_SERVICES.find(s => s.id === serviceSelect.value) || TOUCHUP_SERVICES[0];
      const deposit = Math.round(srv.price * 0.25);
      if (priceDisplay) priceDisplay.textContent = `$${srv.price}`;
      if (depositDisplay) depositDisplay.textContent = `$${deposit}`;
      if (durationDisplay) durationDisplay.textContent = srv.duration;
    }

    if (serviceSelect) {
      serviceSelect.addEventListener('change', updateTouchupPricing);
      updateTouchupPricing();
    }

    timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        timeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTouchupTime = btn.dataset.time || btn.textContent.trim();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = getActiveClient();
      const srv = TOUCHUP_SERVICES.find(s => s.id === (serviceSelect ? serviceSelect.value : '')) || TOUCHUP_SERVICES[0];
      const artistId = artistSelect ? artistSelect.value : 'first-available';
      const artistOption = artistSelect && artistSelect.selectedOptions[0];
      const artistName = artistOption ? artistOption.textContent.trim() : 'First Available Master Artist';
      const dateVal = dateInput ? dateInput.value : '';
      const notesInput = document.getElementById('touchup-notes');
      const notesVal = notesInput ? notesInput.value.trim() : '';

      if (!dateVal) {
        if (window.PMUNotifications) {
          window.PMUNotifications.warning('Please select a preferred date for your touch-up session.');
        }
        return;
      }

      const deposit = Math.round(srv.price * 0.25);
      const newApt = PMUStorage.createAppointment({
        clientName: user.name,
        clientEmail: user.email,
        clientPhone: user.phone || '+1 (555) 234-5678',
        serviceId: srv.id,
        serviceName: srv.name,
        artistId,
        artistName,
        date: dateVal,
        time: selectedTouchupTime,
        status: 'Confirmed',
        depositPaid: deposit,
        totalPrice: srv.price,
        notes: notesVal || srv.noteHint
      });

      const confirmEl = document.getElementById('touchup-booking-confirmation');
      if (confirmEl) {
        confirmEl.classList.remove('d-none');
        confirmEl.innerHTML = `
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <strong><i class="fa-solid fa-circle-check me-1"></i> Touch-Up Confirmed (${escapeHTML(newApt.id)})</strong>
              <div class="small mt-1">${escapeHTML(newApt.serviceName)} with ${escapeHTML(newApt.artistName)} on ${escapeHTML(newApt.date)} at ${escapeHTML(newApt.time)}.</div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-success" onclick="PMUClientDashboard.viewSlip('${escapeHTML(newApt.id)}')">
              <i class="fa-solid fa-receipt me-1"></i> View Slip
            </button>
          </div>
        `;
      }

      if (notesInput) notesInput.value = '';
      renderClientOverview();
      renderClientAppointments();

      if (window.PMUNotifications) {
        window.PMUNotifications.success(`Touch-up booked (${newApt.id}) for ${newApt.date} at ${newApt.time}!`, 3500);
      }
    });
  }

  function preselectTouchUp(serviceId, artistName) {
    const section = document.getElementById('touchup-booking-section');
    const serviceSelect = document.getElementById('touchup-service-select');
    const artistSelect = document.getElementById('touchup-artist-select');

    if (serviceSelect && serviceId) {
      serviceSelect.value = serviceId;
      serviceSelect.dispatchEvent(new Event('change'));
    }

    if (artistSelect && artistName) {
      const match = Array.from(artistSelect.options).find(opt =>
        opt.textContent.toLowerCase().includes(artistName.toLowerCase())
      );
      if (match) {
        artistSelect.value = match.value;
      }
    }

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setupPrivateVaultControls() {
    const toggleBtn = document.getElementById('toggle-private-photos-btn');
    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', () => {
        setPrivacyLock(!isPrivatePhotosLocked);
      });
    }

    document.querySelectorAll('.vault-filter-btn').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vault-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeVaultFilter = btn.dataset.filter || 'all';
        renderPrivateBeforeAfter();
      });
    });

    updatePrivacyToggleButton();
  }

  function updatePrivacyToggleButton() {
    const toggleBtn = document.getElementById('toggle-private-photos-btn');
    if (!toggleBtn) return;
    if (isPrivatePhotosLocked) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-eye me-1"></i> Reveal Private Photos';
      toggleBtn.classList.remove('btn-pmu-outline');
      toggleBtn.classList.add('btn-pmu-gold');
    } else {
      toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash me-1"></i> Blur Private Photos';
      toggleBtn.classList.remove('btn-pmu-gold');
      toggleBtn.classList.add('btn-pmu-outline');
    }
  }

  function setPrivacyLock(locked) {
    isPrivatePhotosLocked = locked;
    try {
      sessionStorage.setItem(PRIVATE_VAULT_SESSION_KEY, locked ? 'false' : 'true');
    } catch (e) {}

    document.querySelectorAll('.private-ba-media').forEach(media => {
      media.classList.toggle('is-locked', locked);
    });
    updatePrivacyToggleButton();

    if (!locked) {
      initDashboardSliders();
      if (window.PMUNotifications) {
        window.PMUNotifications.info('Private clinical photos unlocked for this session.', 2200);
      }
    }
  }

  function initDashboardSliders() {
    if (window.PMUComparisonSlider && typeof window.PMUComparisonSlider.setupSlider === 'function') {
      document.querySelectorAll('#private-history-grid .comparison-slider, #client-treatment-history-list .comparison-slider').forEach(slider => {
        window.PMUComparisonSlider.setupSlider(slider);
        if (slider._pmuSlider && typeof slider._pmuSlider.syncImageWidth === 'function') {
          slider._pmuSlider.syncImageWidth();
        }
      });
    }
  }

  function renderBeforeAfterCardHTML(rec) {
    return `
      <div class="private-ba-card">
        <div class="private-ba-media ${isPrivatePhotosLocked ? 'is-locked' : ''}">
          <div class="comparison-slider-wrapper">
            <div class="comparison-slider">
              <img src="${escapeHTML(rec.afterImg)}" alt="${escapeHTML(rec.treatment)} healed result" class="img-after">
              <div class="img-before-wrapper">
                <img src="${escapeHTML(rec.beforeImg)}" alt="${escapeHTML(rec.treatment)} pre-procedure baseline">
              </div>
              <span class="slider-label slider-label-before">Before</span>
              <span class="slider-label slider-label-after">Healed After</span>
              <div class="comparison-handle" aria-label="Before and healed after comparison slider">
                <i class="fa-solid fa-arrows-left-right"></i>
              </div>
            </div>
          </div>

          <div class="private-ba-lock-overlay">
            <span class="private-ba-lock-icon"><i class="fa-solid fa-shield-halved"></i></span>
            <h6 class="font-serif text-white mb-1">Private Clinical Photo Protected</h6>
            <p class="small text-white-50 mb-0">Protected for your privacy. Use the Reveal Private Photos button at the top to view.</p>
          </div>
        </div>

        <div class="private-ba-body">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <span class="pmu-badge pmu-badge-gold">${escapeHTML(rec.stage)}</span>
            <small class="text-muted"><i class="fa-regular fa-calendar me-1"></i>${escapeHTML(rec.date)}</small>
          </div>
          <h6 class="font-serif fw-bold mb-1">${escapeHTML(rec.title)}</h6>
          <p class="text-muted small mb-3">${escapeHTML(rec.notes)}</p>

          <div class="private-ba-specs small mt-auto">
            <div class="d-flex justify-content-between gap-3 mb-1">
              <span class="text-muted flex-shrink-0">Master Artist:</span>
              <strong class="text-main text-end">${escapeHTML(rec.artist)}</strong>
            </div>
            <div class="d-flex justify-content-between gap-3 mb-1">
              <span class="text-muted flex-shrink-0">Pigment Formula:</span>
              <strong class="text-main text-end">${escapeHTML(rec.pigment)}</strong>
            </div>
            <div class="d-flex justify-content-between gap-3">
              <span class="text-muted flex-shrink-0">Needle / Blade:</span>
              <strong class="text-main text-end">${escapeHTML(rec.needle)}</strong>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-pmu-outline w-100 btn-book-touchup-record" onclick="PMUClientDashboard.preselectTouchUp('${escapeHTML(rec.touchupServiceId)}', '${escapeHTML(rec.artist)}')">
            <i class="fa-regular fa-calendar-plus me-1"></i> Book Touch-Up for This Treatment
          </button>
        </div>
      </div>
    `;
  }

  function renderPrivateBeforeAfter() {
    const grid = document.getElementById('private-history-grid');
    if (!grid) return;

    const filtered = activeVaultFilter === 'all'
      ? PRIVATE_BEFORE_AFTER_RECORDS
      : PRIVATE_BEFORE_AFTER_RECORDS.filter(r => r.category === activeVaultFilter);

    grid.innerHTML = filtered.map(rec => `
      <div class="col-12 col-lg-6">
        ${renderBeforeAfterCardHTML(rec)}
      </div>
    `).join('');

    initDashboardSliders();
  }

  function renderClientAppointments() {
    const tableBody = document.getElementById('client-appointments-table-body');
    if (!tableBody) return;

    const apts = getAppointmentsSafely();
    if (!apts.length) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No appointments found.</td></tr>';
      return;
    }

    tableBody.innerHTML = apts.map(a => {
      let badgeClass = 'bg-secondary';
      if (a.status === 'Confirmed') badgeClass = 'pmu-badge-gold';
      else if (a.status === 'Completed') badgeClass = 'pmu-badge-success';
      else if (a.status === 'Cancelled') badgeClass = 'pmu-badge-rose';

      return `
        <tr>
          <td><strong>${escapeHTML(a.id)}</strong></td>
          <td>
            <div class="fw-semibold">${escapeHTML(a.serviceName)}</div>
            <small class="text-muted">Total: $${escapeHTML(a.totalPrice)} (Deposit: $${escapeHTML(a.depositPaid || 0)})</small>
          </td>
          <td>${escapeHTML(a.artistName)}</td>
          <td>
            <div>${escapeHTML(a.date)}</div>
            <small class="text-muted">${escapeHTML(a.time)}</small>
          </td>
          <td><span class="pmu-badge ${badgeClass}">${escapeHTML(a.status)}</span></td>
          <td>
            <div class="d-flex gap-2">
              ${a.status === 'Confirmed' ? `
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="PMUClientDashboard.cancelBooking('${escapeHTML(a.id)}')" title="Cancel Appointment" aria-label="Cancel Appointment">
                  <i class="fa-solid fa-ban"></i>
                </button>
              ` : ''}
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="PMUClientDashboard.viewSlip('${escapeHTML(a.id)}')" title="View Booking Slip" aria-label="View Booking Slip">
                <i class="fa-solid fa-receipt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderTreatmentHistory() {
    const container = document.getElementById('client-treatment-history-list');
    if (!container) return;

    const apts = getAppointmentsSafely().filter(a => a.status === 'Completed' || a.pigmentRecord);
    const recordsHTML = PRIVATE_BEFORE_AFTER_RECORDS.map(rec => `
      <div class="col-12 col-lg-6">
        ${renderBeforeAfterCardHTML(rec)}
      </div>
    `).join('');

    const clinicalLogsHTML = apts.map(a => `
      <div class="pmu-card mb-4 p-4">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <span class="pmu-badge pmu-badge-gold mb-2">Record ID: ${escapeHTML(a.id)}</span>
            <h5 class="font-serif mb-1">${escapeHTML(a.serviceName)}</h5>
            <small class="text-muted">Administered on ${escapeHTML(a.date)} by Master ${escapeHTML(a.artistName)}</small>
          </div>
          <span class="pmu-badge pmu-badge-success"><i class="fa-solid fa-check"></i> Verified Clinical Log</span>
        </div>
        <div class="row g-3 bg-subtle p-3 rounded-3 mb-3">
          <div class="col-md-6">
            <small class="text-muted d-block">Pigment Formulation &amp; Brand</small>
            <strong class="text-main">${escapeHTML(a.pigmentRecord || 'Custom Organic Blend')}</strong>
          </div>
          <div class="col-md-6">
            <small class="text-muted d-block">Needle Cartridge &amp; Depth</small>
            <strong class="text-main">${escapeHTML(a.needleType || 'Nano 0.18mm Single Cartridge (Depth 0.3mm)')}</strong>
          </div>
          <div class="col-12">
            <small class="text-muted d-block">Artist Clinical Notes</small>
            <p class="text-muted small mb-0">${escapeHTML(a.notes || 'Normal skin retention. Symmetrical arch contours achieved.')}</p>
          </div>
        </div>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span class="small text-muted"><i class="fa-solid fa-shield-halved text-gold"></i> HIPAA &amp; Studio Privacy Protected</span>
          <a href="client-aftercare.html" class="btn btn-sm btn-pmu-outline">View Healing Protocol</a>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 class="font-serif mb-0">Private Before &amp; After Transformations</h5>
          <small class="text-muted">Protected client-only transformation comparisons</small>
        </div>
        <button type="button" id="toggle-private-photos-btn" class="btn btn-sm btn-pmu-gold"></button>
      </div>
      <div class="row g-4 mb-5">
        ${recordsHTML}
      </div>
      <h5 class="font-serif mb-3">Clinical Treatment Logs</h5>
      ${clinicalLogsHTML || '<div class="p-4 text-center text-muted">No clinical records found.</div>'}
    `;

    setupPrivateVaultControls();
    initDashboardSliders();
  }

  function cancelBooking(id) {
    if (confirm(`Are you sure you want to cancel appointment ${id}? Free cancellation applies up to 48h prior to session.`)) {
      PMUStorage.updateAppointmentStatus(id, 'Cancelled');
      if (window.PMUNotifications) {
        window.PMUNotifications.info(`Appointment ${id} has been cancelled.`);
      }
      renderClientOverview();
      renderClientAppointments();
    }
  }

  function viewSlip(id) {
    const apt = getAppointmentsSafely().find(a => a.id === id) || PMUStorage.getAppointmentById(id);
    if (!apt) return;

    let modalEl = document.getElementById('dynamicBookingSlipModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'dynamicBookingSlipModal';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = -1;
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-subtle border-bottom">
            <div class="d-flex align-items-center gap-2">
              <img src="assets/icons/logo.svg" alt="VELOURA Logo" width="28" height="28">
              <h5 class="modal-title font-serif mb-0">Official Booking Slip</h5>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="p-3 bg-subtle rounded-3 mb-3 border">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Appointment Reference:</span>
                <span class="fw-bold font-monospace text-gold">${escapeHTML(apt.id)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Client Name:</span>
                <span class="fw-semibold">${escapeHTML(apt.clientName)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">PMU Treatment:</span>
                <span class="fw-semibold">${escapeHTML(apt.serviceName)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Master Artist:</span>
                <span class="fw-semibold">${escapeHTML(apt.artistName)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Date &amp; Time:</span>
                <span class="fw-semibold">${escapeHTML(apt.date)} at ${escapeHTML(apt.time)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Status:</span>
                <span class="badge bg-success-subtle text-success border border-success-subtle">${escapeHTML(apt.status)}</span>
              </div>
              <div class="d-flex justify-content-between pt-2 border-top">
                <span class="text-muted small">Deposit Paid:</span>
                <span class="fw-bold text-main">$${escapeHTML(apt.depositPaid || 150)}</span>
              </div>
            </div>
            <p class="text-muted small mb-0">
              <i class="fa-solid fa-circle-info text-gold me-1"></i> Please arrive 15 minutes before your scheduled slot for clinical numbing and 3D symmetry mapping.
            </p>
          </div>
          <div class="modal-footer bg-subtle">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-sm btn-pmu-gold" onclick="window.print();"><i class="fa-solid fa-print me-1"></i> Print Slip</button>
          </div>
        </div>
      </div>
    `;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }

  function setupHealingChecklist() {
    const checkboxes = document.querySelectorAll('.healing-task-check');
    if (!checkboxes.length) return;

    try {
      const saved = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length === checkboxes.length) {
        checkboxes.forEach((cb, idx) => {
          cb.checked = Boolean(saved[idx]);
        });
      }
    } catch (e) {}

    function updateProgress() {
      const checked = Array.from(checkboxes).filter(c => c.checked).length;
      const total = checkboxes.length;
      const percent = Math.round((checked / total) * 100);

      const progressEl = document.getElementById('daily-care-progress');
      if (progressEl) {
        progressEl.textContent = `${percent}%`;
      }

      const progressBar = document.getElementById('daily-care-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }

      try {
        localStorage.setItem(
          CHECKLIST_STORAGE_KEY,
          JSON.stringify(Array.from(checkboxes).map(c => c.checked))
        );
      } catch (e) {}
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateProgress);
    });

    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    cancelBooking,
    viewSlip,
    preselectTouchUp,
    unlockPrivatePhotos: () => setPrivacyLock(false),
    lockPrivatePhotos: () => setPrivacyLock(true)
  };
})();

window.PMUClientDashboard = PMUClientDashboard;
