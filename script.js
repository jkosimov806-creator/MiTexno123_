document.addEventListener('DOMContentLoaded', () => {
    // Reveal-анимации
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => observer.observe(el));

    // Параллакс кругов
    const circles = document.querySelectorAll('.parallax-circle');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        circles.forEach((circle, i) => {
            circle.style.transform = `translateY(${scrollY * (0.1 + i * 0.05)}px)`;
        });
    });

    // Мобильное меню
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Активная ссылка при скролле
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav__link[href="#${id}"]`);
            if (link) {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                link.classList.toggle('active', scrollPos >= top && scrollPos < top + height);
            }
        });
    });
});
