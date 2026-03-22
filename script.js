const typingSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
const popSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const bgAudio = document.getElementById('bg-audio');
let isMuted = false;

const entranceScreen = document.getElementById('entrance-screen');
const entranceTyping = document.getElementById('entrance-typing');
const entranceActions = document.getElementById('entrance-actions');
const mainContent = document.getElementById('main-content');
const storyContent = document.getElementById('story-content');
const fakeEnd = document.getElementById('fake-end');
const scrollHint = document.getElementById('scroll-hint');
const floatingContainer = document.getElementById('floating-container');
const lockScreen = document.getElementById('lock-screen');
const rewardScreen = document.getElementById('reward-screen');

const btnStep1 = document.getElementById('btn-step-1');
const btnStep2 = document.getElementById('btn-step-2');
const btnStep3 = document.getElementById('btn-step-3');

const mainLines = document.querySelectorAll('.type-lines span');

// State management
let experienceState = 'intro'; // intro, fake-end, revealed, locked, reward
let inactivityTimer;
let messageIndex = 0;
let scrollResistanceActive = false;
let rewardEligible = false;
let lockShown = false;
let lastScrollTop = 0;

const teasingMessages = [
    "…itni shareef banne ki zarurat nahi hai… 😏",
    "you’re really trying not to scroll… 😉",
    "Acha… control dikhana hai mujhe? 😌",
    "Par curiosity already jeet rahi hai 🙂",
    "Sach bol… dekhna hai na neeche kya hai? 🌚",
    "Main hota na to… rukta hi nahi 😌"
];

const resistanceMessages = [
    "Arey… ruk. 🛑",
    "Itni jaldi give in? 😏",
    "I said don’t… 🤐",
    "Control nahi ho raha? 😌",
    "Good… keep going. 😉",
    "Exactly what I thought. 🙂"
];

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
    await new Promise(r => setTimeout(r, 800));
    await typeText(entranceTyping, "Good morning, Bhavya...");
    await new Promise(r => setTimeout(r, 1000));
    entranceTyping.innerHTML += "<br>";
    await typeText(entranceTyping, "I was thinking about you...", 40);
    await new Promise(r => setTimeout(r, 800));
    entranceActions.classList.remove('hidden');
}

btnStep1.addEventListener('click', async () => {
    unlockAudio();
    btnStep1.classList.add('hidden');
    await typeText(entranceTyping, "You do this thing… you don’t even realize it.");
    await new Promise(r => setTimeout(r, 800));
    btnStep2.classList.remove('hidden');
});

btnStep2.addEventListener('click', async () => {
    btnStep2.classList.add('hidden');
    await typeText(entranceTyping, "I noticed.");
    await new Promise(r => setTimeout(r, 1000));
    btnStep3.classList.remove('hidden');
});

btnStep3.addEventListener('click', () => {
    entranceScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    setTimeout(() => {
        entranceScreen.style.display = 'none';
        startMainFlow();
    }, 1000);
});

async function startMainFlow() {
    experienceState = 'intro';
    await startMainTyping();
    experienceState = 'fake-end';
    resetInactivityTimer();
}

async function startMainTyping() {
    for (const [index, line] of mainLines.entries()) {
        await new Promise((r) => setTimeout(r, 300 * index + 100));
        await typeText(line, line.dataset.text || '', 30);
    }
}

// Smooth Scroll
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Inactivity handling
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (experienceState === 'fake-end') {
        inactivityTimer = setTimeout(showTeasingMessage, 4000);
    }
}

function showTeasingMessage() {
    if (experienceState !== 'fake-end') return;

    // Show scroll hint when teasing starts
    if (messageIndex === 0) {
        scrollHint.classList.remove('hidden');
        setTimeout(() => scrollHint.classList.add('visible'), 100);
    }

    const msg = teasingMessages[messageIndex % teasingMessages.length];
    createFloatingText(msg);
    messageIndex++;

    inactivityTimer = setTimeout(showTeasingMessage, 4000);
}

function createFloatingText(text) {
    const el = document.createElement('div');
    el.className = 'floating-msg';
    el.textContent = text;

    // Random position
    const x = Math.random() * 60 + 20; // 20-80%
    const y = Math.random() * 60 + 20; // 20-80%
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;

    floatingContainer.appendChild(el);

    gsap.to(el, {
        opacity: 1,
        y: -20,
        duration: 1,
        onComplete: () => {
            gsap.to(el, {
                opacity: 0,
                y: -40,
                duration: 1,
                delay: 2,
                onComplete: () => el.remove()
            });
        }
    });
}

