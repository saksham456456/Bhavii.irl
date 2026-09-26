// Sounds
const squeakSound = document.getElementById('squeak-sound');
const boingSound = document.getElementById('boing-sound');
const tadaSound = document.getElementById('tada-sound');
const bgAudio = document.getElementById('bg-audio');

// Stages
const stageEntrance = document.getElementById('stage-entrance');
const stageTyping = document.getElementById('stage-typing');
const stagePrank = document.getElementById('stage-prank');
const stageMeme = document.getElementById('stage-meme');
const stageReveal = document.getElementById('stage-reveal');

// Elements
const entranceTyping = document.getElementById('entrance-typing');
const entranceActions = document.getElementById('entrance-actions');
const btnStep1 = document.getElementById('btn-step-1');
const btnStep2 = document.getElementById('btn-step-2');
const btnStep3 = document.getElementById('btn-step-3');
const mainText = document.getElementById('main-text');
const movingBtn = document.getElementById('catch-me-btn');

function playSound(sound) {
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.5;
        sound.play().catch(() => {});
    }
}

// Stage 0: Entrance Animation
async function initEntrance() {
    await new Promise(r => setTimeout(r, 500));
    entranceTyping.textContent = "Oye Bhavya! 👋";
    playSound(boingSound);
    await new Promise(r => setTimeout(r, 1000));
    entranceTyping.innerHTML += "<br>Ek chhota sa surprise banaya hai tere liye...";
    playSound(squeakSound);
    await new Promise(r => setTimeout(r, 1000));
    entranceActions.classList.remove('hidden');
}

btnStep1.addEventListener('click', () => {
    playSound(squeakSound);
    if (bgAudio.paused) {
        bgAudio.volume = 0.2;
        bgAudio.play().catch(() => {});
    }
    btnStep1.classList.add('hidden');
    entranceTyping.textContent = "Dil thaam ke baithna!";
    btnStep2.classList.remove('hidden');
});

btnStep2.addEventListener('click', () => {
    playSound(squeakSound);
    btnStep2.classList.add('hidden');
    entranceTyping.textContent = "Ready? Chal shuru karte hain!";
    btnStep3.classList.remove('hidden');
});

btnStep3.addEventListener('click', () => {
    playSound(boingSound);
    stageEntrance.classList.remove('active');
    stageEntrance.classList.add('hidden');
    
    stageTyping.classList.remove('hidden');
    stageTyping.classList.add('active');
    
    setTimeout(() => {
        startTypingSequence();
    }, 800);
});

// Stage 1: Main Typing Sequence
const textLines = [
    "Directly Insta par message kar sakta tha...",
    "Par mujhe tujhe pareshan karna tha! 😂"
];

async function typeText(text, speed = 50) {
    mainText.textContent = "";
    return new Promise(resolve => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                mainText.textContent += text.charAt(i);
                if (text.charAt(i) !== ' ') playSound(squeakSound);
                i++;
            } else {
                clearInterval(timer);
                resolve();
            }
        }, speed);
    });
}

async function startTypingSequence() {
    await new Promise(r => setTimeout(r, 1000));
    await typeText(textLines[0], 60);
    await new Promise(r => setTimeout(r, 2000)); // wait to read
    await typeText(textLines[1], 60);
    await new Promise(r => setTimeout(r, 2500)); // wait to read
    
    // Switch to Prank Stage
    stageTyping.classList.remove('active');
    stageTyping.classList.add('hidden');
    
    stagePrank.classList.remove('hidden');
    stagePrank.classList.add('active');
    
    // Center the moving button initially
    const container = document.querySelector('.container');
    movingBtn.style.left = `${container.clientWidth / 2 - movingBtn.clientWidth / 2}px`;
    movingBtn.style.top = `${container.clientHeight / 2 - movingBtn.clientHeight / 2}px`;
}

// Stage 2: Moving Button Prank
let evasions = 0;
const maxEvasions = 3;

const bruhSound = document.getElementById('bruh-sound');
const laughSound = document.getElementById('laugh-sound');
const bonkSound = document.getElementById('bonk-sound');

function moveButton(e) {
    if (evasions >= maxEvasions) {
        triggerMeme();
        return;
    }
    
    // Play bruh sound if they actually clicked it
    if (e.type === 'click') {
        playSound(bruhSound);
    } else {
        playSound(bonkSound);
    }
    
    const container = document.querySelector('.container');
    const maxX = container.clientWidth - movingBtn.clientWidth - 40;
    const maxY = container.clientHeight - movingBtn.clientHeight - 40;
    
    const randomX = 20 + Math.random() * maxX;
    const randomY = 20 + Math.random() * maxY;
    
    movingBtn.style.left = `${randomX}px`;
    movingBtn.style.top = `${randomY}px`;
    
    evasions++;
}

movingBtn.addEventListener('mouseenter', moveButton);
movingBtn.addEventListener('touchstart', moveButton);
movingBtn.addEventListener('click', moveButton);

function triggerMeme() {
    stagePrank.classList.remove('active');
    stagePrank.classList.add('hidden');
    
    stageMeme.classList.remove('hidden');
    stageMeme.classList.add('active');
    playSound(laughSound);
    
    setTimeout(() => {
        stageMeme.classList.remove('active');
        stageMeme.classList.add('hidden');
        
        stageReveal.classList.remove('hidden');
        stageReveal.classList.add('active');
        hasReachedEnd = true; // Unlock tab closing
        playSound(tadaSound);
        fireGiftConfetti();
    }, 4000); // show meme for 4 seconds
}

function fireGiftConfetti() {
    if (typeof confetti !== 'undefined') {
        var duration = 4000;
        var end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ffb3c6', '#ffafcc', '#cdb4db', '#a18cd1', '#ff6b81']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ffb3c6', '#ffafcc', '#cdb4db', '#a18cd1', '#ff6b81']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

// --- Prevent accidental tab closing before the reveal ---
let hasReachedEnd = false;
window.addEventListener('beforeunload', function (e) {
    if (!hasReachedEnd) {
        e.preventDefault();
        // Modern browsers show a generic warning, but setting returnValue is required.
        e.returnValue = 'Ruk ja! Abhi surprise baaki hai!';
    }
});

// Start the whole thing
window.onload = initEntrance;
