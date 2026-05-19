const API_BASE_URL = 'https://casinoclaims.onrender.com';
let countdownActive = false;
let countdownTimer = null;
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
const page = window.location.pathname.split('/').pop() || 'index.html';
const CUSTOMER_LS_KEY = 'sweepstakes_user';
const USER_LS_KEY = 'discord_user';
const ADMIN_LS_KEY = 'sweepstakes_is_admin';
const PROFILE_LS_KEY = 'profile_data';
const AVATAR_LS_KEY = 'profile_avatar';

const USERS = {
    "953177450391683082": { name: "Glow",     license: "8K3X-M9P1-Q2R7-V5N2", admin: true },
    "695697021868310669": { name: "andyttc",  license: "J4W6-B8T2-C1D9-F3H5", admin: false },
    "186105992252096512": { name: "Nazistu",  license: "A7S3-D5F6-G8H2-J9K4", admin: false },
    "222898514789662721": { name: "No Leg Leny", license: "L1Q2-W3E4-R5T6-Y7U8", admin: false },
    "741378521460637773": { name: "pxsymbol", license: "Z9X8-C7V6-B5N4-M3L2", admin: false },
    "1389284552442253352": { name: "Braeden Nigley", license: "P1O2-I3U4-Y5T6-R7E8", admin: false }
};
const ADMIN_KEY = "A1B2-C3D4-E5F6-G7H8";

function isLoggedIn() { return !!localStorage.getItem(CUSTOMER_LS_KEY); }
function getDiscordId() { return localStorage.getItem(USER_LS_KEY) || ''; }
function setDiscordId(id) { localStorage.setItem(USER_LS_KEY, id); }
function getUserName() { return localStorage.getItem('display_name') || getDiscordId() || 'User'; }

function updateNavAuth() {
    const iconDefault = $('#profileIconDefault');
    const iconInitial = $('#profileIconInitial');
    const userPanel = $('#ddUserPanel');
    const getStartedBtn = $('#getStartedBtn');
    $$('.nav-tab[data-auth="required"]').forEach(t => {
        t.style.display = isLoggedIn() ? '' : 'none';
    });
    if (isLoggedIn()) {
        if (iconDefault) iconDefault.style.display = 'none';
        if (iconInitial) { iconInitial.style.display = 'flex'; iconInitial.textContent = getUserName().charAt(0).toUpperCase(); }
        if (userPanel) userPanel.style.display = 'block';
        if (getStartedBtn) getStartedBtn.style.display = 'none';
        const savedAvatar = localStorage.getItem(AVATAR_LS_KEY);
        if (savedAvatar && iconInitial) {
            iconInitial.style.backgroundImage = 'url(' + savedAvatar + ')';
            iconInitial.style.backgroundSize = 'cover';
            iconInitial.style.backgroundPosition = 'center';
            iconInitial.textContent = '';
        }
    } else {
        if (iconDefault) iconDefault.style.display = 'block';
        if (iconInitial) { iconInitial.style.display = 'none'; iconInitial.style.backgroundImage = ''; }
        if (userPanel) userPanel.style.display = 'none';
        if (getStartedBtn) getStartedBtn.style.display = 'inline-flex';
    }
}

function setActiveNav() {
    const tabMap = { 'index.html': 'Home', 'plans.html': 'Plans', 'features.html': 'Features', 'testimonials.html': 'Testimonials', 'dashboard.html': 'Dashboard', 'faq.html': 'FAQ', 'contact.html': 'Contact', 'profile.html': 'Profile' };
    const label = tabMap[page];
    if (label) $$('.nav-tab').forEach(t => { t.classList.remove('active'); if (t.textContent.trim() === label) t.classList.add('active'); });
}

