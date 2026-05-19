// ── Configuration ──
const API_BASE_URL = 'https://casinoclaims.onrender.com';

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

// ── DOM refs ──
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];

// ── Page Navigation ──
function navigateTo(pageId) {
    // Clear dashboard countdown if leaving
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        countdownActive = false;
    }

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
    if (pageId === 'testimonials') renderTestimonials();
    if (pageId === 'profile') initProfile();
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

// ── Render Testimonials Grid ──
function renderTestimonials() {
    const grid = $('#testimonialGrid');
    if (!grid || grid.children.length > 0) return;
    grid.innerHTML = testimonials.map((t, i) => {
        const months = Math.floor(Math.random() * 8) + 3;
        return `
        <div class="testimonial-card" style="animation-delay:${i * 0.1}s">
            <div class="testimonial-stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <div class="testimonial-quote">"${t.quote}"</div>
            <div class="testimonial-footer">
                <div class="testimonial-author">
                    <div class="testimonial-avatar" style="background: linear-gradient(135deg, ${t.color}, ${t.color}88)">${t.initials}</div>
                    <div class="testimonial-info">
                        <h4>${t.name}</h4>
                        <span class="testimonial-role">${t.role}</span>
                        <span class="testimonial-tag">${t.tag}</span>
                    </div>
                </div>
                <div class="testimonial-meta">
                    <span class="testimonial-verified"><i class="fas fa-check-circle"></i> Verified Member</span>
                    <span class="testimonial-date">${months} months ago</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

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

// ── Hero/CTA buttons ──
document.getElementById('getStartedBtn').addEventListener('click', () => navigateTo('plans'));

document.getElementById('heroCta').addEventListener('click', () => {
    navigateTo('plans');
    setTimeout(() => {
        const section = $('#plans');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            section.classList.remove('highlight-pulse');
            void section.offsetWidth;
            section.classList.add('highlight-pulse');
        }
    }, 200);
});

document.getElementById('learnMoreBtn').addEventListener('click', () => {
    navigateTo('features');
    setTimeout(() => {
        const section = $('#features');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            section.classList.remove('highlight-pulse');
            void section.offsetWidth;
            section.classList.add('highlight-pulse');
        }
    }, 200);
});

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
    const discord = waitlistDiscord.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        waitlistEmail.classList.add('error');
        return;
    }
    waitlistEmail.classList.remove('error');

    waitlistStepForm.style.display = 'none';
    waitlistLoading.style.display = 'flex';
    waitlistLoadingText.textContent = 'Submitting your application...';

    fetch(API_BASE_URL + '/api/waitlist-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, discord, type: 'waitlist' })
    })
    .then(r => r.json())
    .then(data => {
        waitlistPosition.textContent = '#' + (data.position || Math.floor(Math.random() * 200) + 5);
        waitlistLoading.style.display = 'none';
        waitlistStepSuccess.style.display = 'block';

        // Poll for approval
        let pollCount = 0;
        const poll = setInterval(() => {
            pollCount++;
            fetch(API_BASE_URL + '/api/check-approval?email=' + encodeURIComponent(email))
                .then(r => r.json())
                .then(d => {
                    if (d.approved && d.license_id) {
                        clearInterval(poll);
                        localStorage.setItem(CUSTOMER_LS_KEY, d.license_id);
                        if (discord) setDiscordId(discord);
                        localStorage.setItem('member_since', Date.now().toString());
                        localStorage.setItem('last_login', Date.now().toString());
                        updateNavAuth();
                        closeModal();
                        navigateTo('dashboard');
                    }
                })
                .catch(() => {});
            if (pollCount > 120) clearInterval(poll); // stop after 10 min
        }, 5000);
    })
    .catch(() => {
        waitlistLoadingText.textContent = 'Server error. Try again later.';
    });
});

waitlistDoneBtn.addEventListener('click', () => {
    closeModal();
    navigateTo('home');
});

// ── Login / Auth ──
const CUSTOMER_LS_KEY = 'sweepstakes_user';
const USER_LS_KEY = 'discord_user';

function isLoggedIn() {
    return !!localStorage.getItem(CUSTOMER_LS_KEY);
}

function getDiscordId() {
    return localStorage.getItem(USER_LS_KEY) || '';
}

function setDiscordId(id) {
    localStorage.setItem(USER_LS_KEY, id);
}

function updateNavAuth() {
    const iconDefault = $('#profileIconDefault');
    const iconInitial = $('#profileIconInitial');
    const authPanel = $('#ddAuthPanel');
    const userPanel = $('#ddUserPanel');
    const getStartedBtn = $('#getStartedBtn');

    $$('.nav-tab[data-auth="required"]').forEach(t => {
        t.style.display = isLoggedIn() ? '' : 'none';
    });

    if (isLoggedIn()) {
        iconDefault.style.display = 'none';
        iconInitial.style.display = 'flex';
        iconInitial.textContent = getDiscordId().charAt(0).toUpperCase() || '?';
        authPanel.style.display = 'none';
        userPanel.style.display = 'block';
        getStartedBtn.style.display = 'none';
    } else {
        iconDefault.style.display = 'block';
        iconInitial.style.display = 'none';
        authPanel.style.display = 'block';
        userPanel.style.display = 'none';
        getStartedBtn.style.display = 'inline-flex';
    }
}

function handleLogin() {
    const discord = $('#ddLoginDiscord').value.trim();
    const password = $('#ddLoginPassword').value.trim();
    const msg = $('#ddLoginMsg');

    if (!discord || !password) {
        msg.textContent = 'Please fill in all fields.';
        msg.style.display = 'block';
        return;
    }

    // Simple local auth: discord ID is the key, any password works
    // In production this would validate against a server
    setDiscordId(discord);
    localStorage.setItem(CUSTOMER_LS_KEY, discord);
    if (!localStorage.getItem('member_since')) {
        localStorage.setItem('member_since', Date.now().toString());
    }
    localStorage.setItem('last_login', Date.now().toString());
    updateNavAuth();
    $('#ddLoginDiscord').value = '';
    $('#ddLoginPassword').value = '';
    msg.style.display = 'none';
    navigateTo('dashboard');
}

function handleRegister() {
    const email = $('#ddRegisterEmail').value.trim();
    const discord = $('#ddRegisterDiscord').value.trim();
    const password = $('#ddRegisterPassword').value.trim();
    const msg = $('#ddRegisterMsg');

    if (!email || !discord || !password) {
        msg.textContent = 'Please fill in all fields.';
        msg.style.display = 'block';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Please enter a valid email.';
        msg.style.display = 'block';
        return;
    }

    msg.style.display = 'none';

    // Send registration to server for admin approval
    fetch(API_BASE_URL + '/api/waitlist-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, discord, password, type: 'registration' })
    })
    .then(r => r.json())
    .then(data => {
        msg.style.color = 'var(--green)';
        msg.textContent = 'Registration submitted! Awaiting admin approval.';
        msg.style.display = 'block';

        // Poll for approval
        let pollCount = 0;
        const poll = setInterval(() => {
            pollCount++;
            fetch(API_BASE_URL + '/api/check-approval?discord=' + encodeURIComponent(discord))
                .then(r => r.json())
                .then(d => {
                    if (d.approved && d.license_id) {
                        clearInterval(poll);
                        setDiscordId(discord);
                        localStorage.setItem(CUSTOMER_LS_KEY, d.license_id);
                        localStorage.setItem('member_since', Date.now().toString());
                        localStorage.setItem('last_login', Date.now().toString());
                        updateNavAuth();
                        msg.style.display = 'none';
                        navigateTo('dashboard');
                    }
                })
                .catch(() => {});
            if (pollCount > 120) clearInterval(poll);
        }, 5000);
    })
    .catch(() => {
        msg.style.color = 'var(--red)';
        msg.textContent = 'Server error. Try again later.';
        msg.style.display = 'block';
    });
}

function handleLogout() {
    localStorage.removeItem(CUSTOMER_LS_KEY);
    localStorage.removeItem(USER_LS_KEY);
    updateNavAuth();
    navigateTo('home');
}

// ── Auth tab switching ──
$$('.dd-auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.dd-auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const form = tab.dataset.authTab;
        $('#ddLoginForm').style.display = form === 'login' ? 'flex' : 'none';
        $('#ddRegisterForm').style.display = form === 'register' ? 'flex' : 'none';
        $$('.dd-auth-msg').forEach(m => m.style.display = 'none');
    });
});

// Auth form submissions
$('#ddLoginBtn').addEventListener('click', handleLogin);
$('#ddLoginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
$('#ddRegisterBtn').addEventListener('click', handleRegister);
$('#ddRegisterPassword').addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });

// Logout
$('#ddLogout').addEventListener('click', handleLogout);

// Dropdown: hover behavior (CSS handles visibility)
// Clicking items in dropdown
$('#ddProfile').addEventListener('click', () => navigateTo('profile'));
$('#ddSettings').addEventListener('click', () => navigateTo('profile'));

// ── Programmatic dropdown control ──
function openProfileDropdown() {
    const wrap = document.querySelector('.profile-icon-wrap');
    if (wrap) wrap.classList.add('force-open');
}

function closeProfileDropdown() {
    const wrap = document.querySelector('.profile-icon-wrap');
    if (wrap) wrap.classList.remove('force-open');
}

document.addEventListener('click', e => {
    const wrap = document.querySelector('.profile-icon-wrap');
    if (wrap && wrap.classList.contains('force-open') && !wrap.contains(e.target)) {
        closeProfileDropdown();
    }
});

// ── Profile page ──
const PROFILE_LS_KEY = 'profile_data';

function initProfile() {
    const profileEl = $('#profilePage');
    if (!profileEl) return;

    // Avatar letter
    const letter = $('#profileAvatarLetter');
    if (letter) letter.textContent = getDiscordId().charAt(0).toUpperCase() || '?';

    // Name
    const nameEl = $('#profileName');
    if (nameEl) nameEl.textContent = getDiscordId() || 'Customer';

    // Member since
    const ms = localStorage.getItem('member_since');
    const joinDate = ms ? new Date(parseInt(ms)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    $$('#profileJoinDate, #profileJoinDate2').forEach(el => { if (el) el.textContent = joinDate; });

    // Discord ID display
    const licEl = $('#profileLicenseId');
    if (licEl) licEl.textContent = getDiscordId() || '—';

    // Email
    const emailEl = $('#profileEmail');
    if (emailEl) emailEl.textContent = 'glowrius@proton.me';

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
    text.textContent = val || 'Write something about yourself...';
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

// Profile: save discord with visual feedback
$('#profileSaveDiscord')?.addEventListener('click', () => {
    const input = $('#profileDiscord');
    if (!input) return;
    const saved = JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || '{}');
    saved.discord = input.value.trim();
    localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(saved));

    const btn = $('#profileSaveDiscord');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    btn.style.background = 'rgba(34,197,94,0.2)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.borderColor = '';
    }, 1500);
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

// ── Dashboard Embed with Auth Gate ──
let countdownActive = false;
let countdownTimer = null;
const DASHBOARD_HTML = ($('#dashboardPage') || {}).innerHTML || '';

function restoreDashboardHTML() {
    const container = $('#dashboardPage');
    if (container && container.innerHTML !== DASHBOARD_HTML) {
        container.innerHTML = DASHBOARD_HTML;
    }
}

function initDashboard() {
    restoreDashboardHTML();

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
        if (loginBtn) loginBtn.onclick = () => { navigateTo('home'); openProfileDropdown(); };
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
        const numEl = $('#countdownNum');
        const circleEl = $('#countdownCircle');
        if (!numEl || !circleEl) { clearInterval(countdownTimer); countdownTimer = null; return; }
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

// ── Admin Login ──
$('#adminLoginBtn').addEventListener('click', () => {
    const user = $('#adminUsername').value.trim();
    const pass = $('#adminPassword').value.trim();
    const err = $('#adminError');
    if (!user || !pass) {
        err.textContent = 'Please enter username and password.';
        err.style.display = 'block';
        return;
    }
    if (user === 'admin' && pass === 'admin123') {
        err.style.display = 'none';
        window.open(API_BASE_URL + '/admin', '_blank');
    } else {
        err.textContent = 'Invalid credentials.';
        err.style.display = 'block';
    }
});

// ── Init ──

// Restore saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    const lt = $('#profileThemeLight');
    const dt = $('#profileThemeDark');
    if (lt) lt.classList.add('active');
    if (dt) dt.classList.remove('active');
}

renderTestimonials();
renderFAQ();
updateNavAuth();
navigateTo('home');
