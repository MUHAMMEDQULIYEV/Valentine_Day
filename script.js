document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const startBtn = document.getElementById('start-btn');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const celebrationScreen = document.getElementById('celebration-screen');

    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);

    // Music Control
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let isPlaying = false;

    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering other click events
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.innerText = '🎵';
            isPlaying = false;
        } else {
            bgMusic.play().catch(error => console.log("Audio play failed:", error));
            musicToggle.innerText = '🔇'; // visual feedback
            isPlaying = true;
        }
    });

    // Start Experience
    startBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');

        // Auto-play music if user hasn't toggled it yet (browsers block this usually, but worth a try after interaction)
        if (!isPlaying) {
            bgMusic.play().then(() => {
                isPlaying = true;
                musicToggle.innerText = '🔇';
            }).catch(e => console.log("Auto-play prevented"));
        }

        // Wait a tiny bit for transition, then start physics
        setTimeout(() => {
            if (window.startPhysics) {
                window.startPhysics();
            }
        }, 100);
    });

    // "No" Button Interaction (Run away)
    // We need to override the physics position if it exists
    const moveNoButton = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop physics / other events

        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);

        // If physics is running, update the physics object
        if (noBtn.physics) {
            noBtn.physics.x = x;
            noBtn.physics.y = y;
            noBtn.physics.vx = (Math.random() - 0.5) * 20; // Add chaotic velocity
            noBtn.physics.vy = -10; // Jump up
        } else {
            noBtn.style.position = 'absolute';
            noBtn.style.left = `${x}px`;
            noBtn.style.top = `${y}px`;
        }
    };

    noBtn.addEventListener('mouseover', moveNoButton);
    noBtn.addEventListener('touchstart', moveNoButton);
    noBtn.addEventListener('click', moveNoButton); // Just in case they manage to click it

    // "Yes" Button Interaction
    yesBtn.addEventListener('click', () => {
        // Stop physics loop if we want? Or let it fall in background?
        // Let's hide main content and show celebration
        mainContent.classList.add('hidden');
        celebrationScreen.classList.remove('hidden');

        // Play success sound if we had one
        // launchConfetti(); // TODO: implement confetti
        createConfetti();
    });
});

function createConfetti() {
    const colors = ['#ff4d6d', '#ff8fa3', '#ffe6eb', '#fff', '#ffd700'];
    const celebrationScreen = document.getElementById('celebration-screen');

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.opacity = Math.random();
        celebrationScreen.appendChild(confetti);

        // Simple fall animation via JS or use CSS
        // Let's add styles dynamically for confetti
    }
}
