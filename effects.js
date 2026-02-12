/**
 * effects.js
 * Custom lightweight physics engine for the Valentine Antigravity effect.
 */

class PhysicsWorld {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.elements = [];
        this.gravity = 0.5;
        this.friction = 0.98; // Air resistance
        this.wallBounce = 0.7; // Bounciness
        this.interactiveMode = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Mouse interaction
        this.mouse = { x: -1000, y: -1000, isDown: false };
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', () => this.mouse.isDown = true);
        window.addEventListener('mouseup', () => this.mouse.isDown = false);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    addElement(element) {
        // Convert a DOM element to a physics object
        const rect = element.getBoundingClientRect();

        // Hide the original DOM element but keep its data
        element.style.opacity = '0';

        // Create canvas representation
        const physicsObj = {
            domElement: element,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            vx: (Math.random() - 0.5) * 10, // Random initial velocity
            vy: (Math.random() - 0.5) * 10,
            rotation: 0,
            vRotation: (Math.random() - 0.5) * 0.2,
            isStatic: false,
            color: window.getComputedStyle(element).color || '#000',
            backgroundColor: window.getComputedStyle(element).backgroundColor || 'transparent',
            text: element.innerText,
            type: element.tagName.toLowerCase(),
            fontSize: window.getComputedStyle(element).fontSize,
            fontFamily: window.getComputedStyle(element).fontFamily
        };

        this.elements.push(physicsObj);
    }

    start() {
        this.loop();
    }

