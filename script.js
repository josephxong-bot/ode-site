const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

document.querySelectorAll("[data-toast]").forEach(btn => {
    btn.addEventListener("click", () => showToast(btn.getAttribute("data-toast")));
});

const form = document.getElementById("contactForm");
form?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message received. Add a backend (Formspree) to actually send emails.");
    form.reset();
});
