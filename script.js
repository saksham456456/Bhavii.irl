const typingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
const popSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const bgAudio = document.getElementById('bg-audio');
let isMuted = false;

const entranceScreen = document.getElementById('entrance-screen');
const entranceTyping = document.getElementById('entrance-typing');
const entranceActions = document.getElementById('entrance-actions');
const mainContent = document.getElementById('main-content');

const btnStep1 = document.getElementById('btn-step-1');
const btnStep2 = document.getElementById('btn-step-2');
const btnStep3 = document.getElementById('btn-step-3');

const mainLines = document.querySelectorAll('.type-lines span');

// Helper for typing effect
function typeText(el, text, speed = 50) {
    return new Promise((resolve) => {
        let i = 0;
        el.textContent = "";
        const timer = setInterval(() => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                if (!isMuted && text[i] && text[i] !== ' ') {
                    const s = typingSound.cloneNode();
                    s.volume = 0.15;
                    s.play().catch(() => {});
                }
                i++;
            } else {
                clearInterval(timer);
                resolve();
            }
        }, speed);
    });
}

// Unlock audio
async function unlockAudio() {
    if (bgAudio.paused) {
        bgAudio.volume = 0.18;
        bgAudio.play().catch(e => console.log("Audio play blocked", e));
    }
}

// Sequence for Entrance
async function initEntrance() {
    await new Promise(r => setTimeout(r, 1000));
    await typeText(entranceTyping, "Good Morning Bhavya...");
    await new Promise(r => setTimeout(r, 800));
    entranceTyping.innerHTML += "<br>";
    await typeText(entranceTyping, "Don't find it strange...", 50);
    await new Promise(r => setTimeout(r, 800));
    entranceTyping.innerHTML += "<br>";
    await typeText(entranceTyping, "Ek chhoti si permission chahiye thi...", 50);
    entranceActions.classList.remove('hidden');
}

btnStep1.addEventListener('click', async () => {
    unlockAudio();
    btnStep1.classList.add('hidden');
    await typeText(entranceTyping, "Main proceed karoon ya suspense bana rahe?");
    btnStep2.classList.remove('hidden');
});

btnStep2.addEventListener('click', async () => {
    btnStep2.classList.add('hidden');
    await typeText(entranceTyping, "Aapki ijazat?");
    btnStep3.classList.remove('hidden');
});

btnStep3.addEventListener('click', () => {
    entranceScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    setTimeout(() => {
        entranceScreen.style.display = 'none';
        startMainTyping();
    }, 1000);
});

async function startMainTyping() {
    for (const [index, line] of mainLines.entries()) {
        await new Promise((r) => setTimeout(r, 500 * index + 180));
        await typeText(line, line.dataset.text || '');
    }
}

// Smooth Scroll
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// GSAP Animations
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

// Polaroid movement
gsap.to('.polaroid', {
  yPercent: -12,
  ease: 'none',
  scrollTrigger: {
    trigger: '#effort-proof',
    scrub: true,
  },
});

// Confession Pulsing
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

// Card Toggle
const cards = document.querySelectorAll('.moment-card');
cards.forEach((card) => {
  const toggle = () => card.classList.toggle('active');
  card.addEventListener('click', toggle);
});

// Button Sounds & Ripples
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

// Confetti
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

// Mute Toggle
const muteToggle = document.getElementById('mute-toggle');
muteToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    muteToggle.textContent = isMuted ? '🔇' : '🔊';
    if (isMuted) {
        bgAudio.pause();
    } else {
        bgAudio.play().catch(() => {});
    }
});

// Easter Egg
document.getElementById('easter-egg').addEventListener('click', () => {
  const log = document.getElementById('devlog');
  log.hidden = !log.hidden;
});

// Start the flow
initEntrance();
