const API_BASE_URL = 'http://localhost:5001';
let countdownActive = false;
let countdownTimer = null;
const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
const page = window.location.pathname.split('/').pop() || 'index.html';
const CUSTOMER_LS_KEY = 'sweepstakes_user';
const USER_LS_KEY = 'discord_user';
const ADMIN_LS_KEY = 'sweepstakes_is_admin';
const PROFILE_LS_KEY = 'profile_data';

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
function getAvatarKey() { var id = getDiscordId(); return id ? 'profile_avatar_' + id : 'profile_avatar'; }

function updateNavAuth() {
    const iconDefault = $('#profileIconDefault');
    const iconInitial = $('#profileIconInitial');
    const userPanel = $('#ddUserPanel');
    const getStartedBtn = $('#getStartedBtn');
    $$('.nav-tab[data-auth="required"]').forEach(t => {
        t.style.display = isLoggedIn() ? '' : 'none';
    });
    var adminEls = document.querySelectorAll('[data-admin="required"]');
    adminEls.forEach(function(el) {
        el.style.display = (isLoggedIn() && localStorage.getItem(ADMIN_LS_KEY) === 'true') ? '' : 'none';
    });
    if (isLoggedIn()) {
        if (iconDefault) iconDefault.style.display = 'none';
        if (iconInitial) { iconInitial.style.display = 'flex'; iconInitial.textContent = getUserName().charAt(0).toUpperCase(); }
        if (userPanel) userPanel.style.display = 'block';
        if (getStartedBtn) getStartedBtn.style.display = 'none';
        const savedAvatar = localStorage.getItem(getAvatarKey());
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
    const tabMap = { 'index.html': 'Home', 'plans.html': 'Plans', 'features.html': 'Features', 'testimonials.html': 'Testimonials', 'dashboard.html': 'Dashboard', 'faq.html': 'FAQ', 'contact.html': 'Contact', 'profile.html': 'Profile', 'settings.html': 'Settings' };
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
    var loginEl = $('#authLoginEmail'), passwordEl = $('#authLoginPassword'), msg = $('#authLoginMsg');
    if (!loginEl || !passwordEl || !msg) return;
    var login = loginEl.value.trim(), password = passwordEl.value.trim();
    if (!login || !password) { msg.textContent = 'Please fill in all fields.'; msg.style.display = 'block'; return; }
    msg.style.display = 'none';
    fetch(API_BASE_URL + '/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login, password: password })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (!data.ok) { msg.textContent = data.error || 'Login failed.'; msg.style.display = 'block'; return; }
        localStorage.setItem(CUSTOMER_LS_KEY, 'true');
        localStorage.setItem('display_name', data.user.username);
        localStorage.setItem('user_email', data.user.email);
        if (!localStorage.getItem('member_since')) localStorage.setItem('member_since', Date.now().toString());
        localStorage.setItem('last_login', Date.now().toString());
        localStorage.setItem('logged_in', 'true');
        updateNavAuth();
        loginEl.value = ''; passwordEl.value = ''; msg.style.display = 'none';
        closeAuthModal();
        if (page === 'dashboard.html') initDashboard();
    }).catch(function() {
        msg.textContent = 'Server error. Try again later.'; msg.style.display = 'block';
    });
}

function handleRegister() {
    var usernameEl = $('#authRegisterUsername'), emailEl = $('#authRegisterEmail');
    var passwordEl = $('#authRegisterPassword'), confirmEl = $('#authRegisterConfirm');
    var tos = $('#authRegisterToS'), msg = $('#authRegisterMsg');
    if (!usernameEl || !emailEl || !passwordEl || !confirmEl || !tos || !msg) return;
    var username = usernameEl.value.trim(), email = emailEl.value.trim();
    var password = passwordEl.value.trim(), confirm = confirmEl.value.trim();
    if (!username || !email || !password || !confirm) { msg.textContent = 'Please fill in all fields.'; msg.style.display = 'block'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Please enter a valid email.'; msg.style.display = 'block'; return; }
    if (password.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; msg.style.display = 'block'; return; }
    if (password !== confirm) { msg.textContent = 'Passwords do not match.'; msg.style.display = 'block'; return; }
    if (!tos.checked) { msg.textContent = 'You must agree to the Terms of Service.'; msg.style.display = 'block'; return; }
    msg.style.display = 'none';
    fetch(API_BASE_URL + '/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, email: email, password: password })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (!data.ok) { msg.textContent = data.error || 'Registration failed.'; msg.style.display = 'block'; return; }
        localStorage.setItem(CUSTOMER_LS_KEY, 'true');
        localStorage.setItem('display_name', data.user.username);
        localStorage.setItem('user_email', data.user.email);
        if (!localStorage.getItem('member_since')) localStorage.setItem('member_since', Date.now().toString());
        localStorage.setItem('last_login', Date.now().toString());
        localStorage.setItem('logged_in', 'true');
        updateNavAuth();
        msg.style.color = '#22c55e'; msg.textContent = 'Account created! Welcome to Claims Casino.'; msg.style.display = 'block';
        setTimeout(function() { closeAuthModal(); }, 1500);
    }).catch(function() {
        msg.textContent = 'Server error. Try again later.'; msg.style.display = 'block';
    });
}

