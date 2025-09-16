// Language Switcher Functionality
class LanguageSwitcher {
    constructor() {
        this.currentLang = 'en';
        this.langButtons = document.querySelectorAll('.lang-btn');
        this.init();
    }

    init() {
        this.langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetLang = e.currentTarget.dataset.lang;
                this.switchLanguage(targetLang);
            });
        });

        // Set initial language
        this.switchLanguage('en');
    }

    switchLanguage(lang) {
        if (this.currentLang === lang) return; // Avoid unnecessary switching
        
        this.currentLang = lang;
        
        // Update active button with animation
        this.langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            }
        });

        // Animate text changes with fade and gradient effects
        this.animateLanguageChange(lang);

        // Update document language
        document.documentElement.lang = lang;
    }

    animateLanguageChange(lang) {
        const translatableElements = document.querySelectorAll('[data-en]');
        const animationDuration = 400;
        let animationsCompleted = 0;
        
        // Create fade and gradient animation for each element
        translatableElements.forEach((element, index) => {
            const translation = element.dataset[lang];
            if (!translation) return;
            
            // Create a temporary gradient overlay
            const gradientOverlay = document.createElement('div');
            gradientOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, 
                    rgba(198, 105, 2, 0.1), 
                    rgba(2, 145, 119, 0.1),
                    rgba(254, 78, 1, 0.1)
                );
                opacity: 0;
                pointer-events: none;
                border-radius: inherit;
                transition: opacity 0.3s ease;
                z-index: 1;
            `;
            
            // Ensure element has position context
            const originalPosition = getComputedStyle(element).position;
            if (originalPosition === 'static') {
                element.style.position = 'relative';
            }
            
            element.appendChild(gradientOverlay);
            
            // Stagger the animations slightly
            setTimeout(() => {
                // Fade out phase
                element.style.transition = `opacity ${animationDuration/2}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${animationDuration/2}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                element.style.opacity = '0.3';
                element.style.transform = 'translateY(-5px)';
                gradientOverlay.style.opacity = '1';
                
                setTimeout(() => {
                    // Change text content
                    element.textContent = translation;
                    
                    // Fade in phase
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    gradientOverlay.style.opacity = '0';
                    
                    setTimeout(() => {
                        // Clean up
                        element.style.transition = '';
                        if (originalPosition === 'static') {
                            element.style.position = '';
                        }
                        gradientOverlay.remove();
                        
                        animationsCompleted++;
                        if (animationsCompleted === translatableElements.length) {
                            this.onLanguageChangeComplete(lang);
                        }
                    }, animationDuration/2);
                    
                }, animationDuration/2);
                
            }, index * 30); // Stagger by 30ms per element
        });
    }
    
    onLanguageChangeComplete(lang) {
        // Add a brief flash effect to the page
        const flashOverlay = document.createElement('div');
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, 
                rgba(198, 105, 2, 0.05), 
                rgba(2, 145, 119, 0.05),
                rgba(254, 78, 1, 0.05)
            );
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(flashOverlay);
        
        setTimeout(() => {
            flashOverlay.style.opacity = '1';
            setTimeout(() => {
                flashOverlay.style.opacity = '0';
                setTimeout(() => flashOverlay.remove(), 300);
            }, 100);
        }, 10);
        
        // Language switched successfully
    }
}

// Video Gallery Functionality
class VideoGallery {
    constructor() {
        this.splide = null;
        this.videos = [];
        this.init();
    }

    init() {
        this.initSplide();
        this.initVideoControls();
    }

    initSplide() {
        const isMobile = window.innerWidth <= 768;
        
        this.splide = new Splide('#video-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: isMobile ? '1rem' : '2rem',
            autoplay: true,
            interval: 8000,
            pauseOnHover: true,
            pauseOnFocus: true,
            resetProgress: false,
            arrows: !isMobile,
            pagination: true,
            cover: true,
            height: isMobile ? '450px' : '500px',
            width: '100%',
            focus: 'center',
            fixedWidth: false,
            rewind: true,
            breakpoints: {
                768: {
                    arrows: false,
                    gap: '0.5rem',
                    width: '100%'
                },
                480: {
                    arrows: false,
                    gap: '0.25rem',
                    width: '100%'
                }
            }
        });

        this.splide.on('moved', () => {
            this.pauseAllVideos();
        });

