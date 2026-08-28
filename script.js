/* ════════════════════════════════════════════════════════════════
   COLOURFUL MOUSE-TRAILING CANVAS
   Ported from AURA dashboard hero-designali.tsx
   Smooth bezier curve trails that follow the cursor, cycling
   through the full HSL colour wheel with lighter blend mode.
════════════════════════════════════════════════════════════════ */
(function () {
    const canvas = document.getElementById('trailCanvas');
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    ctx.running = true;
    ctx.frame = 1;

    // Config (mirrors AURA E object)
    const E = { friction: 0.5, trails: 80, size: 50, dampening: 0.025, tension: 0.99 };


    // Mouse / touch position
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Node constructor
    function Node() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; }

    // Line (trail) constructor
    function Line(spring) {
        this.spring = spring + 0.1 * Math.random() - 0.05;
        this.friction = E.friction + 0.01 * Math.random() - 0.005;
        this.nodes = [];
        for (let i = 0; i < E.size; i++) {
            const n = new Node();
            n.x = pos.x; n.y = pos.y;
            this.nodes.push(n);
        }
    }
    Line.prototype.update = function () {
        let e = this.spring, t = this.nodes[0];
        t.vx += (pos.x - t.x) * e;
        t.vy += (pos.y - t.y) * e;
        for (let i = 0; i < this.nodes.length; i++) {
            t = this.nodes[i];
            if (i > 0) {
                const n = this.nodes[i - 1];
                t.vx += (n.x - t.x) * e;
                t.vy += (n.y - t.y) * e;
                t.vx += n.vx * E.dampening;
                t.vy += n.vy * E.dampening;
            }
            t.vx *= this.friction;
            t.vy *= this.friction;
            t.x += t.vx;
            t.y += t.vy;
            e *= E.tension;
        }
    };
    Line.prototype.draw = function () {
        let n = this.nodes[0].x, i = this.nodes[0].y;
        ctx.beginPath();
        ctx.moveTo(n, i);
        for (let a = 1; a < this.nodes.length - 2; a++) {
            const e = this.nodes[a], t = this.nodes[a + 1];
            n = 0.5 * (e.x + t.x);
            i = 0.5 * (e.y + t.y);
            ctx.quadraticCurveTo(e.x, e.y, n, i);
        }
        const la = this.nodes.length - 2;
        ctx.quadraticCurveTo(
            this.nodes[la].x, this.nodes[la].y,
            this.nodes[la + 1].x, this.nodes[la + 1].y
        );
        ctx.stroke();
        ctx.closePath();
    };

    // ── Colour timing ──────────────────────────────────────────
    // Red (hue 0) holds for RED_HOLD ms extra at the start of every cycle,
    // then the full 360° wheel plays over CYCLE_MS ms. Repeats continuously.
    const RED_HOLD = 3000;   // ms red lingers extra
    const CYCLE_MS = 15000;  // ms for the full colour wheel after red
    const TOTAL    = RED_HOLD + CYCLE_MS; // 18 000 ms per loop
    let cycleStart = null;

    function currentHue(ts) {
        if (cycleStart === null) cycleStart = ts;
        const elapsed = (ts - cycleStart) % TOTAL;
        if (elapsed < RED_HOLD) return 0;                                   // red
        return ((elapsed - RED_HOLD) / CYCLE_MS) * 360;                    // 0→360
    }
    // ────────────────────────────────────────────────────────────

    let lines = [];
    function initLines() {
        lines = [];
        for (let i = 0; i < E.trails; i++) {
            lines.push(new Line(0.45 + (i / E.trails) * 0.025));
        }
    }

    function render(ts) {
        if (!ctx.running) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        const hue = Math.round(currentHue(ts));
        ctx.strokeStyle = `hsla(${hue},100%,50%,0.025)`;
        ctx.lineWidth = 10;

        for (const line of lines) { line.update(); line.draw(); }
        ctx.frame++;
        requestAnimationFrame(render);
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Start on first mouse/touch move
    let started = false;
    function onFirst(e) {
        if (started) return;
        started = true;
        initLines();
        requestAnimationFrame(render); // rAF always passes a proper timestamp
        document.removeEventListener('mousemove', onFirst);
        document.removeEventListener('touchstart', onFirst);
    }
    function onMove(e) {
        if (e.touches) { pos.x = e.touches[0].clientX; pos.y = e.touches[0].clientY; }
        else           { pos.x = e.clientX;             pos.y = e.clientY;             }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('mousemove', onFirst,  { passive: true });
    document.addEventListener('touchstart', onFirst, { passive: true });
    document.addEventListener('mousemove', onMove,   { passive: true });
    document.addEventListener('touchmove', onMove,   { passive: true });
    window.addEventListener('focus', () => { ctx.running = true; requestAnimationFrame(render); });
    window.addEventListener('blur',  () => { ctx.running = false; });
})();


// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Smooth Scroll for Navigation Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Copy Email Utility
function copyEmail() {
    const email = 'vanteddujagruth2406@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
        const btn = document.getElementById('copyEmailBtn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            btn.style.background = '#10b981';
            btn.style.borderColor = '#10b981';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.borderColor = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy email: ', err);
    });
}