function handleLogout() {
    fetch(API_BASE_URL + '/api/auth/logout', { method: 'POST' }).catch(function() {});
    var ak = getAvatarKey();
    localStorage.removeItem(CUSTOMER_LS_KEY); localStorage.removeItem(USER_LS_KEY); localStorage.removeItem(ADMIN_LS_KEY);
    localStorage.removeItem('display_name'); localStorage.removeItem('user_email'); localStorage.removeItem('logged_in');
    localStorage.removeItem(ak);
    updateNavAuth();
    if (page === 'dashboard.html' || page === 'profile.html') window.location.href = 'index.html';
}

// Check session on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('logged_in')) {
        fetch(API_BASE_URL + '/api/auth/me').then(function(r) { return r.json(); }).then(function(data) {
            if (data.ok) {
                localStorage.setItem(CUSTOMER_LS_KEY, 'true');
                localStorage.setItem('display_name', data.user.username);
                localStorage.setItem('user_email', data.user.email);
                localStorage.setItem('logged_in', 'true');
                updateNavAuth();
            }
        }).catch(function() {});
    }
});

document.addEventListener('keydown', function(ev) {
    if (ev.key === 'Escape') {
        closeAuthModal();
        var wm = $('#waitlistModal');
        if (wm && wm.classList.contains('active')) { wm.classList.remove('active'); document.body.style.overflow = ''; }
    }
});

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
    const modal = $('#waitlistModal'), stepForm = $('#waitlistStepForm'), stepSuccess = $('#waitlistStepSuccess'), stepSubmitting = $('#waitlistStepSubmitting');
    if (modal && stepForm && stepSuccess && stepSubmitting) {
        stepForm.style.display = 'block'; stepSuccess.style.display = 'none'; stepSubmitting.style.display = 'none';
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
    const stepForm = $('#waitlistStepForm'), stepSubmitting = $('#waitlistStepSubmitting');
    if (stepForm) stepForm.style.display = 'none';
    if (stepSubmitting) stepSubmitting.style.display = 'block';
    function timeoutPromise(ms) {
        return new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Request timed out')); }, ms);
        });
    }
    Promise.race([fetch(API_BASE_URL + '/api/waitlist-apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, discord: d, username: d, avatar_url: '', type: 'waitlist' })
    }), timeoutPromise(15000)]).then(function(r) { return r.json(); }).then(function(data) {
        if (stepSubmitting) stepSubmitting.style.display = 'none';
        const ss = $('#waitlistStepSuccess');
        if (ss) ss.style.display = 'block';

        // Generate transaction ID
        var txId = 'TX-' + Array(12).fill(0).map(function(){ return '0123456789abcdef'[Math.floor(Math.random()*16)]; }).join('').replace(/(.{4})/g, '$1-').slice(0, -1);

        // 3-second redirect countdown with purple progress bar
        var fill = document.getElementById('redirectFill');
        var countdownEl = document.getElementById('redirectCountdown');
        var seconds = 3;
        if (fill) fill.style.width = '0%';
        if (countdownEl) countdownEl.textContent = 'Redirecting in ' + seconds + 's...';
        var interval = setInterval(function() {
            seconds--;
            if (seconds <= 0) {
                clearInterval(interval);
                window.location.href = 'confirmation.html?email=' + encodeURIComponent(e) + '&tx=' + encodeURIComponent(txId);
                return;
            }
            if (fill) fill.style.width = ((3 - seconds) / 3 * 100) + '%';
            if (countdownEl) countdownEl.textContent = 'Redirecting in ' + seconds + 's...';
        }, 1000);

        let pc = 0;
        const poll = setInterval(() => {
            pc++;
            fetch(API_BASE_URL + '/api/check-approval?email=' + encodeURIComponent(e))
                .then(r => r.json()).then(d2 => {
                    if (d2.approved) {
                        clearInterval(poll);
                        localStorage.setItem('approved_to_purchase', 'true');
                        if (d) setDiscordId(d);
                        const m = $('#waitlistModal');
                        if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
                        showToast('You\'ve been approved! Go to Plans to purchase your membership.');
                    }
                }).catch(() => {});
            if (pc > 120) clearInterval(poll);
        }, 5000);
    }).catch(function(e) {
        if (stepSubmitting) stepSubmitting.style.display = 'none';
        if (stepForm) stepForm.style.display = 'block';
        console.error('Waitlist submit error:', e);
        var errMsg = $('#waitlistStepForm .waitlist-desc') || stepForm && stepForm.querySelector('p');
        if (errMsg) {
            errMsg.textContent = 'Error: ' + (e.message || 'Server unreachable. Check your connection and try again.');
            errMsg.style.color = '#ef4444';
        }
    });
});

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
    const saveDiscordBtn = $('#profileSaveDiscord'), adminBtn = $('#adminLoginBtn');
    const statClaims = $('#profileStatClaims'), statCasinos = $('#profileStatCasinos'), statValue = $('#profileStatValue'), statSince = $('#profileStatSince');
    const bioEditor = $('#profileBioEditor'), bioTextarea = $('#bioTextarea'), bioSaveBtn = $('#bioSaveBtn'), bioCancelBtn = $('#bioCancelBtn');
    const avatarPencil = $('#avatarPencil'), avatarInput = $('#avatarInput');
    const userName = getUserName();
    if (nameEl) nameEl.textContent = userName;
    if (discordEl) discordEl.textContent = 'Discord ID: ' + (getDiscordId() || '—');
    const saved = JSON.parse(localStorage.getItem(PROFILE_LS_KEY) || '{}');
    const savedAvatar = localStorage.getItem(getAvatarKey());
    if (savedAvatar && avatar) { avatar.style.backgroundImage = 'url(' + savedAvatar + ')'; avatar.style.backgroundSize = 'cover'; avatar.style.backgroundPosition = 'center'; avatar.textContent = ''; }
    if (bioEl) bioEl.textContent = saved.bio || 'No bio set yet.';
    if (bioTextarea) bioTextarea.value = saved.bio || '';
    const ms = localStorage.getItem('member_since');
    const joinDate = ms ? new Date(parseInt(ms)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    if (statSince) statSince.textContent = joinDate;
    if (discordNameInput) discordNameInput.value = getDiscordId() || saved.discord || '';
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
    if (user && user.admin && adminBtn) { adminBtn.textContent = ' Open Admin'; adminBtn.onclick = () => window.open('admin-dashboard.html', '_blank'); }
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
        saveDiscordBtn.addEventListener('click', function() {
            var val = discordNameInput.value.trim();
            if (!val) return;
            saved.discord = val;
            localStorage.setItem(PROFILE_LS_KEY, JSON.stringify(saved));
            localStorage.setItem(USER_LS_KEY, val);
            if (discordEl) discordEl.textContent = 'Discord ID: ' + val;
            if (discordMsg) { discordMsg.textContent = 'Saved!'; discordMsg.style.color = '#22c55e'; discordMsg.style.display = 'block'; setTimeout(function() { if (discordMsg) discordMsg.style.display = 'none'; }, 1500); }
            setDiscordId(val);
        });
    }
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            const user2 = USERS[getDiscordId()];
            if (user2 && user2.admin) { window.location.href = 'admin-dashboard.html'; }
        });
    }
    const pencilPopover = $('#pencilPopover'), pencilEditPhoto = $('#pencilEditPhoto'), pencilEditUsername = $('#pencilEditUsername');
    const usernameEditor = $('#profileUsernameEditor'), usernameInput = $('#usernameInput');
    const usernameSaveBtn = $('#usernameSaveBtn'), usernameCancelBtn = $('#usernameCancelBtn');
    if (avatarPencil && pencilPopover) {
        avatarPencil.addEventListener('click', function(e) {
            e.stopPropagation();
            pencilPopover.style.display = pencilPopover.style.display === 'none' ? 'block' : 'none';
        });
        if (pencilEditPhoto) {
            pencilEditPhoto.addEventListener('click', function() {
                pencilPopover.style.display = 'none';
                if (avatarInput) avatarInput.click();
            });
        }
        if (pencilEditUsername) {
            pencilEditUsername.addEventListener('click', function() {
                pencilPopover.style.display = 'none';
                if (usernameEditor && usernameInput) {
                    usernameInput.value = getUserName();
                    usernameEditor.style.display = 'flex';
                }
            });
        }
        document.addEventListener('click', function(e) {
            if (!avatarPencil.contains(e.target) && !pencilPopover.contains(e.target)) {
                if (pencilPopover) pencilPopover.style.display = 'none';
            }
        });
    }
    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            const file = avatarInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                localStorage.setItem(getAvatarKey(), dataUrl);
                if (avatar) { avatar.style.backgroundImage = 'url(' + dataUrl + ')'; avatar.style.backgroundSize = 'cover'; avatar.style.backgroundPosition = 'center'; avatar.textContent = ''; }
                updateNavAuth();
            };
            reader.readAsDataURL(file);
        });
    }
    if (usernameSaveBtn && usernameInput && usernameEditor && nameEl) {
        usernameSaveBtn.addEventListener('click', function() {
            var val = usernameInput.value.trim();
            if (!val) return;
            localStorage.setItem('display_name', val);
            if (nameEl) nameEl.textContent = val;
            usernameEditor.style.display = 'none';
            updateNavAuth();
        });
        usernameCancelBtn.addEventListener('click', function() {
            usernameEditor.style.display = 'none';
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

/* ── Cart System ── */
function updateCartBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    try {
        var cart = JSON.parse(localStorage.getItem('cart') || '[]');
        var total = cart.reduce(function(s, i){ return s + (i.quantity || 1); }, 0);
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    } catch(e) {}
}

function updateCartDropdown() {
    var dropdown = document.getElementById('cartDropdown');
    if (!dropdown) return;
    try {
        var cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            dropdown.innerHTML = '<div class="cart-dropdown-empty">Your cart is empty</div>';
            return;
        }
        var html = '';
        var subtotal = 0;
        cart.forEach(function(item) {
            var qty = item.quantity || 1;
            var price = item.price || 0;
            subtotal += price * qty;
            html += '<div class="cart-dropdown-item"><span>' + item.name + ' x' + qty + '</span><span style="margin-left:auto;color:var(--primary);font-weight:600">$' + (price * qty).toFixed(2) + '</span></div>';
        });
        html += '<div class="cart-dropdown-total"><span>Total</span><span>$' + subtotal.toFixed(2) + '</span></div>';
        html += '<a href="cart.html" class="cart-dropdown-link"><i class="fas fa-shopping-cart"></i> View Cart</a>';
        dropdown.innerHTML = html;
    } catch(e) {}
}

// Listen for cart changes from other tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        updateCartBadge();
        updateCartDropdown();
    }
});

