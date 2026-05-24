/* ============================================================
   script.js — Project Kadai (Clean Edition)
   ============================================================ */
'use strict';

/* ============================================================
   0. ANIMATED CANVAS BACKGROUND
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
  function spawnStar() {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      len: Math.random() * 100 + 60,
      speed: Math.random() * 4 + 3,
      a: 1,
    });
  }
  setInterval(spawnStar, 4000);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,229,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 60) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); ctx.stroke();
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

(function injectOrbs() {
  const sf = document.querySelector('.shopfront');
  if (!sf) return;
  [1,2,3].forEach(i => {
    const o = document.createElement('div');
    o.className = `orb orb-${i}`;
    sf.appendChild(o);
  });
})();


/* ============================================================
   1. VOICE SETUP — load voices early, patch speak once
   ============================================================ */
let voicesList = [];

function loadVoices() {
  voicesList = window.speechSynthesis.getVoices();
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice() {
  return (
    voicesList.find(v => v.name.toLowerCase().includes('ravi')) ||
    voicesList.find(v => v.lang.startsWith('ta')) ||
    voicesList.find(v => v.lang === 'en-IN') ||
    voicesList.find(v => v.lang.startsWith('en-GB')) ||
    voicesList.find(v => v.lang.startsWith('en')) ||
    null
  );
}

/* Patch speak once so talking animation always fires */
const avatarBody = document.getElementById('avatarBody');
if ('speechSynthesis' in window && avatarBody) {
  const _origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = function (utt) {
    utt.onstart = () => avatarBody.classList.add('talking');
    utt.onend   = () => avatarBody.classList.remove('talking');
    _origSpeak(utt);
  };
}

function speak(text, rate, pitch) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate   = rate  || 0.70;
  utt.pitch  = pitch || 0.42;
  utt.volume = 1;
  const v = pickVoice();
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}


/* ============================================================
   2. AVATAR SPEECH LINES
   ============================================================ */
const SPEECH_LINES = [
  "Vanakam!🙏🏻",
  "Welcome to Project Kadai!",
  "IoT, Embedded Systems",
  "AI Automation, Portfolio",
  "Simple websites and Web-Games",
  "Elamaee! Romba cheap price lae!",
  "Source code, PPT ellam tharom!",
  "Order pannunga!",
];

let speechIndex = 0;
const speechBubble = document.getElementById('speechBubble');

