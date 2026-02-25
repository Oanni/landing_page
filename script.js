const root = document.documentElement;
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');
const subscribeForm = document.querySelector('.subscribe-form');
const emailErrorEl = document.querySelector('[data-field-error="email"]');
const consentErrorEl = document.querySelector('[data-field-error="consent"]');
const successEl = document.querySelector('.form-success');
const revealEls = document.querySelectorAll(
  '.section, .card, .section-panel, .hero-meta-item, .timeline-item, .footer-col',
);
const bgOrbits = document.querySelectorAll('.bg-orbit');
const bgWaves = document.querySelector('.bg-waves');

const mqDesktop = window.matchMedia('(min-width: 768px)');

function setBodyNavOpenState(isOpen) {
  document.body.classList.toggle('nav-open', isOpen);
  navToggle?.setAttribute('aria-expanded', String(isOpen));
}

navToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('#')) {
    setBodyNavOpenState(false);
  }
});

window.addEventListener('resize', () => {
  if (mqDesktop.matches) {
    setBodyNavOpenState(false);
  }
});

document.addEventListener('click', (event) => {
  if (!document.body.classList.contains('nav-open')) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!nav?.contains(target) && !navToggle?.contains(target)) {
    setBodyNavOpenState(false);
  }
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('#')) {
    const id = target.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    const headerOffset = header?.offsetHeight || 0;
    const rect = section.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const top = rect.top + scrollTop - (id === 'top' ? headerOffset : headerOffset + 8);

    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  }
});

function validateEmail(email) {
  if (!email) return 'Введите email.';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return 'Проверьте правильность email.';
  return '';
}

subscribeForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!(event.target instanceof HTMLFormElement)) return;
  const form = event.target;
  const emailInput = form.elements.namedItem('email');
  const consentInput = form.elements.namedItem('consent');

  let hasError = false;

  if (emailInput instanceof HTMLInputElement) {
    const message = validateEmail(emailInput.value.trim());
    emailErrorEl.textContent = message;
    hasError = hasError || Boolean(message);
  }

  if (consentInput instanceof HTMLInputElement) {
    const message = consentInput.checked ? '' : 'Нужно согласие на обработку данных.';
    consentErrorEl.textContent = message;
    hasError = hasError || Boolean(message);
  }

  if (!successEl) return;

  if (hasError) {
    successEl.hidden = true;
    return;
  }

  successEl.hidden = false;
  form.reset();
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealEls.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

let waveTiltX = 0;
let waveTiltY = 0;
let waveTargetX = 0;
let waveTargetY = 0;

const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateBackgroundParallax(xRatio, yRatio) {
  const maxTilt = 10;
  waveTargetX = (xRatio - 0.5) * maxTilt;
  waveTargetY = (yRatio - 0.5) * maxTilt;
}

function handlePointerMove(event) {
  if (hasReducedMotion) return;
  const { clientX, clientY } = event;
  const xRatio = clientX / window.innerWidth;
  const yRatio = clientY / window.innerHeight;
  updateBackgroundParallax(xRatio, yRatio);
}

function handleDeviceOrientation(event) {
  if (hasReducedMotion) return;
  const beta = event.beta ?? 0;
  const gamma = event.gamma ?? 0;
  const xRatio = (gamma + 45) / 90;
  const yRatio = (beta + 90) / 180;
  updateBackgroundParallax(Math.min(Math.max(xRatio, 0), 1), Math.min(Math.max(yRatio, 0), 1));
}

if (!hasReducedMotion) {
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('deviceorientation', handleDeviceOrientation);
}

function animateBackground() {
  waveTiltX += (waveTargetX - waveTiltX) * 0.06;
  waveTiltY += (waveTargetY - waveTiltY) * 0.06;

  const orbitOffsetX = waveTiltX * 1.6;
  const orbitOffsetY = waveTiltY * 1.2;
  const waveOffsetX = waveTiltX * 0.8;
  const waveOffsetY = waveTiltY * 0.5;

  bgOrbits.forEach((el, index) => {
    const intensity = 1 + index * 0.4;
    const x = orbitOffsetX * intensity;
    const y = orbitOffsetY * intensity;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  if (bgWaves) {
    bgWaves.style.transform = `translate3d(${waveOffsetX}px, ${waveOffsetY}px, 0) scale(1.02)`;
  }

  requestAnimationFrame(animateBackground);
}

requestAnimationFrame(animateBackground);