try {
    setActiveNav();
    updateNavAuth();
    trackPage();
    updateCartBadge();
    updateCartDropdown();
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

// ── Hamburger Menu ──
document.addEventListener('click', function(e) {
    var btn = document.getElementById('hamburgerBtn');
    var drawer = document.getElementById('mobileDrawer');
    var overlay = document.getElementById('mobileOverlay');
    if (!btn || !drawer || !overlay) return;
    if (e.target === btn || btn.contains(e.target)) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    } else if (e.target === overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var drawer = document.getElementById('mobileDrawer');
        var overlay = document.getElementById('mobileOverlay');
        if (drawer && overlay && drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
});

// ── Fade-in Sections Observer ──
document.addEventListener('DOMContentLoaded', function() {
    var sections = document.querySelectorAll('.fade-section:not(.visible)');
    if (sections.length === 0) return;
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    sections.forEach(function(s) { obs.observe(s); });
});

function showToast(msg) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);font-size:0.85rem;z-index:9999;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.5)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(function(){ t.remove(); }, 300); }, 4000);
}

/* ── GSAP ScrollTrigger Text Animations ── */
function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Split text into character spans (preserves nested child elements)
    document.querySelectorAll('.letter-animation .split-text').forEach(function(el) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) { textNodes.push(walker.currentNode); }
        textNodes.forEach(function(node) {
            var text = node.textContent;
            if (!text.trim()) return;
            var fragment = document.createDocumentFragment();
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (ch === ' ') {
                    fragment.appendChild(document.createTextNode(' '));
                } else {
                    var span = document.createElement('span');
                    span.className = 'split-chars';
                    span.textContent = ch;
                    fragment.appendChild(span);
                }
            }
            node.parentNode.replaceChild(fragment, node);
        });
    });

    // Split text into word spans (preserves nested child elements)
    document.querySelectorAll('.word-animation .split-text').forEach(function(el) {
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) { textNodes.push(walker.currentNode); }
        textNodes.forEach(function(node) {
            var text = node.textContent.trim();
            if (!text) return;
            var words = text.split(/\s+/);
            if (words.length < 2) return;
            var fragment = document.createDocumentFragment();
            words.forEach(function(w, i) {
                var span = document.createElement('span');
                span.className = 'split-words';
                span.textContent = w;
                fragment.appendChild(span);
                if (i < words.length - 1) fragment.appendChild(document.createTextNode(' '));
            });
            node.parentNode.replaceChild(fragment, node);
        });
    });

    // Animate letters on scroll
    gsap.utils.toArray('.letter-animation').forEach(function(trigger) {
        var chars = trigger.querySelectorAll('.split-chars');
        if (!chars.length) return;
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: trigger,
                start: 'top 70%',
                end: 'bottom 30%',
                toggleActions: 'play none none none'
            }
        });
        tl.from(chars, {
            duration: 0.6,
            y: '50%',
            opacity: 0,
            rotationX: -90,
            ease: 'power1.out',
            stagger: { amount: 0.6, from: 'start' }
        });
    });

    // Animate words on scroll
    gsap.utils.toArray('.word-animation').forEach(function(trigger) {
        var words = trigger.querySelectorAll('.split-words');
        if (!words.length) return;
        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: trigger,
                start: 'top 75%',
                end: 'bottom 25%',
                toggleActions: 'play none none none'
            }
        });
        tl.from(words, {
            duration: 0.4,
            y: '40%',
            opacity: 0,
            ease: 'power1.out',
            stagger: { amount: 0.5, from: 'start' }
        });
    });
}