function openAuthModal() {
    const modal = $('#authModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; resetAuthForms(); }
}

function closeAuthModal() {
    const modal = $('#authModal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function resetAuthForms() {
    $$('.auth-form').forEach(f => f.style.display = 'none');
    $$('.auth-msg').forEach(m => { m.style.display = 'none'; m.textContent = ''; });
    $$('.auth-input').forEach(i => i.value = '');
    $$('.auth-tos-checkbox').forEach(c => c.checked = false);
    const lf = $('#authLoginForm'); const rf = $('#authRegisterForm');
    if (lf) { lf.style.display = 'flex'; lf.classList.add('active'); }
    if (rf) { rf.style.display = 'none'; rf.classList.remove('active'); }
    $$('.auth-tab').forEach(t => t.classList.remove('active'));
    const lt = $('.auth-tab[data-auth-form="login"]');
    if (lt) lt.classList.add('active');
}

function handleLogin() {
    const discord = $('#authLoginDiscord'), password = $('#authLoginPassword'), tos = $('#authLoginToS'), msg = $('#authLoginMsg');
    if (!discord || !password || !tos || !msg) return;
    const d = discord.value.trim(), p = password.value.trim();
    if (!d || !p) { msg.textContent = 'Please fill in all fields.'; msg.style.display = 'block'; return; }
    if (!tos.checked) { msg.textContent = 'You must agree to the Terms of Service.'; msg.style.display = 'block'; return; }
    const user = USERS[d];
    if (user) {
        const expectedPw = d === "953177450391683082" ? "G@@gle080808!!" : "casino";
        if (p !== expectedPw) { msg.textContent = 'Invalid credentials.'; msg.style.display = 'block'; return; }
        setDiscordId(d);
        localStorage.setItem(CUSTOMER_LS_KEY, user.license);
        localStorage.setItem('display_name', user.name);
        if (user.admin) localStorage.setItem(ADMIN_LS_KEY, 'true');
        if (!localStorage.getItem('member_since')) localStorage.setItem('member_since', Date.now().toString());
        localStorage.setItem('last_login', Date.now().toString());
        updateNavAuth();
        discord.value = ''; password.value = ''; tos.checked = false; msg.style.display = 'none';
        closeAuthModal();
        if (page === 'dashboard.html') initDashboard();
        return;
    }
    setDiscordId(d);
    localStorage.setItem(CUSTOMER_LS_KEY, d);
    localStorage.setItem('display_name', d);
    if (!localStorage.getItem('member_since')) localStorage.setItem('member_since', Date.now().toString());
    localStorage.setItem('last_login', Date.now().toString());
    updateNavAuth();
    discord.value = ''; password.value = ''; tos.checked = false; msg.style.display = 'none';
    closeAuthModal();
    if (page === 'dashboard.html') initDashboard();
}

function handleRegister() {
    const email = $('#authRegisterEmail'), discord = $('#authRegisterDiscord'), password = $('#authRegisterPassword');
    const confirm = $('#authRegisterConfirm'), tos = $('#authRegisterToS'), msg = $('#authRegisterMsg');
    if (!email || !discord || !password || !confirm || !tos || !msg) return;
    const e = email.value.trim(), d = discord.value.trim(), p = password.value.trim(), c = confirm.value.trim();
    if (!e || !d || !p || !c) { msg.textContent = 'Please fill in all fields.'; msg.style.display = 'block'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { msg.textContent = 'Please enter a valid email.'; msg.style.display = 'block'; return; }
    if (p.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; msg.style.display = 'block'; return; }
    if (p !== c) { msg.textContent = 'Passwords do not match.'; msg.style.display = 'block'; return; }
    if (!tos.checked) { msg.textContent = 'You must agree to the Terms of Service.'; msg.style.display = 'block'; return; }
    if (USERS[d]) { msg.textContent = 'This Discord ID is already registered.'; msg.style.color = '#ef4444'; msg.style.display = 'block'; return; }
    msg.style.display = 'none';
    fetch(API_BASE_URL + '/api/waitlist-apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, discord: d, password: p, type: 'registration' })
    }).then(r => r.json()).then(data => {
        msg.style.color = '#22c55e'; msg.textContent = 'Registration submitted! Awaiting admin approval.'; msg.style.display = 'block';
        let pc = 0;
        const poll = setInterval(() => {
            pc++;
            fetch(API_BASE_URL + '/api/check-approval?discord=' + encodeURIComponent(d))
                .then(r => r.json()).then(d2 => {
                    if (d2.approved && d2.license_id) {
                        clearInterval(poll); setDiscordId(d); localStorage.setItem(CUSTOMER_LS_KEY, d2.license_id);
                        localStorage.setItem('member_since', Date.now().toString()); localStorage.setItem('last_login', Date.now().toString());
                        updateNavAuth(); msg.style.display = 'none'; closeAuthModal();
                    }
                }).catch(() => {});
            if (pc > 120) clearInterval(poll);
        }, 5000);
    }).catch(() => { msg.style.color = '#ef4444'; msg.textContent = 'Server error. Try again later.'; msg.style.display = 'block'; });
}

function handleLogout() {
    localStorage.removeItem(CUSTOMER_LS_KEY); localStorage.removeItem(USER_LS_KEY); localStorage.removeItem(ADMIN_LS_KEY);
    localStorage.removeItem('display_name');
    updateNavAuth();
    if (page === 'dashboard.html' || page === 'profile.html') window.location.href = 'index.html';
}

$('#profileIconBtn')?.addEventListener('click', () => { if (!isLoggedIn()) openAuthModal(); });
$('#authModalClose')?.addEventListener('click', closeAuthModal);
$('#authModal')?.addEventListener('click', e => { if (e.target === $('#authModal')) closeAuthModal(); });

$$('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const form = tab.dataset.authForm;
        $$('.auth-form').forEach(f => { f.style.display = 'none'; f.classList.remove('active'); });
        const tgt = $('#auth' + form.charAt(0).toUpperCase() + form.slice(1) + 'Form');
        if (tgt) { tgt.style.display = 'flex'; tgt.classList.add('active'); }
        $$('.auth-msg').forEach(m => { m.style.display = 'none'; m.textContent = ''; });
    });
});

