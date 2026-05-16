document.addEventListener('DOMContentLoaded', () => {

    // ===== Intersection Observer для reveal-анимаций =====
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));

    // ===== Параллакс кругов в hero =====
    const circles = document.querySelectorAll('.parallax-circle');
    if (circles.length) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            circles.forEach((circle, index) => {
                const speed = 0.1 + index * 0.05;
                const yOffset = scrollY * speed;
                circle.style.transform = `translateY(${yOffset}px)`;
            });
        });
    }

    // ===== Мобильное меню =====
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== Активная ссылка при скролле (опционально) =====
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav__link[href="#${id}"]`);
            if (link) {
                const offsetTop = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollPos >= offsetTop && scrollPos < offsetTop + height) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    });

});
