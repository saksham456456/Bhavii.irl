const lines = document.querySelectorAll('.type-lines span');
const typingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
const popSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const bgAudio = document.getElementById('bg-audio');
let isMuted = true;

function typeLine(el, text, speed = 42) {
  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      el.textContent = text.slice(0, i);
      if (!isMuted && text[i-1] && text[i-1] !== ' ') {
        const s = typingSound.cloneNode();
        s.volume = 0.2;
        s.play().catch(() => {});
      }
      i += 1;
      if (i > text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

let appStarted = false;
async function startApp() {
  if (appStarted) return;
  appStarted = true;

  // Try to play background audio
  try {
    bgAudio.volume = 0.18;
    if (!isMuted) await bgAudio.play();
  } catch (e) {
    console.log("Autoplay blocked");
  }

  for (const [index, line] of lines.entries()) {
    await new Promise((r) => setTimeout(r, 500 * index + 180));
    // eslint-disable-next-line no-await-in-loop
    await typeLine(line, line.dataset.text || '');
  }
}

// Start on first interaction
['click', 'scroll', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, startApp, { once: true });
});

const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.reveal').forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, scale: 0.9, filter: 'blur(10px)', y: 50 },
    {
      opacity: 1, scale: 1, filter: 'blur(0px)', y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse',
      }
    }
  );
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

    if (!isMuted) {
      popSound.currentTime = 0;
      popSound.play().catch(() => {});
    }
  });
});

const yesButton = document.querySelector('.yes');
if (yesButton) {
  yesButton.addEventListener('click', () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f6c8a2', '#f4f1ec', '#2c7a3f']
    });
  });
}

document.getElementById('easter-egg').addEventListener('click', () => {
  const log = document.getElementById('devlog');
  log.hidden = !log.hidden;
});

const muteToggle = document.getElementById('mute-toggle');

muteToggle.addEventListener('click', () => {
  isMuted = !isMuted;
  muteToggle.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) {
    bgAudio.pause();
  } else {
    bgAudio.play().catch(() => {});
    if (!appStarted) startApp();
  }
});