$('#authLoginBtn')?.addEventListener('click', handleLogin);
$('#authLoginPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
$('#authRegisterBtn')?.addEventListener('click', handleRegister);
$('#authRegisterConfirm')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });
$('#ddLogout')?.addEventListener('click', handleLogout);

function openWaitlistModal() {
    const modal = $('#waitlistModal'), stepForm = $('#waitlistStepForm'), stepSuccess = $('#waitlistStepSuccess'), loading = $('#waitlistLoading');
    if (modal && stepForm && stepSuccess && loading) {
        stepForm.style.display = 'block'; stepSuccess.style.display = 'none'; loading.style.display = 'none';
        modal.classList.add('active'); document.body.style.overflow = 'hidden';
    }
}

$('#modalClose')?.addEventListener('click', () => { const m = $('#waitlistModal'); if (m) { m.classList.remove('active'); document.body.style.overflow = ''; } });
$('#waitlistModal')?.addEventListener('click', e => { if (e.target === $('#waitlistModal')) { const m = $('#waitlistModal'); if (m) { m.classList.remove('active'); document.body.style.overflow = ''; } } });
$('#waitlistBtn')?.addEventListener('click', openWaitlistModal);

$('#waitlistSubmit')?.addEventListener('click', () => {
    const email = $('#waitlistEmail'), discord = $('#waitlistDiscord');
    if (!email || !discord) return;
    const e = email.value.trim(), d = discord.value.trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { email.classList.add('error'); return; }
    email.classList.remove('error');
    const stepForm = $('#waitlistStepForm'), loading = $('#waitlistLoading'), loadText = $('#waitlistLoadingText');
    if (stepForm) stepForm.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    if (loadText) loadText.textContent = 'Submitting your application...';
    fetch(API_BASE_URL + '/api/waitlist-apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, discord: d, type: 'waitlist' })
    }).then(r => r.json()).then(data => {
        const pos = $('#waitlistPosition');
        if (pos) pos.textContent = '#' + (data.position || Math.floor(Math.random() * 200) + 5);
        if (loading) loading.style.display = 'none';
        const ss = $('#waitlistStepSuccess');
        if (ss) ss.style.display = 'block';
        let pc = 0;
        const poll = setInterval(() => {
            pc++;
            fetch(API_BASE_URL + '/api/check-approval?email=' + encodeURIComponent(e))
                .then(r => r.json()).then(d2 => {
                    if (d2.approved && d2.license_id) {
                        clearInterval(poll); localStorage.setItem(CUSTOMER_LS_KEY, d2.license_id);
                        if (d) setDiscordId(d);
                        localStorage.setItem('member_since', Date.now().toString()); localStorage.setItem('last_login', Date.now().toString());
                        updateNavAuth();
                        const m = $('#waitlistModal'); if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
                    }
                }).catch(() => {});
            if (pc > 120) clearInterval(poll);
        }, 5000);
    }).catch(() => { if (loadText) loadText.textContent = 'Server error. Try again later.'; });
});

