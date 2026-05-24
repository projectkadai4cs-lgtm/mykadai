/* ============================================================
   script.js — Project Kadai
   ============================================================ */
'use strict';

/* ============================================================
   0. CANVAS BACKGROUND
   ============================================================ */
(function initCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bgCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#f5a623','#00e5ff','#2aff7a','#ff4d6d','#7c3aed'];
  const particles = Array.from({ length: 65 }, () => ({
    x:  Math.random() * window.innerWidth,
    y:  Math.random() * window.innerHeight,
    r:  Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    c:  COLORS[Math.floor(Math.random() * COLORS.length)],
    a:  Math.random() * 0.45 + 0.15,
  }));

  const stars = [];
  setInterval(() => {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      len: Math.random() * 100 + 60,
      speed: Math.random() * 4 + 3,
      a: 1,
    });
  }, 4000);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,229,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (p.r > 1.3) {
        const grad = ctx.createRadialGradient(p.x, p.y, p.r, p.x, p.y, p.r * 3);
        grad.addColorStop(0, p.c + '44');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    });
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      ctx.beginPath();
      const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y + s.len * 0.3);
      grad.addColorStop(0, `rgba(255,255,255,${s.a})`);
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len, s.y + s.len * 0.3);
      ctx.stroke();
      s.x += s.speed * 1.5;
      s.y += s.speed * 0.4;
      s.a -= 0.018;
      if (s.a <= 0) stars.splice(i, 1);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* Inject orbs */
(function injectOrbs() {
  const sf = document.querySelector('.shopfront');
  if (!sf) return;
  [1, 2, 3].forEach(i => {
    const o = document.createElement('div');
    o.className = `orb orb-${i}`;
    sf.appendChild(o);
  });
})();


/* ============================================================
   1. SPEECH — bold Tamil male voice
   ============================================================ */
const MALE_KEYWORDS = [
  'ravi', 'hemant', 'david', 'mark', 'daniel',
  'george', 'alex', 'fred', 'viktor', 'henrik', 'thomas',
];

let _voices = [];
function _loadVoices() { _voices = window.speechSynthesis.getVoices(); }
if ('speechSynthesis' in window) {
  _loadVoices();
  window.speechSynthesis.onvoiceschanged = _loadVoices;
}

function pickMaleVoice() {
  const voices = _voices.length ? _voices : window.speechSynthesis.getVoices();
  for (const kw of MALE_KEYWORDS) {
    const v = voices.find(v => v.name.toLowerCase().includes(kw));
    if (v) return v;
  }
  return voices.find(v => v.lang === 'en-IN')
      || voices.find(v => v.lang.startsWith('en'))
      || null;
}

/* Patch speak to trigger mouth animation */
const avatarBody = document.getElementById('avatarBody');
if ('speechSynthesis' in window && avatarBody) {
  const _origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = function (utt) {
    utt.onstart = () => avatarBody.classList.add('talking');
    utt.onend   = () => avatarBody.classList.remove('talking');
    _origSpeak(utt);
  };
}

function speak(text, rate = 0.78, pitch = 0.30) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt    = new SpeechSynthesisUtterance(text);
  utt.lang     = 'en-IN';
  utt.rate     = rate;
  utt.pitch    = pitch;   /* 0.30 = deep bold male */
  utt.volume   = 1;
  const v = pickMaleVoice();
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}


/* ============================================================
   2. AVATAR SPEECH LINES
   ============================================================ */
const SPEECH_LINES = [
  "Vanakam! 🙏",
  "Welcome to Project Kadai!",
  "IoT, Embedded Systems",
  "AI Automation, Portfolio",
  "Simple websites and Web-Games",
  "Romba cheap price lae!",
  "Source code, PPT ellam tharom!",
  "Order pannunga!",
];

let speechIndex = 0;
const speechBubble = document.getElementById('speechBubble');

