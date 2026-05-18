// ── Configuration ──
const API_BASE_URL = 'https://claims-casino-api.onrender.com'; // ← change this after Render deploy

// ── Testimonials Data ──
const testimonials = [
    { name: 'Marcus C.', role: 'sweeps engineer', location: 'San Francisco, CA', initials: 'MC', color: '#a855f7', tag: '@marc_sweeps', quote: 'been on the monitor for 2 weeks and already caught 3 limited drops that I would have 100% missed. the 15 second alerts are insane.' },
    { name: 'Jessica T.', role: 'auto-claimer', location: 'Austin, TX', initials: 'JT', color: '#22c55e', tag: '@jtorres_sc', quote: 'I was sleeping on free SC for months. this bot pays for itself in the first week easy. just hit my first $50 day.' },
    { name: 'David P.', role: 'bonus collector', location: 'Seattle, WA', initials: 'DP', color: '#f59e0b', tag: '@dp_bonus', quote: 'the auto-claim feature is goated. I have 30+ casinos set up and it just collects while I work. no more login fatigue.' },
    { name: 'Ryan M.', role: 'full-time claimer', location: 'Denver, CO', initials: 'RM', color: '#3b82f6', tag: '@ryan_cashes', quote: 'tried the free alert servers before and they were always 5 min late. here I get notified before the post even hits hot. huge diff.' },
    { name: 'Sarah B.', role: 'daily grinder', location: 'Chicago, IL', initials: 'SB', color: '#ec4899', tag: '@sarah_grind', quote: 'joined the waitlist back in january, got in february batch. best $0 I ever spent waiting lol. the S tier alerts are cracked.' },
    { name: 'Tyler W.', role: 'sc hoarder', location: 'Atlanta, GA', initials: 'TW', color: '#14b8a6', tag: '@tyler_stacks', quote: 'the kick monitor caught a streamer drop that nobody else had. felt like a cheat code. this community is legit.' },
    { name: 'Amanda F.', role: '24/7 member', location: 'Phoenix, AZ', initials: 'AF', color: '#f97316', tag: '@amanda_247', quote: 'my buddy told me about this and I thought he was capping. then I saw his dashboard with 80+ casinos tracked. instantly sold.' },
    { name: 'Kevin L.', role: 'spin specialist', location: 'Miami, FL', initials: 'KL', color: '#8b5cf6', tag: '@kevin_spinz', quote: 'not even trying to max SC, just want the free spins. the filter system lets me see only spin offers. exactly what I needed.' },
    { name: 'Emily R.', role: 'crypto degen', location: 'Portland, OR', initials: 'ER', color: '#06b6d4', tag: '@emily_rus', quote: 'the dashboard is clean af. love seeing the live stats and how much SC Ive stacked over time. UI is smooth.' },
];

const faqData = [
    { q: 'What is Sweepstakes Monitor?', a: 'Sweepstakes Monitor is a premium alert system that monitors Reddit and other sources for free Sweeps Coins (SC) and free spins offers from social casinos. We send instant Discord alerts so you never miss an opportunity.' },
    { q: 'How fast are the alerts?', a: 'Alerts are typically sent within 15 seconds of a post being published. This is significantly faster than free alert groups which have 6-8 minute delays.' },
    { q: 'Which casinos do you monitor?', a: 'We monitor 80+ social casinos across three tiers: S Tier (28 casinos like Crown Coins, McLuck, Pulsz, Stake.us), A Tier (31 casinos), and B Tier (22 casinos). The full list is accessible to members.' },
    { q: 'Is there a waitlist?', a: 'Yes. All spots are currently filled. You can join the waitlist with your email and we will notify you the moment a new batch opens up. Spots are first come, first served.' },
    { q: 'How much does it cost?', a: 'Elite Access is a one-time payment. Pricing for the next batch will be announced when spots open. Previous batches were $299 lifetime.' },
    { q: 'How do I get notified when spots open?', a: 'Join the waitlist with your email (and optionally your Discord username). We will send you an email the moment a new batch drops. You will have 24 hours to claim your spot.' },
    { q: 'How do I receive alerts?', a: 'Alerts are sent to our private Discord server. You will receive an invite link after purchasing your license key.' },
    { q: 'Can I claim bonuses automatically?', a: 'Yes, members get access to the auto-claim bot that automatically logs into your casino accounts and claims daily bonuses on a 24-hour schedule.' },
];