$('#waitlistDoneBtn')?.addEventListener('click', () => { const m = $('#waitlistModal'); if (m) { m.classList.remove('active'); document.body.style.overflow = ''; } });

let savedDashboardHTML = '';

function saveDashboardHTML() {
    const c = $('#dashboardContent');
    if (c) savedDashboardHTML = c.innerHTML;
}

function initDashboard() {
    const content = $('#dashboardContent');
    if (!content) return;
    if (savedDashboardHTML) content.innerHTML = savedDashboardHTML;
    const countdown = $('#dashboardCountdown'), authGate = $('#dashboardAuthGate'), embed = $('#dashboardEmbed');
    const num = $('#countdownNumber'), circle = $('.countdown-progress'), hint = $('.countdown-hint');
    const signInBtn = $('#dashboardSignInBtn');
    if (!countdown || !authGate || !embed || !num || !circle) return;
    num.textContent = '5';
    circle.style.strokeDashoffset = '0';
    if (!isLoggedIn()) {
        countdown.style.display = 'none'; authGate.style.display = 'flex'; embed.style.display = 'none';
        if (signInBtn) signInBtn.onclick = openAuthModal;
        return;
    }
    countdown.style.display = 'flex'; authGate.style.display = 'none'; embed.style.display = 'none';
    if (hint) hint.textContent = 'Preparing your dashboard...';
    let sec = 5;
    countdownActive = true;
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    const circ = 439.8;
    circle.style.strokeDasharray = circ;
    circle.style.strokeDashoffset = '0';
    countdownTimer = setInterval(() => {
        sec--;
        const n = $('#countdownNumber'), c = $('.countdown-progress');
        if (!n || !c) { clearInterval(countdownTimer); countdownTimer = null; return; }
        n.textContent = sec;
        c.style.strokeDashoffset = circ * (1 - sec / 5);
        if (sec <= 0) {
            clearInterval(countdownTimer); countdownTimer = null; countdownActive = false;
            countdown.style.display = 'none'; embed.style.display = 'block';
            const loader = embed.querySelector('.dashboard-embed-loader');
            const iframe = $('#dashboardIframe');
            if (loader) loader.style.display = 'none';
            if (iframe) { iframe.src = API_BASE_URL + '/api/embed-dashboard'; iframe.style.display = 'block'; }
        }
    }, 1000);
}