        this.splide.mount();
    }

    initVideoControls() {
        const videoContainers = document.querySelectorAll('.video-container');
        
        videoContainers.forEach((container, index) => {
            const video = container.querySelector('.gallery-video');
            const playPauseBtn = container.querySelector('.play-pause-btn');
            const volumeSlider = container.querySelector('.volume-slider');
            const volumeIcon = container.querySelector('.volume-icon');
            const progressSlider = container.querySelector('.progress-slider');
            const volumeControl = container.querySelector('.volume-control');
            const fullscreenBtn = container.querySelector('.fullscreen-btn');

            if (!video) return;

            this.videos.push({
                element: video,
                container: container,
                playPauseBtn: playPauseBtn,
                volumeSlider: volumeSlider,
                volumeIcon: volumeIcon,
                progressSlider: progressSlider,
                volumeControl: volumeControl,
                fullscreenBtn: fullscreenBtn
            });

            // Set initial video state
            video.muted = false;
            video.volume = 0.5;
            video.pause();
            
            // Force load metadata for server compatibility
            video.load();
            
            // Update sliders to match initial values
            volumeSlider.value = 0.5;
            progressSlider.value = 0;
            volumeIcon.textContent = '🔉';
            
            // Handle video loading errors
            video.addEventListener('error', (e) => {
                // Try to reload video once
                if (!video.dataset.retried) {
                    video.dataset.retried = 'true';
                    setTimeout(() => {
                        video.load();
                    }, 1000);
                }
            });
            
            // Handle when video can start playing
            video.addEventListener('canplay', () => {
                // Video is ready to play
                video.style.opacity = '1';
            });
            
            // Initially set video slightly transparent until it loads
            video.style.opacity = '0.8';

            // Play/Pause functionality
            playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause(video, playPauseBtn);
            });

            // Volume control
            volumeSlider.addEventListener('input', (e) => {
                this.updateVolume(video, volumeSlider, volumeIcon, e.target.value);
            });

            // Progress control
            progressSlider.addEventListener('input', (e) => {
                const time = (e.target.value / 100) * video.duration;
                video.currentTime = time;
            });

            // Volume icon click to toggle volume control visibility
            volumeIcon.addEventListener('click', () => {
                volumeControl.classList.toggle('active');
            });

            // Hide volume slider when clicking outside
            document.addEventListener('click', (e) => {
                if (!volumeControl.contains(e.target)) {
                    volumeControl.classList.remove('active');
                }
            });

            // Fullscreen functionality
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen(video);
            });

            // Video click to play/pause
            video.addEventListener('click', () => {
                this.togglePlayPause(video, playPauseBtn);
            });

            // Video ended event
            video.addEventListener('ended', () => {
                playPauseBtn.textContent = '▶️';
                video.currentTime = 0;
            });

            // Pause other videos when one starts playing
            video.addEventListener('play', () => {
                this.pauseOtherVideos(video);
                // Stop autoplay when video is playing
                if (this.splide && this.splide.Components.Autoplay) {
                    this.splide.Components.Autoplay.pause();
                }
            });

            // Resume autoplay when video is paused
            video.addEventListener('pause', () => {
                if (this.splide && this.splide.Components.Autoplay) {
                    this.splide.Components.Autoplay.play();
                }
            });

            // Update progress bar during playback
            video.addEventListener('timeupdate', () => {
                if (video.duration) {
                    const progress = (video.currentTime / video.duration) * 100;
                    progressSlider.value = progress;
                }
            });

            // Reset progress when video loads
            video.addEventListener('loadedmetadata', () => {
                progressSlider.value = 0;
            });
        });
    }

    togglePlayPause(video, playPauseBtn) {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = '⏸️';
        } else {
            video.pause();
            playPauseBtn.textContent = '▶️';
        }
    }

    updateVolume(video, volumeSlider, volumeIcon, value) {
        const volume = parseFloat(value);
        video.volume = volume;
        
        if (volume === 0) {
            video.muted = true;
            volumeIcon.textContent = '🔇';
        } else {
            video.muted = false;
            if (volume < 0.5) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        }
    }

    pauseOtherVideos(currentVideo) {
        this.videos.forEach(videoObj => {
            if (videoObj.element !== currentVideo && !videoObj.element.paused) {
                videoObj.element.pause();
                videoObj.playPauseBtn.textContent = '▶️';
            }
        });
    }

    pauseAllVideos() {
        this.videos.forEach(videoObj => {
            if (!videoObj.element.paused) {
                videoObj.element.pause();
                videoObj.playPauseBtn.textContent = '▶️';
            }
        });
    }

    toggleFullscreen(video) {
        if (document.fullscreenElement) {
            // Exit fullscreen
            document.exitFullscreen();
        } else {
            // Enter fullscreen
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        }
    }
}

// Smooth Scrolling for Navigation Links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Intersection Observer for Animations
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        document.querySelectorAll('.character, .course-card, .service-card, .social-btn').forEach(el => {
            observer.observe(el);
        });
    }
}