/* ── Scroll Progress Bar ── */
window.addEventListener('scroll', function() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + '%';
});

/* ── Section Nav Active Tracking ── */
document.addEventListener('DOMContentLoaded', function() {
    var navBtns = document.querySelectorAll('.section-nav-btn');
    if (!navBtns.length) return;
    var sections = [];
    navBtns.forEach(function(btn) {
        var target = document.getElementById(btn.getAttribute('data-target'));
        if (target) sections.push(target);
    });
    if (!sections.length) return;
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                navBtns.forEach(function(b) {
                    b.classList.toggle('active', b.getAttribute('data-target') === entry.target.id);
                });
            }
        });
    }, { threshold: 0.3 });
    sections.forEach(function(s) { obs.observe(s); });
});

/* ── Content Carousel ── */
function initCarousel(wrapId) {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;
    var scrollEl = wrap.querySelector('.carousel-scroll');
    var prev = wrap.querySelector('.carousel-btn-prev');
    var next = wrap.querySelector('.carousel-btn-next');
    if (!scrollEl || !prev || !next) return;
    prev.addEventListener('click', function() {
        scrollEl.scrollBy({ left: -340, behavior: 'smooth' });
    });
    next.addEventListener('click', function() {
        scrollEl.scrollBy({ left: 340, behavior: 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initCarousel('supportedCarousel');
    initCarousel('testimonialsCarousel');
    initScrollAnimations();
});

/* ── Sibling Index Stagger ── */
function initStagger() {
    document.querySelectorAll('[data-stagger]').forEach(function(el, i) {
        el.style.setProperty('--sibling-index', i);
    });
    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-stagger]').forEach(function(el) {
        obs.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', initStagger);