function initProfile() {
    if (!isLoggedIn()) { window.location.href = 'index.html'; return; }
    const avatar = $('#profileAvatar'), nameEl = $('#profileName'), discordEl = $('#profileDiscord'), bioEl = $('#profileBio');
    const editBioBtn = $('#profileEditBioBtn'), discordNameInput = $('#profileDiscordName'), discordMsg = $('#profileDiscordMsg');
    const saveDiscordBtn = $('#profileSaveDiscord'), themeToggle = $('#themeToggle'), adminBtn = $('#adminLoginBtn');
    const statClaims = $('#profileStatClaims'), statCasinos = $('#profileStatCasinos'), statValue = $('#profileStatValue'), statSince = $('#profileStatSince');
    const bioEditor = $('#profileBioEditor'), bioTextarea = $('#bioTextarea'), bioSaveBtn = $('#bioSaveBtn'), bioCancelBtn = $('#bioCancelBtn');
    const avatarPencil = $('#avatarPencil'), avatarInput = $('#avatarInput');
    const userName = getUserName();
    if (nameEl) nameEl.textContent = userName;
    if (discordEl) discordEl.textContent = 'Discord ID: ' + (getDiscordId() || '—');
    const saved = JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || '{}');
    const savedAvatar = localStorage.getItem(AVATAR_LS_KEY);
    if (savedAvatar && avatar) { avatar.style.backgroundImage = 'url(' + savedAvatar + ')'; avatar.style.backgroundSize = 'cover'; avatar.style.backgroundPosition = 'center'; avatar.textContent = ''; }
    if (bioEl) bioEl.textContent = saved.bio || 'No bio set yet.';
    if (bioTextarea) bioTextarea.value = saved.bio || '';
    const ms = localStorage.getItem('member_since');
    const joinDate = ms ? new Date(parseInt(ms)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    if (statSince) statSince.textContent = joinDate;
    if (discordNameInput) discordNameInput.value = saved.discord || '';
    fetch(API_BASE_URL + '/api/data', { signal: AbortSignal.timeout(5000) })
        .then(r => r.json()).then(d => {
            if (statClaims) statClaims.textContent = (d.found || 0).toLocaleString();
            if (statCasinos) statCasinos.textContent = (d.casinos || 80).toLocaleString();
            if (statValue) statValue.textContent = (d.sc_total || 0).toFixed(2) + ' SC';
        }).catch(() => {
            if (statClaims) statClaims.textContent = '—';
            if (statCasinos) statCasinos.textContent = '—';
            if (statValue) statValue.textContent = '—';
        });
    const user = USERS[getDiscordId()];
    if (user && user.admin && adminBtn) { adminBtn.textContent = ' Open Admin'; adminBtn.onclick = () => window.open(API_BASE_URL + '/admin', '_blank'); }
    if (editBioBtn && bioEditor && bioEl && bioTextarea && bioSaveBtn && bioCancelBtn) {
        editBioBtn.addEventListener('click', () => {
            bioEl.style.display = 'none';
            editBioBtn.style.display = 'none';
            bioEditor.style.display = 'flex';
        });
        bioSaveBtn.addEventListener('click', () => {
            const t = bioTextarea.value.trim();
            saved.bio = t;
            localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(saved));
            if (bioEl) bioEl.textContent = t || 'No bio set yet.';
            bioEditor.style.display = 'none';
            bioEl.style.display = 'block';
            editBioBtn.style.display = 'inline-flex';
        });
        bioCancelBtn.addEventListener('click', () => {
            bioTextarea.value = saved.bio || '';
            bioEditor.style.display = 'none';
            bioEl.style.display = 'block';
            editBioBtn.style.display = 'inline-flex';
        });
    }
    if (saveDiscordBtn && discordNameInput) {
        saveDiscordBtn.addEventListener('click', () => {
            saved.discord = discordNameInput.value.trim();
            localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(saved));
            if (discordMsg) { discordMsg.textContent = 'Saved!'; discordMsg.style.color = '#22c55e'; discordMsg.style.display = 'block'; setTimeout(() => { if (discordMsg) discordMsg.style.display = 'none'; }, 1500); }
        });
    }
    const st = localStorage.getItem('theme');
    if (themeToggle) {
        themeToggle.checked = st !== 'light';
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('theme', 'dark'); }
            else { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light'); }
        });
    }
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            const user2 = USERS[getDiscordId()];
            if (user2 && user2.admin) { window.open(API_BASE_URL + '/admin', '_blank'); return; }
            const pw = prompt('Enter admin key:');
            if (pw === ADMIN_KEY) window.open(API_BASE_URL + '/admin', '_blank');
            else if (pw !== null) alert('Invalid admin key.');
        });
    }
    if (avatarPencil && avatarInput) {
        avatarPencil.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', () => {
            const file = avatarInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                localStorage.setItem(AVATAR_LS_KEY, dataUrl);
                if (avatar) { avatar.style.backgroundImage = 'url(' + dataUrl + ')'; avatar.style.backgroundSize = 'cover'; avatar.style.backgroundPosition = 'center'; avatar.textContent = ''; }
                updateNavAuth();
            };
            reader.readAsDataURL(file);
        });
    }
}

