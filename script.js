document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const startBtn = document.getElementById('start-btn');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const celebrationScreen = document.getElementById('celebration-screen');

    // Start floating hearts background immediately
    createFloatingHearts();
    
    // Create ambient particles
    createAmbientParticles();

    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // Music Control
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    let isPlaying = false;

    // Check if music file exists
    bgMusic.addEventListener('error', () => {
        console.log('Music file not found. Add your music.mp3 file to assets/ folder');
    });

    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<span class="music-icon">🎵</span>';
            isPlaying = false;
        } else {
            bgMusic.play().catch(error => {
                console.log("Audio play failed - add your music.mp3 to assets/ folder");
            });
            musicToggle.innerHTML = '<span class="music-icon">🔇</span>';
            isPlaying = true;
        }
    });

    // Start Experience
    startBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');

        // Auto-play music after user interaction
        if (!isPlaying) {
            bgMusic.play().then(() => {
                isPlaying = true;
                musicToggle.innerHTML = '<span class="music-icon">🔇</span>';
            }).catch(e => console.log("Auto-play prevented or file not found"));
        }

        // Start physics after transition
        setTimeout(() => {
            if (window.startPhysics) {
                window.startPhysics();
            }
        }, 100);
    });

    // "No" Button - Runs away from cursor!
    let noButtonScale = 1;
    let escapeCount = 0;
    
    const runAwayFromCursor = (e) => {
        const btn = noBtn;
        const btnRect = btn.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - btnCenterX, 2) + 
            Math.pow(mouseY - btnCenterY, 2)
        );
        
        // If cursor is close, run away!
        if (distance < 150) {
            const angle = Math.atan2(btnCenterY - mouseY, btnCenterX - mouseX);
            const moveDistance = 150 - distance;
            
            let newX = btnCenterX + Math.cos(angle) * moveDistance;
            let newY = btnCenterY + Math.sin(angle) * moveDistance;
            
            // Keep button within viewport
            const margin = 100;
            newX = Math.max(margin, Math.min(window.innerWidth - margin, newX));
            newY = Math.max(margin, Math.min(window.innerHeight - margin, newY));
            
            btn.style.position = 'fixed';
            btn.style.left = newX + 'px';
            btn.style.top = newY + 'px';
            btn.style.transform = `translate(-50%, -50%) scale(${noButtonScale}) rotate(${Math.random() * 20 - 10}deg)`;
            
            escapeCount++;
            
            // Make it harder to click - shrink it a bit each time
            if (escapeCount % 3 === 0) {
                noButtonScale *= 0.85;
                btn.style.transform = `translate(-50%, -50%) scale(${noButtonScale})`;
            }
            
            // If it gets too small, hide it
            if (noButtonScale < 0.3) {
                btn.style.display = 'none';
            }
        }
    };
    
    // Add mousemove listener to make "No" button run away
    document.addEventListener('mousemove', runAwayFromCursor);

    // "No" Button Click - Still shrinks if somehow clicked
    noBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        noButtonScale *= 0.7;
        noBtn.style.transform = `translate(-50%, -50%) scale(${noButtonScale})`;
        
        if (noButtonScale < 0.2) {
            noBtn.style.display = 'none';
        }
    });

    // "Yes" Button Interaction
    yesBtn.addEventListener('click', () => {
        // Stop the runaway behavior
        document.removeEventListener('mousemove', runAwayFromCursor);
        
        mainContent.classList.add('hidden');
        celebrationScreen.classList.remove('hidden');

        // Create massive confetti explosion
        createConfettiExplosion();
        
        // Create heart burst
        createHeartBurst();
    });
});

// Create floating hearts background
function createFloatingHearts() {
    const container = document.getElementById('floating-hearts-bg');
    const hearts = ['💖', '💕', '💗', '💓', '💞', '💝', '❤️'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
        heart.style.animationDelay = (Math.random() * 2) + 's';
        
        container.appendChild(heart);
        
        // Remove after animation
        setTimeout(() => {
            heart.remove();
        }, 13000);
    }, 500);
}

// Create ambient particles (sparkles, stars)
function createAmbientParticles() {
    const container = document.getElementById('particles-container');
    const particles = ['✨', '⭐', '🌟', '💫'];
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'absolute';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.fontSize = (Math.random() * 1 + 0.5) + 'rem';
        particle.style.opacity = '0';
        particle.style.animation = 'sparkle 2s ease-in-out';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }, 800);
}

// Add sparkle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
`;
document.head.appendChild(style);

// Create confetti explosion
function createConfettiExplosion() {
    const colors = ['#ff6b9d', '#ffd700', '#ff3d71', '#9b59b6', '#fff', '#ff8fa3'];
    const celebrationScreen = document.getElementById('celebration-screen');

    for (let i = 0; i < 200; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.opacity = Math.random() * 0.7 + 0.3;
            
            celebrationScreen.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 10);
    }
}

// Create heart burst effect
function createHeartBurst() {
    const celebrationScreen = document.getElementById('celebration-screen');
    const hearts = ['💖', '💕', '💗', '💓', '💞', '💝', '❤️'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.position = 'absolute';
            heart.style.left = '50%';
            heart.style.top = '50%';
            heart.style.fontSize = (Math.random() * 2 + 2) + 'rem';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '1000';
            
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = Math.random() * 200 + 200;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            celebrationScreen.appendChild(heart);
            
            let x = 0;
            let y = 0;
            let opacity = 1;
            
            const animate = () => {
                x += vx * 0.016;
                y += vy * 0.016;
                opacity -= 0.01;
                
                heart.style.transform = `translate(${x}px, ${y}px) rotate(${x}deg)`;
                heart.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    heart.remove();
                }
            };
            
            animate();
        }, i * 50);
    }
}