function speakLine(index) {
  const line = SPEECH_LINES[index % SPEECH_LINES.length];
  if (speechBubble) {
    speechBubble.textContent = line;
    speechBubble.style.display = 'block';
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth;
    speechBubble.style.animation = 'bubblePop 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  }
  const ttsText = line.replace(/[^\w\s!,.'?]/g, '').trim();
  if (ttsText) speak(ttsText, 0.78, 0.30);
}

if (avatarBody) {
  avatarBody.addEventListener('click', () => {
    speakLine(speechIndex);
    speechIndex++;
  });
}

/* Auto-cycle */
setTimeout(() => speakLine(speechIndex++), 1500);
setInterval(() => { speakLine(speechIndex); speechIndex++; }, 3800);


/* ============================================================
   3. SAY NANDRI — fires after successful order
   ============================================================ */
function sayNandri(name) {
  if (!('speechSynthesis' in window)) return;

  if (speechBubble) {
    speechBubble.textContent = '🙏 Nandri!';
    speechBubble.style.display = 'block';
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth;
    speechBubble.style.animation = 'bubblePop 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  }

  setTimeout(() => speak('Nandri!', 0.78, 0.30), 400);
  setTimeout(() => speak('Thank you for your order. We will contact you very soon!', 0.78, 0.30), 2400);
}


/* ============================================================
   4. TOAST — uses #toast div in HTML
   ============================================================ */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = type === 'warn'
    ? 'linear-gradient(135deg,#ff4d6d,#cc0033)'
    : 'linear-gradient(135deg,#2aff7a,#00c853)';
  toast.style.color = type === 'warn' ? '#fff' : '#000';
  toast.style.display = 'block';
  toast.style.animation = 'none';
  void toast.offsetWidth;
  toast.style.animation = 'toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 5000);
}


/* ============================================================
   5. FLASH FIELD — red highlight on invalid input
   ============================================================ */
function flashField(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#ff4d6d';
  el.style.boxShadow   = '0 0 14px rgba(255,77,109,0.4)';
  el.focus();
  showToast(message, 'warn');
  el.addEventListener('input', () => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, { once: true });
  const btn = document.getElementById('btnSubmit');
  if (btn) { btn.textContent = "🚀 Place Order — We'll Contact You!"; btn.disabled = false; }
}


/* ============================================================
   6. CLEAR FORM
   ============================================================ */
function clearForm() {
  ['buyName', 'buyEmail', 'buyPhone', 'buyNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const p = document.getElementById('buyProject');
  if (p) p.value = '';
}


/* ============================================================
   7. SUBMIT ORDER — posts to Netlify, then says Nandri
   ============================================================ */
async function submitOrder() {
  const name    = document.getElementById('buyName')?.value.trim()  || '';
  const email   = document.getElementById('buyEmail')?.value.trim() || '';
  const phone   = document.getElementById('buyPhone')?.value.trim() || '';
  const project = document.getElementById('buyProject')?.value      || '';
  const note    = document.getElementById('buyNote')?.value.trim()  || '';
  const btn     = document.getElementById('btnSubmit');

  /* Validation */
  if (!name)    { flashField('buyName',    '⚠️ Full name is required');      return; }
  if (!phone)   { flashField('buyPhone',   '⚠️ Mobile number is required');  return; }
  if (!email)   { flashField('buyEmail',   '⚠️ Email is required');          return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    flashField('buyEmail', '⚠️ Enter a valid email address');                 return;
  }
  if (!project) { flashField('buyProject', '⚠️ Please select a project');   return; }

  if (btn) { btn.textContent = '⏳ Submitting...'; btn.disabled = true; }

  try {
    const body = new URLSearchParams({
      'form-name': 'project-orders',   /* must match name="" on the hidden <form> */
      'bot-field': '',
      name, email, phone, project, note,
    });

    /*
      FIX: window.location.pathname instead of hardcoded '/'
      This is what caused the 404 — your page is not at the root.
      redirect:'manual' stops fetch following Netlify's 302 redirect.
      Any response (0, 200, 302) means Netlify received the data.
    */
    await fetch(window.location.pathname, {
      method:   'POST',
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:     body.toString(),
      redirect: 'manual',
    });

    showToast(`✅ Order placed, ${name}! We'll contact you within 24 hours.`, 'success');
    sayNandri(name);
    clearForm();

  } catch (err) {
    console.error('Form submit error:', err);
    showToast('⚠️ Network error. Check your connection and try again.', 'warn');
  } finally {
    if (btn) { btn.textContent = "🚀 Place Order — We'll Contact You!"; btn.disabled = false; }
  }
}


/* ============================================================
   8. FLOATING NAV
   ============================================================ */
document.getElementById('scrollTopBtn')?.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);
document.getElementById('scrollProjectsBtn')?.addEventListener('click', () =>
  document.getElementById('shopGrid')?.scrollIntoView({ behavior: 'smooth' })
);
document.getElementById('scrollOrderBtn')?.addEventListener('click', () =>
  document.getElementById('buySection')?.scrollIntoView({ behavior: 'smooth' })
);
document.getElementById('btnEnterKadai')?.addEventListener('click', () =>
  document.getElementById('shopGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
);


/* ============================================================
   9. DOMAIN FILTER CHIPS
   ============================================================ */
const chips    = document.querySelectorAll('.domain-chip');
const allCards = document.querySelectorAll('.project-card');

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    allCards.forEach(card => {
      card.style.display =
        (filter === 'all' || card.dataset.domain === filter) ? 'block' : 'none';
    });
  });
});