$('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#contactName'), email = $('#contactEmail'), subject = $('#contactSubject'), message = $('#contactMessage'), msg = $('#contactFormMsg');
    let valid = true;
    [name, email, subject, message].forEach(el => { if (el) el.classList.remove('error'); if (el && !el.value.trim()) { el.classList.add('error'); valid = false; } });
    if (!valid) { if (msg) { msg.textContent = 'Please fill in all required fields.'; msg.style.display = 'block'; msg.style.color = '#ef4444'; } return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); if (msg) { msg.textContent = 'Please enter a valid email address.'; msg.style.display = 'block'; msg.style.color = '#ef4444'; } return; }
    if (msg) { msg.textContent = 'Sending your message...'; msg.style.display = 'block'; msg.style.color = 'var(--text-muted)'; }
    setTimeout(() => {
        if (msg) { msg.textContent = 'Message sent! We will get back to you within 24 hours.'; msg.style.color = '#22c55e'; }
        if (name) name.value = ''; if (email) email.value = ''; if (subject) subject.value = ''; if (message) message.value = '';
    }, 1500);
});

$('#getStartedBtn')?.addEventListener('click', () => { window.location.href = 'plans.html'; });
$('#heroCta')?.addEventListener('click', e => { e.preventDefault(); window.location.href = 'plans.html'; });
$('#learnMoreBtn')?.addEventListener('click', e => { e.preventDefault(); window.location.href = 'features.html'; });

$$('.faq-question').forEach(q => { q.addEventListener('click', () => { const item = q.closest('.faq-item'); if (item) item.classList.toggle('open'); }); });

function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId = null;
    function resize() {
        const parent = canvas.closest('.hero') || canvas.closest('.section') || canvas.parentElement;
        if (!parent) return;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    const particles = [];
    for (let i = 0; i < 70; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 2,
            speed: Math.random() * 0.4 + 0.15,
            drift: Math.random() * 0.3 - 0.15,
            phase: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            p.y -= p.speed;
            p.x += Math.sin(p.y * 0.02 + p.phase) * p.drift;
            if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
            ctx.fill();
        }
        animId = requestAnimationFrame(animate);
    }
    animate();
}

function trackPage() {
    if (!isLoggedIn()) return;
    const did = getDiscordId();
    if (!did) return;
    try {
        fetch(API_BASE_URL + '/api/track-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discord_id: did, page: page, timestamp: Date.now() })
        }).catch(() => {});
    } catch (e) {}
}

try {
    const st = localStorage.getItem('theme');
    if (st === 'light') document.documentElement.setAttribute('data-theme', 'light');
    setActiveNav();
    updateNavAuth();
    trackPage();
    if (page === 'index.html' || page === 'plans.html') initParticles();
    if (page === 'dashboard.html') { saveDashboardHTML(); initDashboard(); }
    if (page === 'features.html') initCompFadeScroll();
    if (page === 'profile.html') initProfile();
} catch (e) { console.error('Init error:', e); }

function initCompFadeScroll() {
    const rows = document.querySelectorAll('.comp-row-item');
    if (!rows.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    rows.forEach(row => observer.observe(row));
}