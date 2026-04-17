document.addEventListener("DOMContentLoaded", () => {
    // Highlight nav links based on scroll position.
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const linkById = new Map(navLinks.map((link) => [link.getAttribute('href')?.slice(1), link]));

    const sectionIds = ["hero", "about", "skills", "projects", "contact"];
    const observedSections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if (observedSections.length && navLinks.length) {
        const ratios = new Map(observedSections.map((section) => [section.id, 0]));
        const intersecting = new Set();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    ratios.set(entry.target.id, entry.intersectionRatio);
                    if (entry.isIntersecting) intersecting.add(entry.target.id);
                    else intersecting.delete(entry.target.id);
                });

                let id = null;
                let bestRatio = 0;
                intersecting.forEach((candidateId) => {
                    const ratio = ratios.get(candidateId) ?? 0;
                    if (ratio > bestRatio) {
                        bestRatio = ratio;
                        id = candidateId;
                    }
                });

                if (!id) return;

                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    link.removeAttribute("aria-current");
                });

                const activeLink = linkById.get(id);
                if (activeLink) {
                    activeLink.classList.add("active");
                    activeLink.setAttribute("aria-current", "page");
                }
            },
            {
                root: null,
                // Account for sticky nav and pick the section that is mostly in view.
                rootMargin: "-30% 0px -55% 0px",
                threshold: [0.15, 0.35, 0.55, 0.75],
            }
        );

        observedSections.forEach((section) => observer.observe(section));
    }

    // Formspree AJAX Submission
    const form = document.querySelector('.contact-form');
    const msg = document.getElementById('form-msg');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = 'Sending...';
            btn.disabled = true;
            msg.textContent = '';
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    msg.style.color = '#34c759'; // Success green
                    msg.textContent = 'Message sent successfully!';
                    form.reset();
                } else {
                    msg.style.color = '#ff3b30'; // Error red
                    msg.textContent = 'Oops! There was a problem sending your message.';
                }
            } catch (error) {
                msg.style.color = '#ff3b30';
                msg.textContent = 'Oops! Network error.';
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                setTimeout(() => {
                    msg.textContent = '';
                }, 4000);
            }
        });
    }
});