/* ============================================================
   10. BUY NOW → scroll + auto-select dropdown
   ============================================================ */
function scrollToBuy(projectName) {
  document.getElementById('buySection')?.scrollIntoView({ behavior: 'smooth' });
  if (!projectName) return;
  setTimeout(() => {
    const sel = document.getElementById('buyProject');
    if (!sel) return;
    for (const opt of sel.options) {
      if (opt.value === projectName) { sel.value = opt.value; flashSelect(sel); return; }
    }
    const first = projectName.split(' ')[0].toLowerCase();
    for (const opt of sel.options) {
      if (opt.value.toLowerCase().includes(first)) { sel.value = opt.value; flashSelect(sel); return; }
    }
  }, 500);
}

function flashSelect(el) {
  el.style.borderColor = '#f5a623';
  el.style.boxShadow   = '0 0 18px rgba(245,166,35,0.5)';
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1500);
}

document.querySelectorAll('.btn-buy[data-project]').forEach(btn =>
  btn.addEventListener('click', () => scrollToBuy(btn.dataset.project))
);
document.getElementById('btnCustom')?.addEventListener('click', () => scrollToBuy(''));
document.getElementById('btnIdea')?.addEventListener('click',   () => scrollToBuy('Free Project Ideas'));


/* ============================================================
   11. SUBMIT BUTTON
   ============================================================ */
document.getElementById('btnSubmit')?.addEventListener('click', submitOrder);


/* ============================================================
   12. MODAL
   ============================================================ */
const videoModal  = document.getElementById('videoModal');
const modalClose  = document.getElementById('modalClose');
const modalBuyBtn = document.getElementById('modalBuyBtn');

function closeModal() { videoModal?.classList.remove('open'); }

document.querySelectorAll('.play-btn').forEach(btn =>
  btn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = btn.dataset.title || '';
    document.getElementById('modalDesc').textContent  = btn.dataset.desc  || '';
    videoModal?.classList.add('open');
    if (modalBuyBtn) modalBuyBtn.onclick = () => { closeModal(); scrollToBuy(btn.dataset.title); };
  })
);
modalClose?.addEventListener('click', closeModal);
videoModal?.addEventListener('click', e => { if (e.target === videoModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


/* ============================================================
   13. CARD ENTRANCE ANIMATIONS
   ============================================================ */
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.07}s`;
      entry.target.classList.add('card-visible');
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card').forEach(card => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(24px)';
  card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  cardObserver.observe(card);
});

const styleInject = document.createElement('style');
styleInject.textContent = `.card-visible { opacity:1 !important; transform:translateY(0) !important; }`;
document.head.appendChild(styleInject);