function speakLine(index) {
  const line = SPEECH_LINES[index % SPEECH_LINES.length];

  /* Update bubble */
  if (speechBubble) {
    speechBubble.textContent = line;
    speechBubble.style.display = 'block';
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth;
    speechBubble.style.animation = 'bubblePop 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  }

  /* Speak — strip emoji for TTS */
  const ttsText = line.replace(/[^\w\s!,.'?]/g, '').trim();
  if (ttsText) speak(ttsText, 0.70, 0.42);
}

if (avatarBody) {
  avatarBody.addEventListener('click', () => {
    speakLine(speechIndex);
    speechIndex++;
  });
}

/* Auto-cycle every 3.8s */
setInterval(() => { speakLine(speechIndex); speechIndex++; }, 3800);
/* First line after 3.5s */
setTimeout(() => speakLine(speechIndex++), 1500);


/* ============================================================
   3. FLOATING NAV
   ============================================================ */
document.getElementById('scrollTopBtn').addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);
document.getElementById('scrollProjectsBtn').addEventListener('click', () =>
  document.getElementById('shopGrid').scrollIntoView({ behavior: 'smooth' })
);
document.getElementById('scrollOrderBtn').addEventListener('click', () =>
  document.getElementById('buySection').scrollIntoView({ behavior: 'smooth' })
);
document.getElementById('btnEnterKadai').addEventListener('click', () =>
  document.getElementById('shopGrid').scrollIntoView({ behavior: 'smooth', block: 'start' })
);


/* ============================================================
   4. DOMAIN FILTER CHIPS
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
   5. BUY NOW → scroll + auto-select dropdown
   ============================================================ */
function scrollToBuy(projectName) {
  document.getElementById('buySection').scrollIntoView({ behavior: 'smooth' });

  if (!projectName) return;

  setTimeout(() => {
    const sel = document.getElementById('buyProject');

    /* Exact match */
    for (const opt of sel.options) {
      if (opt.value === projectName) {
        sel.value = opt.value;
        flashSelect(sel);
        return;
      }
    }
    /* Fuzzy match — first word */
    const first = projectName.split(' ')[0].toLowerCase();
    for (const opt of sel.options) {
      if (opt.value.toLowerCase().includes(first)) {
        sel.value = opt.value;
        flashSelect(sel);
        return;
      }
    }
  }, 500);
}

function flashSelect(el) {
  el.style.borderColor = '#f5a623';
  el.style.boxShadow   = '0 0 18px rgba(245,166,35,0.5)';
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1500);
}

document.querySelectorAll('.btn-buy[data-project]').forEach(btn => {
  btn.addEventListener('click', () => scrollToBuy(btn.dataset.project));
});

const btnCustom = document.getElementById('btnCustom');
if (btnCustom) btnCustom.addEventListener('click', () => scrollToBuy(''));

const btnIdea = document.getElementById('btnIdea');
if (btnIdea) btnIdea.addEventListener('click', () => scrollToBuy('Free Project Ideas'));


/* ============================================================
   6. MODAL (for play-btn cards)
   ============================================================ */
const videoModal  = document.getElementById('videoModal');
const modalTitle  = document.getElementById('modalTitle');
const modalDesc   = document.getElementById('modalDesc');
const modalClose  = document.getElementById('modalClose');
const modalBuyBtn = document.getElementById('modalBuyBtn');

function openModal(title, desc) {
  if (!videoModal) return;
  modalTitle.textContent = title;
  modalDesc.textContent  = desc;
  videoModal.classList.add('open');
  modalBuyBtn.onclick = () => { closeModal(); scrollToBuy(title); };
}
function closeModal() { if (videoModal) videoModal.classList.remove('open'); }

document.querySelectorAll('.play-btn').forEach(btn =>
  btn.addEventListener('click', () => openModal(btn.dataset.title, btn.dataset.desc))
);
if (modalClose) modalClose.addEventListener('click', closeModal);
if (videoModal) videoModal.addEventListener('click', e => { if (e.target === videoModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ============================================================
   IMPORTANT — Add this hidden form anywhere inside your <body>
   so Netlify detects and registers the form at build time.
   Without this, Netlify won't capture any submissions.

   <form name="project-orders" netlify netlify-honeypot="bot-field" hidden>
     <input type="text"  name="bot-field" />
     <input type="text"  name="name" />
     <input type="email" name="email" />
     <input type="tel"   name="phone" />
     <input type="text"  name="project" />
     <textarea           name="note"></textarea>
   </form>
   ============================================================ */


/* ============================================================
   SPEECH HELPER — bold Tamil male voice
   ============================================================ */

/* Priority list of male voice name keywords — browser tries each in order */
const MALE_VOICE_KEYWORDS = [
  'ravi',       // Google हिन्दी / en-IN Ravi (deep Indian male)
  'hemant',     // Microsoft Hemant (Hindi male, deep)
  'david',      // Windows David (classic deep male)
  'mark',       // macOS Mark (deep US male)
  'daniel',     // macOS Daniel (British male)
  'george',     // British male
  'alex',       // macOS Alex (deep male)
  'fred',       // macOS Fred (very deep/robotic — bold feel)
  'viktor',     // deep European male
  'henrik',
  'thomas',
];

/* Cache loaded voices */
let _voices = [];
if ('speechSynthesis' in window) {
  const load = () => { _voices = window.speechSynthesis.getVoices(); };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

function pickMaleVoice() {
  const voices = _voices.length ? _voices : window.speechSynthesis.getVoices();

  // 1. Try exact male keyword match in name
  for (const kw of MALE_VOICE_KEYWORDS) {
    const v = voices.find(v => v.name.toLowerCase().includes(kw));
    if (v) return v;
  }

  // 2. Fallback — any en-IN voice (Ravi is male on most systems)
  const inVoice = voices.find(v => v.lang === 'en-IN');
  if (inVoice) return inVoice;

  // 3. Last resort — first English voice available
  return voices.find(v => v.lang.startsWith('en')) || null;
}

function speak(text, rate = 0.78, pitch = 0.30) {
  // pitch 0.30 = very deep/bold; rate 0.78 = clear & confident
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const utter    = new SpeechSynthesisUtterance(text);
  utter.lang     = 'en-IN';
  utter.rate     = rate;
  utter.pitch    = pitch;   // 0 = deepest possible, 1 = default, 2 = high
  utter.volume   = 1;

  const maleVoice = pickMaleVoice();
  if (maleVoice) utter.voice = maleVoice;

  window.speechSynthesis.speak(utter);
}


/* ============================================================
   SAY NANDRI — fires after successful order
   ============================================================ */
function sayNandri() {
  if (!('speechSynthesis' in window)) return;

  // Show speech bubble if it exists in your HTML
  const speechBubble = document.getElementById('speechBubble'); // adjust ID if different
  if (speechBubble) {
    speechBubble.textContent = '🙏 Nandri!';
    speechBubble.style.display = 'block';
    speechBubble.style.animation = 'none';
    void speechBubble.offsetWidth;                              // reflow trick to restart animation
    speechBubble.style.animation = 'bubblePop 0.3s cubic-bezier(0.34,1.56,0.64,1)';
  }

  // Speak "Nandri!" first
  setTimeout(() => speak('Nandri!', 0.72, 0.60), 400);

  // Then the thank-you message
  setTimeout(() => speak('Thank you for your order. We will contact you very soon!', 0.72, 0.60), 2400);
}


/* ============================================================
   FLASH FIELD — highlights an invalid field with a warning
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
  if (btn) {
    btn.textContent = "🚀 Place Order — We'll Contact You!";
    btn.disabled    = false;
  }
}


/* ============================================================
   CLEAR FORM — resets all fields after successful submission
   ============================================================ */
function clearForm() {
  ['buyName', 'buyEmail', 'buyPhone', 'buyNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const project = document.getElementById('buyProject');
  if (project) project.value = '';
}


/* ============================================================
   SHOW TOAST — simple notification (implement your own or use below)
   ============================================================ */
function showToast(message, type = 'info') {
  // Remove any existing toast
  const old = document.getElementById('_toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = '_toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '24px',
    right:        '24px',
    padding:      '14px 20px',
    borderRadius: '10px',
    fontSize:     '15px',
    fontWeight:   '600',
    color:        '#fff',
    background:   type === 'success' ? '#22c55e' : '#f59e0b',
    boxShadow:    '0 6px 24px rgba(0,0,0,0.18)',
    zIndex:       '99999',
    maxWidth:     '340px',
    transition:   'opacity 0.4s',
  });

  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; }, 3500);
  setTimeout(() => toast.remove(), 3900);
}


/* ============================================================
   SUBMIT ORDER — Netlify form POST, then Nandri voice
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnSubmit');
  if (btn) btn.addEventListener('click', submitOrder);
});

async function submitOrder() {
  const name    = document.getElementById('buyName')?.value.trim()    || '';
  const email   = document.getElementById('buyEmail')?.value.trim()   || '';
  const phone   = document.getElementById('buyPhone')?.value.trim()   || '';
  const project = document.getElementById('buyProject')?.value        || '';
  const note    = document.getElementById('buyNote')?.value.trim()    || '';
  const btn     = document.getElementById('btnSubmit');

  /* --- Validation --- */
  if (!name)    { flashField('buyName',    '⚠️ Full name is required');          return; }
  if (!phone)   { flashField('buyPhone',   '⚠️ Mobile number is required');       return; }
  if (!email)   { flashField('buyEmail',   '⚠️ Email is required');               return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    flashField('buyEmail', '⚠️ Enter a valid email address');                     return;
  }
  if (!project) { flashField('buyProject', '⚠️ Please select a project');        return; }

  if (btn) { btn.textContent = '⏳ Submitting...'; btn.disabled = true; }

  try {
    const body = new URLSearchParams({
      'form-name': 'project-orders',  // must match the name="" on your hidden <form>
      'bot-field': '',                 // honeypot — leave blank
      name,
      email,
      phone,
      project,
      note,
    });

    /* Using redirect:'manual' so fetch doesn't throw on Netlify's 302 redirect.
       Any response reaching here (0, 200, 302) means Netlify received the data. */
    await fetch('/', {
      method:   'POST',
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:     body.toString(),
      redirect: 'manual',
    });

    /* ✅ Success path */
    showToast(`✅ Order placed, ${name}! We'll contact you within 24 hours.`, 'success');
    sayNandri();   // 🔊 speaks "Nandri!" then thank-you message
    clearForm();

  } catch (err) {
    console.error('Form submit error:', err);
    showToast('⚠️ Network error. Check your connection and try again.', 'warn');
  } finally {
    if (btn) {
      btn.textContent = "🚀 Place Order — We'll Contact You!";
      btn.disabled    = false;
    }
  }
}


/* ============================================================
   9. TOAST
   ============================================================ */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = type === 'warn'
    ? 'linear-gradient(135deg,#ff4d6d,#cc0033)'
    : 'linear-gradient(135deg,#2aff7a,#00c853)';
  toast.style.color = type === 'warn' ? '#fff' : '#000';
  toast.style.display = 'block';
  toast.style.animation = 'none';
  void toast.offsetWidth;
  toast.style.animation = 'toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  setTimeout(() => { toast.style.display = 'none'; }, 5000);
}


/* ============================================================
   10. CARD ENTRANCE ANIMATIONS
   ============================================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.07}s`;
      entry.target.classList.add('card-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card').forEach(card => {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
  observer.observe(card);
});

const styleInject = document.createElement('style');
styleInject.textContent = `.card-visible { opacity:1 !important; transform:translateY(0) !important; }`;
document.head.appendChild(styleInject);