// Scroll Handling
lenis.on('scroll', (e) => {
    const { scroll, velocity, direction } = e;

    if (experienceState === 'fake-end' && scroll > 50) {
        if (!scrollResistanceActive) {
            scrollResistanceActive = true;
            triggerResistance();
        }
    }

    if (experienceState === 'revealed') {
        // Track for reward eligibility
        if (Math.abs(velocity) > 40) {
            rewardEligible = true;
        }

        // Check for bottom
        const bottomThreshold = document.documentElement.scrollHeight - window.innerHeight - 50;
        if (scroll >= bottomThreshold && rewardEligible) {
            triggerReward();
        }
    }

    // Escape attempt: only after she disobeys (starts scrolling past warning)
    const isPastWarning = scroll > 150; // Threshold to consider she "disobeyed"
    if (isPastWarning && velocity < -5 && !lockShown && (experienceState === 'revealed' || scrollResistanceActive) && experienceState !== 'reward') {
        triggerLockScene();
    }

    resetInactivityTimer();
});

function triggerResistance() {
    let resIndex = 0;
    const interval = setInterval(() => {
        if (resIndex >= resistanceMessages.length) {
            clearInterval(interval);
            revealContent();
            return;
        }
        createFloatingText(resistanceMessages[resIndex]);
        resIndex++;
    }, 1500);
}

function revealContent() {
    experienceState = 'revealed';
    storyContent.classList.remove('hidden-content');
    storyContent.classList.add('visible-content');

    // Fade out fake end
    gsap.to(fakeEnd, {
        opacity: 0,
        duration: 2,
        onComplete: () => fakeEnd.style.display = 'none'
    });
}

// Lock Scene
function triggerLockScene() {
    if (lockShown) return;
    lockShown = true;
    const previousState = experienceState;
    experienceState = 'locked';

    lockScreen.classList.remove('hidden');
    gsap.fromTo(lockScreen, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    document.body.classList.add('screen-shake');

    const tl = gsap.timeline();

    // Animate chains
    tl.from('.chain-tl', { x: '-100%', y: '-100%', duration: 0.6, ease: 'power2.out' }, 0)
      .from('.chain-tr', { x: '100%', y: '-100%', duration: 0.6, ease: 'power2.out' }, 0)
      .from('.chain-bl', { x: '-100%', y: '100%', duration: 0.6, ease: 'power2.out' }, 0)
      .from('.chain-br', { x: '100%', y: '100%', duration: 0.6, ease: 'power2.out' }, 0)
      .from('.lock-wrapper', {
          scale: 5,
          opacity: 0,
          duration: 0.3,
          ease: 'back.out(1.7)',
          onComplete: () => {
              setTimeout(() => document.body.classList.remove('screen-shake'), 300);
          }
      }, 0.5);

    // Text phases
    const phase1 = document.querySelector('.lock-phase-1');
    const phase2 = document.querySelector('.lock-phase-2');
    const guidance = document.querySelector('.lock-guidance');

    tl.to(phase1, { opacity: 1, duration: 0.5 }, 1)
      .to(phase1, { opacity: 0, duration: 0.5, delay: 2 })
      .call(() => {
          phase1.classList.add('hidden');
          phase2.classList.remove('hidden');
      })
      .fromTo(phase2, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .to(phase2, { opacity: 0, duration: 0.5, delay: 2 })
      .call(() => {
          phase2.classList.add('hidden');
          guidance.classList.remove('hidden');
      })
      .fromTo(guidance, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .to(lockScreen, {
          opacity: 0,
          duration: 1.5,
          delay: 3,
          ease: 'power2.inOut',
          onComplete: () => {
              lockScreen.classList.add('hidden');
              experienceState = previousState === 'locked' ? 'revealed' : previousState;
          }
      });
}

// Escape attempt: cursor move (only after disobeys)
document.addEventListener('mousemove', (e) => {
    const isDisobeyed = experienceState === 'revealed' || scrollResistanceActive;
    if (isDisobeyed && !lockShown && e.clientY < 80) {
        // Only if she has already engaged or seen content
        triggerLockScene();
    }
});

// Escape attempt: beforeunload
window.addEventListener('beforeunload', (e) => {
    if (experienceState === 'revealed' && !lockShown) {
        // Since we can't reliably show the overlay on exit,
        // we trigger it as a last-resort simulation.
        triggerLockScene();
        // Standard confirmation dialog
        e.preventDefault();
        e.returnValue = '';
    }
});

// Reward Scene
function triggerReward() {
    if (experienceState === 'reward') return;
    experienceState = 'reward';

    // Hide all other elements first for total isolation
    gsap.to(['#main-content > *:not(#reward-screen)', '#floating-container'], {
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.5,
        ease: 'power2.inOut'
    });

    rewardScreen.classList.remove('hidden');
    gsap.fromTo(rewardScreen, { opacity: 0 }, { opacity: 1, duration: 2 });

    gsap.from('.reward-content', {
        opacity: 0,
        scale: 1.1,
        y: 30,
        duration: 3,
        ease: 'power2.out'
    });

    // Staggered text reveal
    gsap.from('.reward-secondary p', {
        opacity: 0,
        y: 15,
        duration: 2,
        stagger: 2,
        delay: 1.5,
        ease: 'power1.out'
    });
}

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
