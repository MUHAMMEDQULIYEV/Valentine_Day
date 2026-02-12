/**
 * effects.js
 * Enhanced physics engine with DOM-based physics for better interactivity
 */

class DOMPhysicsWorld {
    constructor() {
        this.elements = [];
        this.gravity = 0.4;
        this.friction = 0.99;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        });

        this.mouse = { x: -1000, y: -1000 };
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.loopId = null;
    }

    addDOMElement(element) {
        const rect = element.getBoundingClientRect();

        // Set absolute position based on current location
        element.style.position = 'absolute';
        element.style.left = rect.left + 'px';
        element.style.top = rect.top + 'px';
        element.style.margin = '0';
        element.style.transform = 'translate(0, 0)';

        // Physics properties attached to DOM element
        element.physics = {
            x: rect.left,
            y: rect.top,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            width: rect.width,
            height: rect.height,
            rotation: 0,
            vRotation: (Math.random() - 0.5) * 5,
            scale: 1
        };

        this.elements.push(element);
    }

    createParticle(x, y, char) {
        const el = document.createElement('div');
        el.textContent = char || '💖';
        el.style.position = 'absolute';
        el.style.fontSize = Math.random() * 30 + 20 + 'px';
        el.style.userSelect = 'none';
        el.style.zIndex = '5';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.pointerEvents = 'none';
        el.style.filter = 'drop-shadow(0 0 10px rgba(255, 107, 157, 0.6))';
        document.body.appendChild(el);
        this.addDOMElement(el);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            const index = this.elements.indexOf(el);
            if (index > -1) {
                this.elements.splice(index, 1);
            }
            el.remove();
        }, 10000);
    }

    start() {
        if (this.loopId) return;
        this.loop();
    }

    loop() {
        this.elements.forEach(el => {
            if (!el.physics) return;
            
            const p = el.physics;

            // Gravity
            p.vy += this.gravity;
            p.vx *= this.friction;
            p.vy *= this.friction;

            // Position Update
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.vRotation * 0.9;

            // Mouse Repel (Antigravity effect)
            const dx = (p.x + p.width / 2) - this.mouse.x;
            const dy = (p.y + p.height / 2) - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) / 2000;
                p.vx += dx * force;
                p.vy += dy * force;
            }

            // Floor Collision
            if (p.y + p.height >= this.height) {
                p.y = this.height - p.height;
                p.vy *= -0.6; // Bounce
                p.vx *= 0.9; // Friction

                // Prevent endless micro-bouncing
                if (Math.abs(p.vy) < 0.5) p.vy = 0;
            }

            // Ceiling Collision
            if (p.y <= 0) {
                p.y = 0;
                p.vy *= -0.5;
            }

            // Wall Collision
            if (p.x <= 0) {
                p.x = 0;
                p.vx *= -0.6;
            }
            if (p.x + p.width >= this.width) {
                p.x = this.width - p.width;
                p.vx *= -0.6;
            }

            // Apply to styles
            el.style.left = p.x + 'px';
            el.style.top = p.y + 'px';
            const scale = p.scale || 1;
            el.style.transform = `rotate(${p.rotation}deg) scale(${scale})`;
        });

        this.loopId = requestAnimationFrame(() => this.loop());
    }
}

// Initialize physics world
window.startPhysics = function () {
    const world = new DOMPhysicsWorld();
    window.physicsWorld = world;

    // Create floating decorative particles
    const particles = ['💖', '💕', '🌹', '🌸', '🌺', '✨', '💌', '💝'];
    
    // Initial burst of particles
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * window.innerWidth;
        const y = -Math.random() * 300;
        const char = particles[Math.floor(Math.random() * particles.length)];
        world.createParticle(x, y, char);
    }

    // Continuous particle creation
    setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = -50;
        const char = particles[Math.floor(Math.random() * particles.length)];
        world.createParticle(x, y, char);
    }, 1000);

    // Drop the question text with physics
    const title = document.querySelector('.floating-text');
    if (title) {
        // Don't add physics to title - keep it readable
        // world.addDOMElement(title);
    }

    // Note: We're NOT adding physics to the Yes/No buttons
    // because we want them to be easily clickable
    // The "No" button has its own special runaway behavior

    world.start();
    
    console.log('Physics world started!');
};

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOMPhysicsWorld };
}