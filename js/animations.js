// Premium GSAP Animations
class PremiumAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize Lenis smooth scrolling
        this.initSmoothScroll();
        
        // Initialize GSAP animations
        this.initGSAPAnimations();
        
        // Initialize scroll triggers
        this.initScrollTriggers();
        
        // Initialize interactive elements
        this.initInteractiveElements();
        
        // Start animations
        this.startAnimations();
    }
    
    initSmoothScroll() {
        // Lenis smooth scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
        
        lenis.on('scroll', (e) => {
            // Scroll progress handling
        });
        
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        
        requestAnimationFrame(raf);
    }
    
    initGSAPAnimations() {
        // Hero section animations
        gsap.fromTo('.hero-content', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        );
        
        // Hero badges and buttons
        gsap.fromTo('.hero-badge, .btn-primary, .btn-secondary',
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                stagger: 0.1,
                ease: 'power2.out'
            }
        );
        
        // Hero stats
        gsap.fromTo('.stat-item',
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.6, 
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }
        );
        
        // Cards animation on scroll
        gsap.utils.toArray('.card, .service-card, .process-step').forEach((card, index) => {
            gsap.fromTo(card,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
        
        // Form elements animation
        gsap.fromTo('.form-group',
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.contact-form',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
    
    initScrollTriggers() {
        // Process timeline items
        gsap.utils.toArray('.process-step').forEach((step, index) => {
            gsap.fromTo(step,
                { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: step,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
        
        // Feature items
        gsap.utils.toArray('.feature-item').forEach((feature, index) => {
            gsap.fromTo(feature,
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: 'back.out(1.2)',
                    scrollTrigger: {
                        trigger: '.service-features',
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    }
    
    initInteractiveElements() {
        // Card hover effects
        const cards = document.querySelectorAll('.card, .service-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
        
        // Button click effects
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .submit-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                gsap.to(button, {
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'power2.in',
                    yoyo: true,
                    repeat: 1,
                    onStart: () => {
                        button.style.transform = 'scale(0.95)';
                    },
                    onReverseComplete: () => {
                        button.style.transform = 'scale(1)';
                    }
                });
            });
        });
        
        // Form submission
        const form = document.querySelector('.contact-form form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Form validation and submission animation
                gsap.to(form, {
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'power2.in',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        console.log('Form submitted successfully!');
                        // Here you would handle the actual form submission
                    }
                });
            });
        }
    }
    
    startAnimations() {
        console.log('🚀 Premium animations started successfully!');
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Initialize analytics
        this.trackUserInteractions();
    }
    
    startPerformanceMonitoring() {
        // Monitor animation performance
        let frames = 0;
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                console.log(`Animation FPS: ${frames}`);
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    trackUserInteractions() {
        // Track user interactions for analytics
        let interactionCount = 0;
        
        document.addEventListener('click', (e) => {
            interactionCount++;
            
            if (interactionCount % 10 === 0) {
                console.log(`User interactions: ${interactionCount}`);
            }
        });
    }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PremiumAnimations();
});