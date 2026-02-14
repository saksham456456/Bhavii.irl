const lines = document.querySelectorAll('.type-lines span');
const bgAudio = document.getElementById('bg-audio');
const popAudio = document.getElementById('pop-audio');
const muteToggle = document.getElementById('mute-toggle');
const toast = document.getElementById('toast');

let isMuted = false;
let typeOscillatorContext;

function playTypeTick() {
  if (isMuted) return;
  if (!typeOscillatorContext) {
    typeOscillatorContext = new AudioContext();
  }
  if (typeOscillatorContext.state === 'suspended') {
    return;
  }

  const osc = typeOscillatorContext.createOscillator();
  const gain = typeOscillatorContext.createGain();
  osc.type = 'square';
  osc.frequency.value = 850;
  gain.gain.value = 0.008;
  osc.connect(gain);
  gain.connect(typeOscillatorContext.destination);
  osc.start();
  osc.stop(typeOscillatorContext.currentTime + 0.014);
}

async function typeLine(el, text, speed = 42) {
  for (let i = 0; i <= text.length; i += 1) {
    el.textContent = text.slice(0, i);
    playTypeTick();
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
}

(async () => {
  for (const [index, line] of lines.entries()) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 420 * index + 120));
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

ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const warmth = Math.min(1, self.progress * 1.25);
    document.body.style.background = `linear-gradient(180deg, #0a0b10 0%, #14111a ${45 - warmth * 8}%, rgb(${42 + warmth * 40}, ${29 + warmth * 16}, ${26 + warmth * 8}) 100%)`;
  },
});

document.querySelectorAll('.reveal').forEach((el, index) => {
  gsap.fromTo(
    el,
    {
      opacity: 0,
      y: 38,
      scale: 0.95,
      rotateX: -12,
      filter: 'blur(10px)',
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        end: 'bottom 20%',
        scrub: true,
      },
    }
  );

  gsap.to(el, {
    opacity: 0.12,
    y: -32,
    scale: 0.96,
    filter: 'blur(7px)',
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top 5%',
      end: 'bottom -20%',
      scrub: true,
    },
    delay: index * 0.01,
  });
});

gsap.to('.polaroid', {
  yPercent: -12,
  rotate: 2,
  ease: 'none',
  scrollTrigger: {
    trigger: '#effort-proof',
    scrub: true,
  },
});

gsap.fromTo(
  '.pulse',
  { scale: 0.93, opacity: 0, filter: 'blur(8px)' },
  {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.6,
    stagger: 0.35,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#confession',
      start: 'top 70%',
      end: 'bottom 35%',
      scrub: true,
    },
  }
);

const cards = document.querySelectorAll('.moment-card');
cards.forEach((card) => {
  const toggle = () => {
    card.classList.toggle('active');
    if (!isMuted) {
      popAudio.currentTime = 0;
      popAudio.play().catch(() => {});
    }
  };

  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
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

  button.addEventListener('click', () => {
    if (!isMuted) {
      popAudio.currentTime = 0;
      popAudio.play().catch(() => {});
    }
  });
});

document.getElementById('yes-btn').addEventListener('click', () => {
  confetti({
    particleCount: 170,
    spread: 75,
    origin: { y: 0.62 },
    scalar: 1.05,
  });
  gsap.to('#toast', { y: '-150%', duration: 0.35, ease: 'back.out(1.7)' });
  toast.textContent = 'Okay wow, this is getting real 💫';
  setTimeout(() => {
    gsap.to('#toast', { y: '130%', duration: 0.35 });
  }, 2200);
});

document.getElementById('easter-egg').addEventListener('click', () => {
  const log = document.getElementById('devlog');
  log.hidden = !log.hidden;
  gsap.to('#toast', { y: '-150%', duration: 0.35, ease: 'back.out(1.7)' });
  toast.textContent = log.hidden ? 'closing the devlog...' : 'you found the devlog 👀';
  setTimeout(() => {
    gsap.to('#toast', { y: '130%', duration: 0.35 });
  }, 1500);
});

function unlockAudio() {
  if (typeOscillatorContext && typeOscillatorContext.state === 'suspended') {
    typeOscillatorContext.resume().catch(() => {});
  }

  if (bgAudio.paused && !isMuted) {
    bgAudio.volume = 0.15;
    bgAudio.play().catch(() => {});
  }
}

['click', 'touchstart', 'keydown'].forEach((evt) => {
  window.addEventListener(evt, unlockAudio, { once: true });
});

muteToggle.addEventListener('click', () => {
  isMuted = !isMuted;
  bgAudio.muted = isMuted;
  if (isMuted) {
    muteToggle.textContent = '🔇 Muted';
    muteToggle.setAttribute('aria-pressed', 'true');
  } else {
    muteToggle.textContent = '🔊 Sound on';
    muteToggle.setAttribute('aria-pressed', 'false');
    unlockAudio();
  }
});

setTimeout(() => {
  gsap.to('#toast', { y: '-150%', duration: 0.35, ease: 'back.out(1.7)' });
  setTimeout(() => {
    gsap.to('#toast', { y: '130%', duration: 0.35 });
  }, 1800);
}, 1800);
