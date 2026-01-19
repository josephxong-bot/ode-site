/* ===========================
   Basic Site Scripts (ODE)
   =========================== */

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Toast helper
function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;

    t.textContent = msg;
    t.classList.add("show");

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        t.classList.remove("show");
    }, 2200);
}

// Contact form (no backend yet)
const form = document.getElementById("contactForm");
form?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message received. (Add Formspree later to send emails.)");
    form.reset();
});

/* ===========================
   Shooting Stars Background
   =========================== */

(() => {
    const canvas = document.getElementById("starCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0,
        h = 0,
        dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
        w = Math.floor(window.innerWidth);
        h = Math.floor(window.innerHeight);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);

        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resize);
    resize();

    // Tiny stars
    const stars = Array.from({ length: 190 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.7 + 0.15,
        tw: Math.random() * 0.015 + 0.005,
    }));

    // Shooting stars / meteors
    const meteors = [];

    function spawnMeteor() {
        const startX = Math.random() * (w * 0.8);
        const startY = -20 - Math.random() * 220;

        const angle = Math.PI * 1.15 + Math.random() * 0.18; // down-right-ish
        const speed = 900 + Math.random() * 800; // px/sec
        const len = 180 + Math.random() * 280;

        meteors.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            len,
            life: 0,
            ttl: 0.9 + Math.random() * 0.85, // seconds
            hue: 220 + Math.random() * 65, // blue/purple
        });
    }

    let meteorTimer = 0;

    function tickMeteorSpawner(dt) {
        meteorTimer -= dt;
        if (meteorTimer <= 0) {
            // Sometimes spawn a burst of 1–3 meteors
            const burst = Math.random() < 0.22 ? 1 + Math.floor(Math.random() * 3) : 1;
            for (let i = 0; i < burst; i++) spawnMeteor();

            meteorTimer = 0.55 + Math.random() * 2.4;
        }
    }

    function drawVignette() {
        const g = ctx.createRadialGradient(
            w * 0.5,
            h * 0.35,
            0,
            w * 0.5,
            h * 0.35,
            Math.max(w, h) * 0.75
        );

        g.addColorStop(0, "rgba(40, 60, 120, 0.10)");
        g.addColorStop(0.55, "rgba(90, 40, 140, 0.07)");
        g.addColorStop(1, "rgba(0, 0, 0, 0.28)");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    }

    let last = performance.now();

    function frame(now) {
        const dt = Math.min(0.033, (now - last) / 1000);
        last = now;

        ctx.clearRect(0, 0, w, h);

        // background tint
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, 0, w, h);

        // stars twinkle
        for (const s of stars) {
            s.a += (Math.random() - 0.5) * s.tw;
            s.a = Math.max(0.08, Math.min(0.85, s.a));

            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${s.a})`;
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // meteors
        tickMeteorSpawner(dt);

        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            m.life += dt;

            m.x += m.vx * dt;
            m.y += m.vy * dt;

            const vlen = Math.hypot(m.vx, m.vy) || 1;
            const tx = -(m.vx / vlen);
            const ty = -(m.vy / vlen);

            const fade = 1 - m.life / m.ttl;
            const alpha = Math.max(0, fade);

            const x2 = m.x + tx * m.len;
            const y2 = m.y + ty * m.len;

            const grad = ctx.createLinearGradient(m.x, m.y, x2, y2);
            grad.addColorStop(0, `hsla(${m.hue}, 92%, 70%, ${0.95 * alpha})`);
            grad.addColorStop(0.35, `hsla(${m.hue}, 95%, 65%, ${0.35 * alpha})`);
            grad.addColorStop(1, `hsla(${m.hue}, 95%, 60%, 0)`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // meteor head glow
            ctx.beginPath();
            ctx.fillStyle = `hsla(${m.hue}, 95%, 78%, ${0.9 * alpha})`;
            ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
            ctx.fill();

            if (m.life >= m.ttl || m.x > w + 300 || m.y > h + 300) {
                meteors.splice(i, 1);
            }
        }

        drawVignette();
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
/* ===========================
   Background Music Toggle (Default ON)
   - Default preference = ON
   - Starts on first user interaction (browser rules)
   - Fade in/out
   =========================== */

const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

// Default ON if nothing saved
let saved = localStorage.getItem("ode_music");
if (!saved) {
    saved = "on";
    localStorage.setItem("ode_music", "on");
}

function setMusicLabel(on) {
    if (!musicBtn) return;
    musicBtn.textContent = on ? "♪ Music: On" : "♪ Music: Off";
}

function fadeTo(target, ms = 600) {
    if (!bgm) return;
    const start = bgm.volume;
    const diff = target - start;
    const steps = Math.max(10, Math.floor(ms / 16));
    let i = 0;

    const timer = setInterval(() => {
        i++;
        bgm.volume = Math.max(0, Math.min(1, start + (diff * i / steps)));
        if (i >= steps) clearInterval(timer);
    }, 16);
}

async function playMusic() {
    if (!bgm) return;
    try {
        bgm.volume = 0;
        await bgm.play();
        fadeTo(0.25, 700); // soft volume
        localStorage.setItem("ode_music", "on");
        setMusicLabel(true);
    } catch (e) {
        // Autoplay blocked until interaction
        setMusicLabel(true);
    }
}

function stopMusic() {
    if (!bgm) return;
    fadeTo(0, 500);
    setTimeout(() => bgm.pause(), 520);
    localStorage.setItem("ode_music", "off");
    setMusicLabel(false);
}

// Button toggle
musicBtn?.addEventListener("click", async () => {
    if (!bgm) return;
    const on = !bgm.paused;
    if (!on) await playMusic();
    else stopMusic();
});

// Set label on load
setMusicLabel(saved === "on");

// If default is ON, start music on FIRST user click anywhere
document.addEventListener("pointerdown", async () => {
    if (!bgm) return;
    if (localStorage.getItem("ode_music") !== "on") return;
    if (!bgm.paused) return;
    await playMusic();
}, { once: true });

// Optional: show a hint toast on first visit
if (saved === "on") {
    // small hint so user understands why no sound immediately
    setTimeout(() => {
        if (bgm && bgm.paused) showToast("Tap anywhere to enable music.");
    }, 900);
}
