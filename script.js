const lines = document.querySelectorAll('.type-lines span');

function typeLine(el, text, speed = 42) {
  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      el.textContent = text.slice(0, i);
      i += 1;
      if (i > text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

(async () => {
  for (const [index, line] of lines.entries()) {
    await new Promise((r) => setTimeout(r, 500 * index + 180));
    // eslint-disable-next-line no-await-in-loop
    await typeLine(line, line.dataset.text || '');
  }
})();

const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.reveal').forEach((el) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
    },
  });
});

gsap.to('.polaroid', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: {
    trigger: '#effort-proof',
    scrub: true,
  },
});

gsap.fromTo(
  '.pulse',
  { scale: 0.95, opacity: 0 },
  {
    scale: 1,
    opacity: 1,
    duration: 1.4,
    stagger: 0.35,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#confession',
      start: 'top 70%',
    },
  }
);

const cards = document.querySelectorAll('.moment-card');
cards.forEach((card) => {
  const toggle = () => card.classList.toggle('active');
  card.addEventListener('click', toggle);
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
});

document.querySelectorAll('.ripple').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--x', `${event.clientX - rect.left}px`);
    button.style.setProperty('--y', `${event.clientY - rect.top}px`);
  });
});

document.getElementById('easter-egg').addEventListener('click', () => {
  const log = document.getElementById('devlog');
  log.hidden = !log.hidden;
});

const audio = document.getElementById('bg-audio');
const soundToggle = document.getElementById('sound-toggle');

soundToggle.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      audio.volume = 0.18;
      await audio.play();
      soundToggle.textContent = 'Sound on';
      soundToggle.setAttribute('aria-pressed', 'true');
    } else {
      audio.pause();
      soundToggle.textContent = 'Enable sound';
      soundToggle.setAttribute('aria-pressed', 'false');
    }
  } catch {
    soundToggle.textContent = 'Tap again to enable';
  }
});
