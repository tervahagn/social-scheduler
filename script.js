// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.05)';
        nav.style.backdropFilter = 'blur(20px)';
        nav.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.03)';
        nav.style.backdropFilter = 'blur(12px)';
        nav.style.border = '1px solid rgba(255, 255, 255, 0.05)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
const animatedElements = document.querySelectorAll('.manifesto-card, .bento-item, .hero-content');
animatedElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    // Add staggered delay based on index or position
    // el.style.transitionDelay = `${index * 0.1}s`; 
    observer.observe(el);
});

// Mouse movement effect for gradient orbs (parallax)
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    
    if(orb1 && orb2) {
        orb1.style.transform = `translate(${mouseX * 50}px, ${mouseY * 50}px)`;
        orb2.style.transform = `translate(-${mouseX * 50}px, -${mouseY * 50}px)`;
    }
});