// Header Scroll Effect
class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                this.header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                this.header.style.boxShadow = 'none';
            }
        });
    }
}

// Mobile Menu Functionality
class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.nav = document.querySelector('.nav');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (this.menuBtn && this.nav) {
            // Set initial nav state based on screen size
            this.initNavState();
            
            this.menuBtn.addEventListener('click', () => {
                this.toggleMenu();
            });

            // Close menu when clicking nav links (only on mobile)
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMenu();
                    }
                });
            });

            // Reset nav state on window resize
            window.addEventListener('resize', () => {
                this.initNavState();
                if (window.innerWidth > 768) {
                    this.closeMenu();
                }
            });

            // Close menu when clicking outside (only on mobile)
            document.addEventListener('click', (e) => {
                if (this.isOpen && window.innerWidth <= 768 && !this.nav.contains(e.target) && !this.menuBtn.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }
    
    initNavState() {
        if (window.innerWidth > 768) {
            // Desktop: always show navigation
            this.nav.style.display = 'flex';
            this.nav.classList.remove('open');
            this.menuBtn.classList.remove('active');
            this.isOpen = false;
        } else {
            // Mobile: hide navigation by default
            if (!this.isOpen) {
                this.nav.style.display = 'none';
            }
        }
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        if (window.innerWidth <= 768) {
            this.nav.style.display = 'flex';
            // Force reflow to ensure the element is rendered
            this.nav.offsetHeight;
        }
        this.nav.classList.add('open');
        this.menuBtn.classList.add('active');
        this.isOpen = true;
    }

    closeMenu() {
        if (window.innerWidth <= 768) {
            // Only close menu on mobile
            this.nav.classList.remove('open');
            this.menuBtn.classList.remove('active');
            this.isOpen = false;
            // Hide the nav after transition completes
            setTimeout(() => {
                if (!this.isOpen) {
                    this.nav.style.display = 'none';
                }
            }, 400);
        } else {
            // On desktop, just ensure proper state
            this.nav.classList.remove('open');
            this.menuBtn.classList.remove('active');
            this.isOpen = false;
            this.nav.style.display = 'flex';
        }
    }
}

// Form Handling (if needed for future forms)
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        // Contact form handling
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                this.showMessage('Message sent successfully!', 'success');
            }, 2000);
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--teal)' : 'var(--primary-orange)'};
            color: white;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Lazy Loading for Images
class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Before/After Gallery Functionality
class BeforeAfterGallery {
    constructor() {
        this.splide = null;
        this.init();
    }

    init() {
        this.initSplide();
    }

    initSplide() {
        const carousel = document.getElementById('before-after-carousel');
        if (!carousel) {
            return;
        }

        const isMobile = window.innerWidth <= 768;
        
        this.splide = new Splide('#before-after-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: isMobile ? '1rem' : '2rem',
            autoplay: true,
            interval: 6000,
            pauseOnHover: true,
            pauseOnFocus: true,
            resetProgress: false,
            arrows: !isMobile,
            pagination: true,
            cover: false,
            height: 'auto',
            width: '100%',
            focus: 'center',
            fixedWidth: false,
            rewind: true,
            breakpoints: {
                768: {
                    arrows: false,
                    gap: '0.5rem',
                    width: '100%'
                },
                480: {
                    arrows: false,
                    gap: '0.25rem',
                    width: '100%'
                }
            }
        });

        this.splide.mount();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new LanguageSwitcher();
    new VideoGallery();
    new BeforeAfterGallery();
    new SmoothScroll();
    new AnimationObserver();
    new HeaderScroll();
    new MobileMenu();
    new FormHandler();
    new LazyLoader();

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .animate-in {
            animation: fadeInUp 0.6s ease-out;
        }

        .hamburger {
            display: none !important;
        }

        @media (max-width: 768px) {
            .hamburger {
                display: block !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Everything loaded successfully
});

// Handle page visibility changes (pause videos when page is not visible)
document.addEventListener('visibilitychange', () => {
    const videos = document.querySelectorAll('.gallery-video');
    
    if (document.hidden) {
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
                // Store that this video was playing
                video.dataset.wasPlaying = 'true';
            }
        });
    } else {
        videos.forEach(video => {
            if (video.dataset.wasPlaying === 'true') {
                video.play();
                video.dataset.wasPlaying = 'false';
            }
        });
    }
});

// Error handling for videos
document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('.gallery-video');
    
    videos.forEach(video => {
        video.addEventListener('error', (e) => {
            console.warn('Video failed to load:', video.src);
            // Hide the video container or show a placeholder
            const container = video.closest('.video-container');
            if (container) {
                container.style.display = 'none';
            }
        });
    });
});