// ── State ──
const API_BASE = window.location.origin;
let carouselIndex = 0;
let carouselTimer = null;
const CAROUSEL_INTERVAL = 5000;

// ── DOM refs ──
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

// ── Page Navigation ──
function navigateTo(pageId) {
    // Guard auth-required pages
    const tab = $(`.nav-tab[data-page="${pageId}"]`);
    if (tab && tab.hasAttribute('data-auth') && !isLoggedIn()) {
        pageId = 'home';
    }

    $$('.page').forEach(p => p.classList.remove('active'));
    const target = $(`.page[data-page="${pageId}"]`);
    if (target) target.classList.add('active');

    $$('.nav-tab').forEach(t => t.classList.remove('active'));
    const tab2 = $(`.nav-tab[data-page="${pageId}"]`);
    if (tab2) tab2.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'dashboard') initDashboard();
    if (pageId === 'testimonials') startCarousel();
    if (pageId === 'profile') initProfile();
    if (pageId === 'pros') { renderPros(); goToProsSlide(0); }
}

document.getElementById('navTabs').addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    navigateTo(tab.dataset.page);
});

document.querySelector('.logo').addEventListener('click', e => {
    e.preventDefault();
    navigateTo('home');
});

document.querySelector('.footer-links').addEventListener('click', e => {
    const link = e.target.closest('[data-page]');
    if (link) { e.preventDefault(); navigateTo(link.dataset.page); }
});

document.querySelector('.contact-info').addEventListener('click', e => {
    const btn = e.target.closest('.link-btn');
    if (btn) { e.preventDefault(); navigateTo(btn.dataset.page); }
});

// ── Render Testimonials Carousel ──
function renderTestimonials() {
    const track = $('#carouselTrack');
    track.innerHTML = testimonials.map((t, i) => {
        const months = Math.floor(Math.random() * 8) + 3;
        return `
        <div class="testimonial-card" style="animation-delay:${i * 0.1}s">
            <div class="testimonial-card-glow"></div>
            <div class="testimonial-stars">
                <span class="star-bg">★★★★★</span>
                <span class="star-fg">★★★★★</span>
            </div>
            <div class="testimonial-quote">"${t.quote}"</div>
            <div class="testimonial-footer">
                <div class="testimonial-author">
                    <div class="testimonial-avatar" style="background: linear-gradient(135deg, ${t.color}, ${t.color}88)">${t.initials}</div>
                    <div class="testimonial-info">
                        <h4>${t.name}</h4>
                        <span class="testimonial-role">${t.role}</span>
                        <span class="testimonial-tag">${t.tag}</span>
                        <span class="testimonial-location"><i class="fas fa-map-marker-alt"></i> ${t.location}</span>
                    </div>
                </div>
                <div class="testimonial-meta">
                    <span class="testimonial-verified"><i class="fas fa-check-circle"></i> Verified Member</span>
                    <span class="testimonial-date">${months} months ago</span>
                </div>
            </div>
        </div>`;
    }).join('');

    renderDots();
}