    update() {
        this.elements.forEach(obj => {
            if (obj.isStatic) return;

            // Apply Gravity
            obj.vy += this.gravity;
            obj.vx *= this.friction;
            obj.vy *= this.friction;

            // Update Position
            obj.x += obj.vx;
            obj.y += obj.vy;
            obj.rotation += obj.vRotation;

            // Mouse Repel/Attract (Antigravity-ish interaction)
            const dx = obj.x + obj.width / 2 - this.mouse.x;
            const dy = obj.y + obj.height / 2 - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) {
                const force = (200 - dist) / 200;
                const angle = Math.atan2(dy, dx);
                obj.vx += Math.cos(angle) * force * 2;
                obj.vy += Math.sin(angle) * force * 2;
            }

            // Floor Collision
            if (obj.y + obj.height > this.height) {
                obj.y = this.height - obj.height;
                obj.vy *= -this.wallBounce;
                obj.vx *= 0.9; // Floor friction
            }
            // Ceiling Collision
            if (obj.y < 0) {
                obj.y = 0;
                obj.vy *= -this.wallBounce;
            }
            // Wall Collision
            if (obj.x + obj.width > this.width) {
                obj.x = this.width - obj.width;
                obj.vx *= -this.wallBounce;
            }
            if (obj.x < 0) {
                obj.x = 0;
                obj.vx *= -this.wallBounce;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.elements.forEach(obj => {
            this.ctx.save();
            this.ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
            this.ctx.rotate(obj.rotation);
            this.ctx.translate(-obj.width / 2, -obj.height / 2);

            // Draw based on type
            if (obj.backgroundColor !== 'rgba(0, 0, 0, 0)' && obj.backgroundColor !== 'transparent') {
                this.ctx.fillStyle = obj.backgroundColor;
                this.ctx.roundRect ? this.ctx.roundRect(0, 0, obj.width, obj.height, 10) : this.ctx.fillRect(0, 0, obj.width, obj.height);
                this.ctx.fill();
            }

            // Text
            if (obj.text) {
                this.ctx.fillStyle = obj.color;
                this.ctx.font = `${obj.fontSize} ${obj.fontFamily}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(obj.text, obj.width / 2, obj.height / 2);
            }

            this.ctx.restore();
        });
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// Global instance
window.physicsWorld = null;

// Initialize when triggered
window.startPhysics = function () {
    console.log("Starting Physics...");
    const world = new PhysicsWorld('physics-canvas');
    window.physicsWorld = world;

    // Select elements to "drop"
    const elementsToDrop = document.querySelectorAll('#ui-layer > *');
    // We might need to split this further if we want individual buttons/words to fall
    // For now, let's just grab the container's children

    // Actually, let's create some dummy hearts to fall too
    for (let i = 0; i < 15; i++) {
        createHeart(world);
    }

    // Add UI elements
    const uiElements = document.querySelectorAll('.floating-text, .button-container button');
    uiElements.forEach(el => world.addElement(el));

    // Hide the original UI layer so we don't have duplicates
    // But wait! Buttons need to be clickable. 
    // Canvas approach makes buttons non-interactive unless we map clicks.
    // ALTERNATIVE: Use DOM-based physics (absolute positioning) to keep buttons clickable.
    // "Antigravity" usually implies DOM elements moving. 
    // Let's SWITCH STRATEGY to DOM manipulation for the "No" button functionality.

    return "Physics started";
};

// SWITCHING STRATEGY TO DOM-BASED PHYSICS TO KEEP BUTTONS CLICKABLE
// Overwriting the class above with a DOM-based one for better interaction
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
        element.style.margin = '0'; // clear margins to avoid offsets
        element.style.transform = 'translate(0, 0)'; // reset transforms

        // Physics properties attached to DOM element
        element.physics = {
            x: rect.left,
            y: rect.top,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15, // Boom! Explosion effect initially?
            width: rect.width,
            height: rect.height,
            rotation: 0,
            vRotation: (Math.random() - 0.5) * 5
        };

        this.elements.push(element);
    }

    createParticle(x, y, char) {
        const el = document.createElement('div');
        el.innerText = char || '💖';
        el.style.position = 'absolute';
        el.style.fontSize = Math.random() * 20 + 20 + 'px';
        el.style.userSelect = 'none';
        el.style.zIndex = '1';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        this.addDOMElement(el);
    }

    start() {
        if (this.loopId) return;
        this.loop();
    }

    loop() {
        this.elements.forEach(el => {
            const p = el.physics;

            // Gravity
            p.vy += this.gravity;
            p.vx *= this.friction;
            p.vy *= this.friction;

            // Position Update
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.vRotation * 0.9;

            // Mouse Repel
            const dx = (p.x + p.width / 2) - this.mouse.x;
            const dy = (p.y + p.height / 2) - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 1500;
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
            const scale = (typeof p.scale !== 'undefined') ? p.scale : 1;
            el.style.transform = `rotate(${p.rotation}deg) scale(${scale})`;
        });

        this.loopId = requestAnimationFrame(() => this.loop());
    }
}

// Redefine startPhysics to use the DOM version
window.startPhysics = function () {
    const world = new DOMPhysicsWorld();
    window.physicsWorld = world; // Expose to window

    // Get elements
    const title = document.querySelector('.floating-text');
    const container = document.querySelector('.button-container');
    const bg = document.getElementById('main-content');

    // We need to modify the DOM slightly to make them absolute without breaking layout immediately
    // 1. Tag exciting elements
    // 2. Add random decorative elements

    // Add 20 random hearts
    for (let i = 0; i < 20; i++) {
        world.createParticle(Math.random() * window.innerWidth, -Math.random() * 500, ['💖', '🌸', '✨', '💌'][Math.floor(Math.random() * 4)]);
    }

    // Drop the title
    if (title) world.addDOMElement(title);

    // Drop buttons? 
    // The "No" button has its own logic (runaway). 
    // If we apply physics to it, it might conflict with the runaway logic.
    // Strategy: Apply physics ONLY to title and decoration. 
    // "Yes" and "No" buttons should stay floating or have a different customized "float" behavior, 
    // OR we drop them and then the "No" button 'jumps' when hovered.

    // Let's drop the buttons too for the chaos effect!
    // We just need to ensure the mouseover event still works.
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.id !== 'start-btn') { // Don't drop start button as it's gone
            world.addDOMElement(btn);
        }
    });

    world.start();
};
