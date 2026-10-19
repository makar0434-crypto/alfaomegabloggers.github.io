const format = n => Math.round(n).toLocaleString('ru-RU');

// Intro gate: the visitor enters the main site using the "ВСЕ КЕЙСЫ" button.
const introScreen = document.getElementById('introScreen');
const enterSite = document.getElementById('enterSite');
enterSite.addEventListener('click', () => {
  introScreen.classList.add('leaving');
  document.body.classList.remove('intro-locked');
  window.setTimeout(() => introScreen.remove(), 800);
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

// Reveal text and content as they enter the viewport.
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }
}), {threshold: .12});
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 4, 3) * 90}ms`;
  revealObserver.observe(el);
});

const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateCounter(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion) { el.textContent = format(target); return; }
  const duration = 850, start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = format(target * eased);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = format(target);
  }
  requestAnimationFrame(tick);
}
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting && !entry.target.dataset.animated) {
    entry.target.dataset.animated = 'true';
    animateCounter(entry.target);
  }
}), {threshold: .25});
counters.forEach(el => observer.observe(el));

const start = document.getElementById('startAmount');
const rate = document.getElementById('growthRate');
const period = document.getElementById('period');
const startLabel = document.getElementById('startLabel');
const growthLabel = document.getElementById('growthLabel');
const periodLabel = document.getElementById('periodLabel');
const resultValue = document.getElementById('resultValue');
const growthValue = document.getElementById('growthValue');
function updateRange(el) {
  const min = Number(el.min), max = Number(el.max), value = Number(el.value);
  el.style.setProperty('--progress', `${(value-min)/(max-min)*100}%`);
}
let previousResult = null;
function updateCalculator() {
  const initial = Number(start.value), monthly = Number(rate.value)/100, months = Number(period.value);
  const result = initial * Math.pow(1 + monthly, months);
  startLabel.textContent = `${format(initial)} ₽`;
  growthLabel.textContent = `${rate.value}%`;
  periodLabel.textContent = `${months} ${months===1?'месяц':months>=2&&months<=4?'месяца':'месяцев'}`;
  resultValue.innerHTML = `${format(result)} <small>₽</small>`;
  if (previousResult !== null && previousResult !== result) {
    resultValue.classList.remove('updating');
    void resultValue.offsetWidth;
    resultValue.classList.add('updating');
  }
  previousResult = result;
  growthValue.textContent = `+${Math.round((result/initial-1)*100)}%`;
  [start,rate,period].forEach(updateRange);
}
[start,rate,period].forEach(el => el.addEventListener('input', updateCalculator));
updateCalculator();

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const audio = document.getElementById('siteAudio');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');
musicToggle.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
      musicToggle.classList.add('playing');
      musicLabel.textContent = 'ON';
      musicToggle.setAttribute('aria-label', 'Выключить музыку');
    } catch (e) {
      musicLabel.textContent = 'ADD MP3';
      musicToggle.title = 'Добавьте оригинальный файл в assets/music.mp3';
    }
  } else {
    audio.pause();
    musicToggle.classList.remove('playing');
    musicLabel.textContent = 'ЗВУК';
    musicToggle.setAttribute('aria-label', 'Включить музыку');
  }
});