function renderDots() {
    const dots = $('#carouselDots');
    dots.innerHTML = testimonials.map((_, i) =>
        `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
    ).join('');

    dots.addEventListener('click', e => {
        const dot = e.target.closest('.carousel-dot');
        if (!dot) return;
        goToSlide(parseInt(dot.dataset.index));
    });
}

function goToSlide(index) {
    const track = $('#carouselTrack');
    const total = testimonials.length;
    carouselIndex = (index + total) % total;
    track.style.transform = `translateX(-${carouselIndex * 100}%)`;

    $$('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === carouselIndex);
    });

    resetCarouselTimer();
}

function nextSlide() { goToSlide(carouselIndex + 1); }
function prevSlide() { goToSlide(carouselIndex - 1); }

function resetCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, CAROUSEL_INTERVAL);
}

function startCarousel() {
    if (carouselTimer) return;
    carouselTimer = setInterval(nextSlide, CAROUSEL_INTERVAL);
}

$('#carouselNext').addEventListener('click', nextSlide);
$('#carouselPrev').addEventListener('click', prevSlide);

// ── Render FAQ ──
function renderFAQ() {
    $('#faqList').innerHTML = faqData.map(f => `
        <div class="faq-item">
            <div class="faq-question">${f.q} <i class="fas fa-chevron-down"></i></div>
            <div class="faq-answer">${f.a}</div>
        </div>
    `).join('');

    $('#faqList').addEventListener('click', e => {
        const item = e.target.closest('.faq-item');
        if (!item) return;
        item.classList.toggle('open');
    });
}

// ── Pros Section Data ──
const prosData = [
    { name: 'CryptoKing', tag: '@crypto_claimer', initials: 'CK', color: '#a855f7', earnings: '12,450 SC', strategy: 'Catches limited drops before they hit the front page.', detail: 'With 15-second alerts, CryptoKing snags high-value SC drops before the rush. "I used to miss everything. Now I catch 90% of S-tier offers before they sell out."' },
    { name: 'BonusHunter', tag: '@auto_claim_goat', initials: 'BH', color: '#22c55e', earnings: '8,230 SC', strategy: 'Auto-claim bot collects daily bonuses while he sleeps.', detail: '"I set it up once and forgot about it. The auto-claimer runs 24/7 across 30+ casinos. Waking up to SC in my account never gets old."' },
    { name: 'DailyGrinder', tag: '@never_miss', initials: 'DG', color: '#3b82f6', earnings: '6,780 SC', strategy: 'Zero missed free spins — tracks every casino rotation.', detail: '"Before this monitor, I was manually checking 20+ sites. Now I get pinged instantly. Havent missed a daily spin in 4 months."' },
    { name: 'SweepStacker', tag: '@tier_hopper', initials: 'SS', color: '#f59e0b', earnings: '5,200 SC', strategy: 'Combines S, A, and B tier alerts for maximum yield.', detail: '"The tier system changed everything. I run S-tier for big hits, B-tier for volume. The combo alone doubled my monthly SC."' },
    { name: 'NoSleepSC', tag: '@night_owl', initials: 'NS', color: '#ec4899', earnings: '4,900 SC', strategy: '24/7 monitoring catches overnight drops.', detail: '"The best SC drops happen at 3 AM when nobody is watching. My monitor never sleeps. Woke up to 800 SC last Tuesday alone."' },
    { name: 'WalletWatcher', tag: '@filter_king', initials: 'WW', color: '#14b8a6', earnings: '3,850 SC', strategy: 'Filtered alerts mean zero noise, only winning plays.', detail: '"The filter system is the real MVP. I only get pinged for offers above 2 SC. No clutter, no FOMO, just consistent wins."' },
];

let prosIndex = 0;

function renderPros() {
    const track = $('#prosTrack');
    if (!track) return;
    track.innerHTML = prosData.map(p => `
        <div class="pros-card">
            <div class="pros-avatar" style="background:linear-gradient(135deg,${p.color},${p.color}88);">${p.initials}</div>
            <div class="pros-card-body">
                <div class="pros-name">${p.name}</div>
                <span class="pros-tag">${p.tag}</span>
                <div class="pros-earnings"><i class="fas fa-coins"></i> ${p.earnings}</div>
                <div class="pros-strategy">${p.strategy}</div>
                <div class="pros-detail" id="prosDetail_${prosData.indexOf(p)}">${p.detail}</div>
                <button class="pros-read-more" data-index="${prosData.indexOf(p)}">Read more <i class="fas fa-chevron-down"></i></button>
            </div>
        </div>
    `).join('');
}

function goToProsSlide(index) {
    const track = $('#prosTrack');
    const total = prosData.length;
    if (!track) return;
    prosIndex = ((index % total) + total) % total;
    track.style.transform = `translateX(-${prosIndex * 100}%)`;
    updateProsBar();
}

function updateProsBar() {
    const fill = $('#prosBarFill');
    if (!fill) return;
    const pct = (prosIndex / (prosData.length - 1)) * 100;
    fill.style.width = pct + '%';
}

$('#prosTrack')?.addEventListener('click', e => {
    const btn = e.target.closest('.pros-read-more');
    if (!btn) return;
    const idx = btn.dataset.index;
    const detail = $('#prosDetail_' + idx);
    if (detail) {
        detail.classList.toggle('open');
        btn.classList.toggle('open');
        btn.innerHTML = detail.classList.contains('open') ? 'Read less <i class="fas fa-chevron-up"></i>' : 'Read more <i class="fas fa-chevron-down"></i>';
    }
});

$('#prosNext')?.addEventListener('click', () => goToProsSlide(prosIndex + 1));
$('#prosPrev')?.addEventListener('click', () => goToProsSlide(prosIndex - 1));

// ── Hero/CTA buttons ──
document.getElementById('getStartedBtn').addEventListener('click', () => navigateTo('plans'));
document.getElementById('heroCta').addEventListener('click', () => navigateTo('plans'));
document.getElementById('learnMoreBtn').addEventListener('click', () => navigateTo('features'));

// ── Waitlist button opens modal ──
document.getElementById('waitlistBtn').addEventListener('click', () => openWaitlistModal());

// ── Waitlist Modal ──
const waitlistModal = $('#waitlistModal');
const waitlistSubmit = $('#waitlistSubmit');
const waitlistDoneBtn = $('#waitlistDoneBtn');
const waitlistLoading = $('#waitlistLoading');
const waitlistLoadingText = $('#waitlistLoadingText');
const waitlistPosition = $('#waitlistPosition');
const waitlistStepForm = $('#waitlistStepForm');
const waitlistStepSuccess = $('#waitlistStepSuccess');
const waitlistEmail = $('#waitlistEmail');
const waitlistDiscord = $('#waitlistDiscord');

function openWaitlistModal() {
    waitlistStepForm.style.display = 'block';
    waitlistStepSuccess.style.display = 'none';
    waitlistLoading.style.display = 'none';
    waitlistModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    if (modalId) {
        $('#' + modalId).classList.remove('active');
    } else {
        waitlistModal.classList.remove('active');
    }
    document.body.style.overflow = '';
}

$('#modalClose').addEventListener('click', () => closeModal());
waitlistModal.addEventListener('click', e => {
    if (e.target === waitlistModal) closeModal();
});

waitlistSubmit.addEventListener('click', () => {
    const email = waitlistEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        waitlistEmail.classList.add('error');
        return;
    }
    waitlistEmail.classList.remove('error');

    waitlistStepForm.style.display = 'none';
    waitlistLoading.style.display = 'flex';
    waitlistLoadingText.textContent = 'Adding you to the list...';

    setTimeout(() => {
        const pos = Math.floor(Math.random() * 200) + 5;
        waitlistPosition.textContent = '#' + pos;
        waitlistLoading.style.display = 'none';
        waitlistStepSuccess.style.display = 'block';
    }, 1800);
});

waitlistDoneBtn.addEventListener('click', () => {
    closeModal();
    navigateTo('home');
});

// ── Login / Auth ──
const VALID_ID = '124';
const CUSTOMER_LS_KEY = 'sweepstakes_user';

function isLoggedIn() {
    return localStorage.getItem(CUSTOMER_LS_KEY) === VALID_ID;
}

function updateNavAuth() {
    const iconBtn = $('#profileIconBtn');
    const iconDefault = $('#profileIconDefault');
    const iconInitial = $('#profileIconInitial');
    const ddSignIn = $('#ddSignIn');
    const ddProfile = $('#ddProfile');
    const ddSettings = $('#ddSettings');
    const ddDivider = $('#ddDivider');
    const ddLogout = $('#ddLogout');

    $$('.nav-tab[data-auth="required"]').forEach(t => {
        t.style.display = isLoggedIn() ? '' : 'none';
    });

    if (isLoggedIn()) {
        iconDefault.style.display = 'none';
        iconInitial.style.display = 'flex';
        ddSignIn.style.display = 'none';
        ddProfile.style.display = 'flex';
        ddSettings.style.display = 'flex';
        ddDivider.style.display = 'block';
        ddLogout.style.display = 'flex';
    } else {
        iconDefault.style.display = 'block';
        iconInitial.style.display = 'none';
        ddSignIn.style.display = 'flex';
        ddProfile.style.display = 'none';
        ddSettings.style.display = 'none';
        ddDivider.style.display = 'none';
        ddLogout.style.display = 'none';
    }
}

function toggleProfileDropdown(e) {
    e.stopPropagation();
    const dd = $('#profileDropdown');
    dd.classList.toggle('show');
}

function hideProfileDropdown() {
    $('#profileDropdown').classList.remove('show');
}

function handleLogin() {
    const input = $('#loginId');
    const error = $('#loginError');
    const val = input.value.trim();

    if (!val) {
        error.textContent = 'Please enter your license ID.';
        error.classList.add('visible');
        input.classList.add('error');
        return;
    }

    if (val !== VALID_ID) {
        error.textContent = 'Invalid license ID. Please try again.';
        error.classList.add('visible');
        input.classList.add('error');
        return;
    }

    localStorage.setItem(CUSTOMER_LS_KEY, val);
    if (!localStorage.getItem('member_since')) {
        localStorage.setItem('member_since', Date.now().toString());
    }
    localStorage.setItem('last_login', Date.now().toString());
    updateNavAuth();
    closeModal('loginModal');
    input.value = '';
    input.classList.remove('error');
    error.classList.remove('visible');
    hideProfileDropdown();
}

function handleLogout() {
    localStorage.removeItem(CUSTOMER_LS_KEY);
    updateNavAuth();
    navigateTo('home');
    hideProfileDropdown();
}

function openLoginModal() {
    $('#loginId').value = '';
    $('#loginId').classList.remove('error');
    $('#loginError').classList.remove('visible');
    $('#loginModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#loginId').focus(), 100);
    hideProfileDropdown();
}

// Profile icon dropdown
$('#profileIconBtn').addEventListener('click', toggleProfileDropdown);
document.addEventListener('click', e => {
    const wrap = $('.profile-icon-wrap');
    if (wrap && !wrap.contains(e.target)) hideProfileDropdown();
});

// Dropdown items
$('#ddSignIn').addEventListener('click', openLoginModal);
$('#ddProfile').addEventListener('click', () => { hideProfileDropdown(); navigateTo('profile'); });
$('#ddSettings').addEventListener('click', () => { hideProfileDropdown(); navigateTo('profile'); });
$('#ddLogout').addEventListener('click', handleLogout);

// Login modal event listeners
$('#loginSubmit').addEventListener('click', handleLogin);
$('#loginModalClose').addEventListener('click', () => closeModal('loginModal'));
$('#loginModal').addEventListener('click', e => {
    if (e.target === $('#loginModal')) closeModal('loginModal');
});
$('#loginId').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
});
$('#loginPlansLink').addEventListener('click', e => {
    e.preventDefault();
    closeModal('loginModal');
    navigateTo('plans');
});

// ── Profile page ──
const PROFILE_LS_KEY = 'profile_data';

function initProfile() {
    const profileEl = $('#profilePage');
    if (!profileEl) return;

    // Avatar letter
    const letter = $('#profileAvatarLetter');
    if (letter) letter.textContent = VALID_ID.charAt(0);

    // Member since
    const ms = localStorage.getItem('member_since');
    const joinDate = ms ? new Date(parseInt(ms)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    $$('#profileJoinDate, #profileJoinDate2').forEach(el => { if (el) el.textContent = joinDate; });

    // Last login
    const ll = localStorage.getItem('last_login');
    if (ll) {
        const el = $('#profileLastLogin');
        if (el) el.textContent = new Date(parseInt(ll)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Bio
    const saved = localStorage.getItem(PROFILE_LS_KEY);
    const data = saved ? JSON.parse(saved) : {};
    if (data.bio) {
        const el = $('#profileBioText');
        if (el) el.textContent = data.bio;
    }

    // Discord
    if (data.discord) {
        const el = $('#profileDiscord');
        if (el) el.value = data.discord;
    }

    // Fetch live stats
    fetch(API_BASE_URL + '/api/data', { signal: AbortSignal.timeout(5000) })
        .then(r => r.json())
        .then(d => {
            const alertsEl = $('#profileAlerts');
            const scEl = $('#profileScTotal');
            if (alertsEl) alertsEl.textContent = (d.found || 0).toLocaleString();
            if (scEl) scEl.textContent = (d.sc_total || 0).toFixed(2) + ' SC';
        })
        .catch(() => {
            const alertsEl = $('#profileAlerts');
            const scEl = $('#profileScTotal');
            if (alertsEl) alertsEl.textContent = '—';
            if (scEl) scEl.textContent = '—';
        });

    // Theme toggle sync
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const darkBtn = $('#profileThemeDark');
    const lightBtn = $('#profileThemeLight');
    if (darkBtn && lightBtn) {
        darkBtn.classList.toggle('active', !isLight);
        lightBtn.classList.toggle('active', isLight);
    }
}

// Profile: edit bio
$('#profileEditBioBtn')?.addEventListener('click', () => {
    const display = $('#profileBioDisplay');
    const edit = $('#profileBioEdit');
    const input = $('#profileBioInput');
    const text = $('#profileBioText');
    if (display && edit && input && text) {
        display.style.display = 'none';
        edit.style.display = 'block';
        input.value = text.textContent === 'No bio yet. Tell the community about yourself.' ? '' : text.textContent;
        input.focus();
        const c = $('#profileBioCounter');
        if (c) c.textContent = input.value.length + '/300';
    }
});

$('#profileSaveBioBtn')?.addEventListener('click', () => {
    const input = $('#profileBioInput');
    const text = $('#profileBioText');
    const display = $('#profileBioDisplay');
    const edit = $('#profileBioEdit');
    if (!input || !text || !display || !edit) return;
    const val = input.value.trim();
    text.textContent = val || 'No bio yet. Tell the community about yourself.';
    const saved = JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || '{}');
    saved.bio = val;
    localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(saved));
    display.style.display = 'block';
    edit.style.display = 'none';
});

$('#profileCancelBioBtn')?.addEventListener('click', () => {
    const display = $('#profileBioDisplay');
    const edit = $('#profileBioEdit');
    if (display && edit) {
        display.style.display = 'block';
        edit.style.display = 'none';
    }
});

$('#profileBioInput')?.addEventListener('input', () => {
    const el = $('#profileBioCounter');
    const input = $('#profileBioInput');
    if (el && input) el.textContent = input.value.length + '/300';
});

// Profile: save discord
$('#profileSaveDiscord')?.addEventListener('click', () => {
    const input = $('#profileDiscord');
    if (!input) return;
    const saved = JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || '{}');
    saved.discord = input.value.trim();
    localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(saved));
    input.blur();
});

// Profile: theme toggle
$('#profileThemeDark')?.addEventListener('click', () => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
    $('#profileThemeDark')?.classList.add('active');
    $('#profileThemeLight')?.classList.remove('active');
});

$('#profileThemeLight')?.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    $('#profileThemeLight')?.classList.add('active');
    $('#profileThemeDark')?.classList.remove('active');
});

// Profile nav button
$('#profileBtn')?.addEventListener('click', () => navigateTo('profile'));

// ── Dashboard Embed with Auth Gate ──
let countdownActive = false;
let countdownTimer = null;

function initDashboard() {
    const msg = $('#dashRedirectMsg');
    const gateMsg = $('#dashGateMsg');
    const num = $('#countdownNum');
    const circle = $('#countdownCircle');
    const cancelBtn = $('#cancelRedirect');

    gateMsg.style.display = 'none';
    gateMsg.className = 'dash-gate-msg';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    cancelBtn.className = 'btn btn-outline';
    num.textContent = '5';
    circle.style.strokeDashoffset = '0';

    if (!isLoggedIn()) {
        gateMsg.style.display = 'block';
        gateMsg.className = 'dash-gate-msg error';
        gateMsg.innerHTML = '<i class="fas fa-lock"></i> Login required. <button class="link-btn" id="dashLoginBtn">Sign in</button> to access the dashboard.';
        msg.textContent = 'Please log in to continue';
        num.textContent = '—';
        cancelBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Home';
        cancelBtn.className = 'btn btn-primary';
        cancelBtn.onclick = () => navigateTo('home');
        const loginBtn = $('#dashLoginBtn');
        if (loginBtn) loginBtn.onclick = () => openLoginModal();
        return;
    }

    // Logged in — start countdown
    msg.textContent = 'Preparing your monitor — redirecting in...';
    startCountdown(num, circle, cancelBtn);
}

function loadEmbeddedDashboard() {
    const container = $('#dashboardPage');
    container.innerHTML = `
        <div class="dash-embed-container">
            <div class="dash-embed-header">
                <button class="btn btn-outline btn-sm" onclick="navigateTo('home')">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <h3>MONITOR</h3>
                <div style="width:88px;"></div>
            </div>
            <iframe id="dashFrame" class="dash-embed-frame" src="${API_BASE_URL}/api/embed-dashboard"></iframe>
        </div>`;

    const frame = $('#dashFrame');
    let loaded = false;
    const timeout = setTimeout(() => {
        if (!loaded) {
            frame.classList.add('error');
            container.innerHTML += '<div class="dash-embed-error"><i class="fas fa-exclamation-triangle"></i><p>Could not connect to the dashboard server.</p><small>Make sure the backend server is running.</small></div>';
        }
    }, 8000);
    frame.addEventListener('load', () => { loaded = true; clearTimeout(timeout); });
}

function startCountdown(numEl, circleEl, cancelBtn) {
    let sec = 5;
    countdownActive = true;
    const circumference = 263.89;

    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.onclick = () => {
        countdownActive = false;
        if (countdownTimer) clearInterval(countdownTimer);
        countdownTimer = null;
        numEl.textContent = '5';
        circleEl.style.strokeDashoffset = '0';
        navigateTo('home');
    };

    countdownTimer = setInterval(() => {
        sec--;
        numEl.textContent = sec;
        const offset = circumference * (1 - sec / 5);
        circleEl.style.strokeDashoffset = offset;

        if (sec <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            countdownActive = false;
            loadEmbeddedDashboard();
        }
    }, 1000);
}

// ── Contact form ──
document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const message = document.getElementById('contactMessage');
    const status = document.getElementById('contactStatus');

    let valid = true;
    [name, email, message].forEach(el => {
        el.classList.remove('error');
        if (!el.value.trim()) { el.classList.add('error'); valid = false; }
    });

    if (!valid) {
        status.className = 'contact-status error';
        status.textContent = 'Please fill in all required fields.';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error');
        status.className = 'contact-status error';
        status.textContent = 'Please enter a valid email address.';
        return;
    }

    status.className = 'contact-status';
    status.style.display = 'block';
    status.textContent = 'Sending your message...';
    status.style.color = 'var(--text-muted)';

    setTimeout(() => {
        status.className = 'contact-status success';
        status.textContent = 'Message sent! We will get back to you within 24 hours.';
        document.getElementById('contactForm').reset();
    }, 1500);
});

// ── Money Matrix Rain ──
(function initMoneyMatrix() {
    const canvas = document.getElementById('moneyMatrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = ['$', '€', '₿', '¢', '¥', '£', '💰', '💵', '💎', '✦', '⟡', '◈'];
    const fontSize = 14;
    const cols = Math.ceil(W / fontSize);
    const drops = Array(cols).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
        ctx.fillRect(0, 0, W, H);

        for (let i = 0; i < cols; i++) {
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            const char = chars[Math.floor(Math.random() * chars.length)];

            const brightness = Math.max(0.3, 1 - (y / H) * 0.7);
            const r = Math.floor(140 * brightness);
            const g = Math.floor(220 * brightness);
            const b = Math.floor(100 * brightness);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${brightness * 0.6})`;
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(char, x, y);

            if (y > H && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);
})();

// ── Init ──
renderTestimonials();
renderFAQ();
updateNavAuth();
navigateTo('home');
