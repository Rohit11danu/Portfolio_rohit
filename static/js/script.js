// Immediately invoked function since script is at end of body
(function initApp() {

    /* ==========================================================================
       CUSTOM MOUSE CURSOR
       ========================================================================== */
    const cursorGlow = document.getElementById('cursor-glow');
    
    // Only enable custom cursor on non-touch devices
    if(window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });

        // Expand glow on clickable elements
        const clickables = document.querySelectorAll('a, button, .skill-tag, .project-card, .menu-toggle');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorGlow.style.width = '100px';
                cursorGlow.style.height = '100px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(0, 245, 255, 0.3) 0%, rgba(0,0,0,0) 70%)';
            });
            el.addEventListener('mouseleave', () => {
                cursorGlow.style.width = '300px';
                cursorGlow.style.height = '300px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(123, 44, 191, 0.15) 0%, rgba(0,0,0,0) 70%)';
            });
        });
    } else {
        cursorGlow.style.display = 'none';
    }

    /* ==========================================================================
       CANVAS STARFIELD ANIMATION
       ========================================================================== */
    const canvas = document.getElementById('starfieldCanvas');
    const ctx = canvas.getContext('2d');
    
    let w, h;
    let stars = [];
    const maxStars = 200;

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.z = Math.random() * w; // Depth for parallax
            this.size = Math.random() * 1.5;
            this.speed = (Math.random() * 0.2) + 0.05;
            this.opacity = (Math.random() * 0.5) + 0.5;
        }

        update(scrollOffset) {
            // Constant vertical drift
            this.y -= this.speed;
            
            // Parallax effect based on scroll
            const parallaxY = scrollOffset * (this.size / 5);
            const drawY = (this.y - parallaxY) % h;
            const finalY = drawY < 0 ? drawY + h : drawY;

            if (this.y < 0) this.y = h;
            
            return { x: this.x, y: finalY };
        }

        draw(pos) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
            // Flicker effect
            const flicker = this.opacity * ((Math.random() * 0.2) + 0.8);
            ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
            ctx.fill();
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * (h / 2);
            this.len = (Math.random() * 80) + 10;
            this.speed = (Math.random() * 10) + 5;
            this.active = false;
        }

        spawn() {
            this.x = Math.random() * w;
            this.y = Math.random() * (h / 2);
            this.active = true;
        }

        update() {
            if (!this.active) return;
            this.x -= this.speed;
            this.y += this.speed;
            if (this.x < -this.len || this.y > h + this.len) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active) return;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.len, this.y - this.len);
            ctx.stroke();
        }
    }

    let shootingStars = [new ShootingStar(), new ShootingStar()];

    function initStars() {
        stars = [];
        for (let i = 0; i < maxStars; i++) {
            stars.push(new Star());
        }
    }

    function animateStars() {
        ctx.clearRect(0, 0, w, h);
        
        const scrollOffset = window.scrollY;

        stars.forEach(star => {
            const pos = star.update(scrollOffset);
            star.draw(pos);
        });

        shootingStars.forEach(ss => {
            if (!ss.active && Math.random() < 0.005) ss.spawn();
            ss.update();
            ss.draw();
        });

        // Connect nearby stars with lines to form constellations occasionally
        connectStars(scrollOffset);

        requestAnimationFrame(animateStars);
    }

    function connectStars(scrollOffset) {
        // Find a few stars to connect to make constellations
        for(let i=0; i < stars.length; i+=15) {
            for(let j=i+5; j < stars.length; j+=15) {
                const posI = stars[i].update(scrollOffset);
                const posJ = stars[j].update(scrollOffset);
                
                let dx = posI.x - posJ.x;
                let dy = posI.y - posJ.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 245, 255, ${0.08 - distance/1500})`;
                    ctx.lineWidth = 0.4;
                    ctx.moveTo(posI.x, posI.y);
                    ctx.lineTo(posJ.x, posJ.y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initStars();
    });

    resizeCanvas();
    initStars();
    animateStars();

    /* ==========================================================================
       ADVANCED TYPING EFFECT FOR HERO SUBTITLE
       ========================================================================== */
    const roles = ["Software Developer", "Problem Solver", "AI Enthusiast", "System Architect"];
    const typeElement = document.querySelector('.type-effect');
    let roleIndex = 0;
    let roleCharIndex = 0;
    let isDeleting = false;

    function advancedTypeWriter() {
        if (!typeElement) return;
        
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typeElement.textContent = currentRole.substring(0, roleCharIndex - 1);
            roleCharIndex--;
        } else {
            typeElement.textContent = currentRole.substring(0, roleCharIndex + 1);
            roleCharIndex++;
        }

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && roleCharIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && roleCharIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Pause before typing next
        }

        setTimeout(advancedTypeWriter, typeSpeed);
    }
    
    document.head.insertAdjacentHTML('beforeend', '<style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }</style>');

    setTimeout(advancedTypeWriter, 1000);

    /* ==========================================================================
       HERO MOUSE PARALLAX
       ========================================================================== */
    const heroSection = document.querySelector('.hero');
    const parallaxElements = document.querySelectorAll('.hero-visual, .hero-text');
    
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;

            parallaxElements.forEach(el => {
                const speed = el.getAttribute('data-speed') || 1;
                const xPos = x * speed;
                const yPos = y * speed;
                el.style.transform = `translate(${xPos}px, ${yPos}px)`;
            });
        });
        
        // Reset on leave
        heroSection.addEventListener('mouseleave', () => {
            parallaxElements.forEach(el => {
                el.style.transform = `translate(0px, 0px)`;
                el.style.transition = 'transform 0.5s ease';
            });
        });
        
        // Remove transition during mousemove for instant follow
        heroSection.addEventListener('mouseenter', () => {
            parallaxElements.forEach(el => {
                el.style.transition = 'none';
            });
        });
    }

    /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Animate hamburger to X
        const bars = mobileMenu.querySelectorAll('.bar');
        mobileMenu.classList.toggle('is-active');
        if(mobileMenu.classList.contains('is-active')){
            bars[0].style.transform = 'translateY(7px) rotate(45deg)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenu.classList.remove('is-active');
            const bars = mobileMenu.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    /* ==========================================================================
       ABOUT ME: TYPING BIO & TELEMETRY
       ========================================================================== */
    const bioLines = [
        "> INITIALIZING PROFILE SEQUENCE...",
        "I am Rohit Singh Danu, a Computer Science student and software developer navigating the vast universe of intelligent systems. My mission is to build practical, efficient software that solves real-world problems.",
        "My technical journey ranges from crafting robust Java-based architectures to exploring the cutting edge of machine learning and image processing. I see every line of code as finding the right coordinates to a better solution.",
        "Equipped with adaptability and a relentless problem-solving mindset, my goal is to keep learning and creating technology that is truly impactful. When I am not charting new algorithms, I am refining my logic cores.",
        "> STATUS: Systems fully operational. Always ready to board the next challenging mission."
    ];
    
    const bioContainer = document.getElementById('profileBio');
    let lineIndex = 0;
    let charIndex = 0;

    function typeBio() {
        if (!bioContainer) return;
        
        // Clear placeholder on first run
        if (lineIndex === 0 && charIndex === 0) {
            bioContainer.innerHTML = '';
        }

        if (lineIndex < bioLines.length) {
            if (charIndex === 0) {
                const p = document.createElement('p');
                p.id = `line-${lineIndex}`;
                bioContainer.appendChild(p);
            }

            const currentLine = document.getElementById(`line-${lineIndex}`);
            currentLine.innerHTML += bioLines[lineIndex].charAt(charIndex);
            charIndex++;

            if (charIndex >= bioLines[lineIndex].length) {
                lineIndex++;
                charIndex = 0;
                setTimeout(typeBio, 500); // Pause between lines
            } else {
                setTimeout(typeBio, 20); // Typing speed
            }
        }
    }

    // Uptime Counter
    const uptimeElement = document.getElementById('uptimeCounter');
    let startTime = Date.now();

    function updateUptime() {
        if (!uptimeElement) return;
        const diff = Date.now() - startTime;
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        uptimeElement.innerText = `${hours}h ${mins}m ${secs}s`;
        setTimeout(updateUptime, 1000);
    }

    // Intersection Observer for Bio Typing
    const bioObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            typeBio();
            updateUptime();
            bioObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });

    if (bioContainer) {
        bioObserver.observe(bioContainer);
    }

    /* ==========================================================================
       SCROLL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade');
    
    const revealOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px 50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Failsafe: if elements take too long to reveal (e.g observer fails), force reveal them
    setTimeout(() => {
        revealElements.forEach(el => el.classList.add('active'));
    }, 1500);

    /* ==========================================================================
       NUMBER COUNTER ANIMATION
       ========================================================================== */
    const stats = document.querySelectorAll('.stat-number');
    let counted = false;

    const statObserver = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !counted) {
            counted = true;
            stats.forEach(stat => {
                const target = +stat.getAttribute('data-target');
                const duration = 2000; // ms
                const increment = target / (duration / 16); // 60fps
                
                let current = 0;
                const updateCount = () => {
                    current += increment;
                    if(current < target) {
                        stat.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.innerText = target + "+";
                    }
                };
                updateCount();
            });
        }
    }, { threshold: 0.5 });
    
    if(stats.length > 0) {
        statObserver.observe(document.querySelector('.about-stats'));
    }

    /* ==========================================================================
       PROJECT FILTERING
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'flex';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    /* ==========================================================================
       PROJECT CLICK HANDLING
       ========================================================================== */
    projectItems.forEach(card => {
        card.addEventListener('click', (e) => {
            // If the user clicked a specific link within the card, let that handle it
            if (e.target.closest('.project-link')) return;
            
            // Otherwise, open the first link in the card (usually the Live link)
            const primaryLink = card.querySelector('.project-link');
            if (primaryLink) {
                window.open(primaryLink.href, '_blank');
            }
        });
    });

    /* ==========================================================================
       NAVBAR SCROLL EFFECT & BACK TO TOP
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.5rem 2rem';
            navbar.style.background = 'rgba(3, 3, 10, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.padding = '1rem 2rem';
            navbar.style.background = 'rgba(3, 3, 10, 0.7)';
            navbar.style.boxShadow = 'none';
        }

        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    /* ==========================================================================
       EASTER EGG
       ========================================================================== */
    const planet = document.querySelector('.planet');
    const easterEgg = document.getElementById('easter-egg');
    const closeEgg = document.getElementById('close-easter-egg');

    if (planet) {
        planet.addEventListener('click', () => {
            easterEgg.classList.add('active');
        });
        planet.style.cursor = 'pointer';
    }

    if (closeEgg) {
        closeEgg.addEventListener('click', () => {
            easterEgg.classList.remove('active');
        });
    }

    /* ==========================================================================
       FORM SUBMISSION PREVENT (Demo)
       ========================================================================== */
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>Transmission Sent! <i class="fas fa-check"></i></span>';
            btn.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                form.reset();
            }, 3000);
        });
    }

    /* ==========================================================================
       STELLAR TRAJECTORY PROGRESS
       ========================================================================== */
    const trajectoryPath = document.querySelector('.orbital-path');
    const pathProgress = document.getElementById('pathProgress');
    
    function updateTrajectory() {
        if (!trajectoryPath || !pathProgress) return;
        
        const rect = trajectoryPath.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the path is visible/scrolled
        // Start filling when the top of the path enters the middle of the screen
        // Finish when the bottom of the path reaches the middle of the screen
        const startPoint = windowHeight * 0.8;
        const endPoint = windowHeight * 0.2;
        
        let progress = 0;
        if (rect.top < startPoint) {
            progress = (startPoint - rect.top) / (rect.height + (startPoint - endPoint) * 0.5);
            progress = Math.min(Math.max(progress * 100, 0), 100);
        }
        
        pathProgress.style.height = progress + '%';
    }

    window.addEventListener('scroll', updateTrajectory);
    updateTrajectory(); // Initial check

    /* ==========================================================================
       ROCKET WARP & STAR BURST EFFECT
       ========================================================================== */
    const warpCanvas = document.getElementById('warpCanvas');
    const warpCtx = warpCanvas.getContext('2d');
    let warpActive = false;
    let warpParticles = [];

    class WarpParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = (Math.random() - 0.5) * warpCanvas.width;
            this.y = (Math.random() - 0.5) * warpCanvas.height;
            this.z = warpCanvas.width;
            this.prevZ = this.z;
        }
        update(speed) {
            this.prevZ = this.z;
            this.z -= speed;
            if (this.z <= 0) this.reset();
        }
        draw() {
            const sx = (this.x / this.z) * warpCanvas.width + warpCanvas.width / 2;
            const sy = (this.y / this.z) * warpCanvas.height + warpCanvas.height / 2;
            const px = (this.x / this.prevZ) * warpCanvas.width + warpCanvas.width / 2;
            const py = (this.y / this.prevZ) * warpCanvas.height + warpCanvas.height / 2;

            warpCtx.strokeStyle = `rgba(0, 245, 255, ${1 - this.z / warpCanvas.width})`;
            warpCtx.lineWidth = 2;
            warpCtx.beginPath();
            warpCtx.moveTo(px, py);
            warpCtx.lineTo(sx, sy);
            warpCtx.stroke();
        }
    }

    function initWarp() {
        warpCanvas.width = window.innerWidth;
        warpCanvas.height = window.innerHeight;
        warpParticles = Array.from({ length: 500 }, () => new WarpParticle());
    }

    function animateWarp() {
        if (!warpActive) return;
        warpCtx.fillStyle = 'rgba(10, 10, 18, 0.2)';
        warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);
        warpParticles.forEach(p => {
            p.update(30);
            p.draw();
        });
        requestAnimationFrame(animateWarp);
    }

    window.addEventListener('resize', initWarp);
    initWarp();

    // Rocket Click Handling
    const rockets = document.querySelectorAll('.rocket-warp-container');
    rockets.forEach(rocket => {
        rocket.addEventListener('click', () => {
            const targetId = rocket.getAttribute('data-target');
            const targetSection = document.querySelector(targetId);

            // 1. Ignite Rocket
            rocket.classList.add('launching');

            // 2. Start Warp after launch begins
            setTimeout(() => {
                warpCanvas.classList.add('active');
                warpActive = true;
                animateWarp();

                // 3. Scroll to target after 1.5s of warp
                setTimeout(() => {
                    if (targetId === '#multiverse') {
                        document.getElementById('multiverse').style.display = 'block';
                    }
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'instant'
                    });

                    // 4. Fade out warp
                    setTimeout(() => {
                        warpActive = false;
                        warpCanvas.classList.remove('active');
                        rocket.classList.remove('launching');
                        
                        // Clear warp canvas
                        warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);
                    }, 500);
                }, 1500);
            }, 800);
        });
    });

    // Multiverse Secret Trigger (Small Rocket)
    // const backToTop = document.getElementById('backToTop'); // backToTop is already declared at line 477
    const multiverseSection = document.getElementById('multiverse');

    if (backToTop && multiverseSection) {
        backToTop.addEventListener('click', function(e) {
            // If the section is hidden, clicking the rocket "warps" to it
            if (multiverseSection.style.display === 'none') {
                e.preventDefault();
                
                // 1. Trigger Warp Effect
                warpActive = true;
                if (warpCanvas) warpCanvas.classList.add('active');
                
                // 2. Reveal Section
                setTimeout(() => {
                    multiverseSection.style.display = 'block';
                    multiverseSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // 3. Clear Warp
                    setTimeout(() => {
                        warpActive = false;
                        if (warpCanvas) warpCanvas.classList.remove('active');
                    }, 1500);
                }, 800);
            }
        });
    }

    window.exitMultiverse = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            if (multiverseSection) multiverseSection.style.display = 'none';
        }, 1000);
    };

    // Multiverse Hobby Interactions
    let powerLevel = 450;
    const powerBar = document.getElementById('powerBar');
    const powerValue = document.getElementById('powerValue');

    window.trainForge = function() {
        if (powerLevel < 1000) {
            powerLevel += Math.floor(Math.random() * 50) + 10;
            if (powerLevel > 1000) powerLevel = 1000;
            
            // Visual Feedback: Both Planet and HUD
            const forgeBody = document.querySelector('.stellar-forge-planet .planet-body');
            const hudLeft = document.querySelector('.hud-left');
            
            if (forgeBody) {
                forgeBody.style.transform = 'scale(1.5)';
                forgeBody.style.boxShadow = '0 0 70px #ff4d4d';
                setTimeout(() => {
                    forgeBody.style.transform = '';
                    forgeBody.style.boxShadow = '';
                }, 400);
            }

            if (hudLeft) {
                hudLeft.style.borderColor = '#ff4d4d';
                hudLeft.style.boxShadow = '0 0 30px rgba(255, 77, 77, 0.2)';
                setTimeout(() => {
                    hudLeft.style.borderColor = '';
                    hudLeft.style.boxShadow = '';
                }, 400);
            }

            // Update UI
            const pvHUD = document.getElementById('powerValueHUD');
            const pbOriginal = document.getElementById('powerBar');

            if (pvHUD) pvHUD.innerText = powerLevel;
            if (pbOriginal) pbOriginal.style.width = (powerLevel / 10) + '%';

            // Success effect
            if (powerLevel === 1000) {
                if (pvHUD) pvHUD.innerText = "MAX_POWER";
                if (forgeBody) forgeBody.style.boxShadow = '0 0 100px #00f5ff';
            }
        }
    };

    /* ==========================================================================
       TECH CONSTELLATION ENGINE (CONTEXTUAL INTELLIGENCE)
       ========================================================================== */
    const TECH_CONSTELLATION_DATA = {
        languages: {
            title: "Languages",
            sector: "Programming Core",
            desc: "Commanding the digital spectrum through enterprise-grade and high-performance programming languages.",
            skills: ["Java", "Python", "C++", "HTML"]
        },
        libraries: {
            title: "Libraries",
            sector: "Data Engineering",
            desc: "Expertise in scientific computing and data visualization libraries for modern software ecosystems.",
            skills: ["Pandas", "NumPy", "Matplotlib", "Seaborn"]
        },
        tools: {
            title: "Tools",
            sector: "Instrumentation",
            desc: "Advanced toolset for database management, business intelligence, and professional presentation.",
            skills: ["MySQL", "Excel", "Tableau", "PowerPoint"]
        },
        core: {
            title: "Core CS",
            sector: "Stellar Intelligence",
            desc: "The fundamental problem-solving logic and adaptability protocols that power my engineering mindset.",
            skills: ["DSA", "Logic", "Adaptability"]
        }
    };

    const satellites = document.querySelectorAll('.skill-satellite');
    const clusters = document.querySelectorAll('.skill-cluster');
    const scanTitle = document.getElementById('scanTitle');
    const scanCategory = document.getElementById('scanCategory');
    const scanProficiency = document.getElementById('scanProficiency');
    const scanDesc = document.getElementById('scanDesc');
    const skillPopup = document.getElementById('skillPopup');
    const skillOverlay = document.getElementById('skillOverlay');
    const closeSkillPopup = document.getElementById('closeSkillPopup');
    const popTitle = document.getElementById('popTitle');
    const popTag = document.getElementById('popTag');
    const popDesc = document.getElementById('popDesc');
    const viewAllBtn = document.getElementById('viewAllNetwork');

    const showCategoryPopup = (categoryId) => {
        const data = TECH_CONSTELLATION_DATA[categoryId];
        if (!data) return;

        if (popTitle) {
            popTitle.innerText = data.title.toUpperCase();
            popTitle.setAttribute('data-text', data.title.toUpperCase());
        }
        if (popTag) popTag.innerText = `[ ${data.sector} ]`;
        
        let skillList = `<div style="display: grid; grid-template-columns: 1fr 16px 1fr; gap: 15px; margin-top: 20px; align-items: center;">`;
        data.skills.forEach((s, index) => {
            skillList += `<div style="color: var(--accent-cyan); font-weight: 600; font-size: 1rem; text-align: right;">${s}</div>`;
            skillList += `<div style="width: 4px; height: 4px; background: var(--accent-purple); border-radius: 50%; justify-self: center;"></div>`;
            if (index < data.skills.length - 1) {
                // Keep the grid flowing
            }
        });
        // Close the grid properly if odd number of skills
        skillList += `</div>`;
        
        if (popDesc) {
            popDesc.innerHTML = `
                <p style="margin-bottom: 20px; font-style: italic; opacity: 0.9;">${data.desc}</p>
                <div style="border-top: 1px solid rgba(0, 240, 255, 0.1); padding-top: 15px;">
                    <div style="font-size: 0.75rem; color: var(--accent-purple); margin-bottom: 10px; letter-spacing: 2px;">IDENTIFIED ASSETS:</div>
                    ${skillList}
                </div>
            `;
        }

        if (skillPopup) skillPopup.classList.add('active');
        if (skillOverlay) skillOverlay.classList.add('active');
        
        // Focus Mode
        clusters.forEach(c => {
            if (c.getAttribute('data-category') === categoryId) {
                c.classList.remove('is-dimmed');
                c.classList.add('is-active');
            } else {
                c.classList.add('is-dimmed');
                c.classList.remove('is-active');
            }
        });
    };

    const resetNetwork = () => {
        clusters.forEach(c => {
            c.classList.remove('is-dimmed');
            c.classList.remove('is-active');
        });
        if (skillPopup) skillPopup.classList.remove('active');
        if (skillOverlay) skillOverlay.classList.remove('active');
    };

    // Satellite Hover
    satellites.forEach(sat => {
        sat.addEventListener('mouseenter', () => {
            const skill = sat.getAttribute('data-skill');
            const category = sat.getAttribute('data-category');
            const prof = sat.getAttribute('data-prof');
            const desc = sat.getAttribute('data-desc');

            if (scanTitle) {
                scanTitle.innerText = skill;
                scanTitle.setAttribute('data-text', skill);
            }
            if (scanCategory) scanCategory.innerText = `STATUS: ${category.toUpperCase()}`;
            if (scanProficiency) scanProficiency.style.width = `${prof}%`;
            if (scanDesc) scanDesc.innerText = desc;
        });

        sat.addEventListener('click', (e) => {
            e.stopPropagation();
            const cluster = sat.closest('.skill-cluster');
            const categoryId = cluster.getAttribute('data-category');
            showCategoryPopup(categoryId);
        });
    });

    // Cluster Core Click
    clusters.forEach(cluster => {
        const core = cluster.querySelector('.cluster-core');
        if (core) {
            core.addEventListener('click', (e) => {
                e.stopPropagation();
                showCategoryPopup(cluster.getAttribute('data-category'));
            });
        }
    });

    if (viewAllBtn) viewAllBtn.addEventListener('click', resetNetwork);
    if (closeSkillPopup) closeSkillPopup.addEventListener('click', () => {
        if (skillPopup) skillPopup.classList.remove('active');
        if (skillOverlay) skillOverlay.classList.remove('active');
    });
    if (skillOverlay) skillOverlay.addEventListener('click', resetNetwork);

    // Reset Scanner on Map Leave
    const networkContainer = document.getElementById('galacticNetwork');
    if (networkContainer) {
        networkContainer.addEventListener('mouseleave', () => {
            if (scanTitle) {
                scanTitle.innerText = "Awaiting Input...";
                scanTitle.setAttribute('data-text', "Awaiting Input...");
            }
            if (scanCategory) scanCategory.innerText = "Hover over a node to analyze";
            if (scanProficiency) scanProficiency.style.width = "0%";
            if (scanDesc) scanDesc.innerText = "Sector telemetry offline. Please select a celestial body for data synthesis.";
        });
    }

    /* ==========================================================================
       ACHIEVEMENT ARCHIVE (TILT EFFECT)
       ========================================================================== */
    const capsules = document.querySelectorAll('.badge-capsule');
    capsules.forEach(capsule => {
        capsule.addEventListener('mousemove', (e) => {
            const rect = capsule.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            capsule.style.transform = `translateY(-15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        capsule.addEventListener('mouseleave', () => {
            capsule.style.transform = `translateY(0) rotateX(0) rotateY(0) scale(1)`;
        });
    });

    /* ==========================================================================
       SINGULARITY FINALE: BLACK HOLE ENGINE (REFINED)
       ========================================================================== */
    const bhCanvas = document.getElementById('blackHoleCanvas');
    const bhContainer = document.querySelector('.black-hole-container');
    const corruptionOverlay = document.getElementById('corruptionOverlay');
    const corruptedContent = document.querySelector('.corrupted-content');
    const rescueShip = document.getElementById('rescueShip');
    const anomalyAlert = document.getElementById('anomalyAlert');
    const countdownEl = document.getElementById('singularityCountdown');
    
    if (bhCanvas) {
        const ctx = bhCanvas.getContext('2d');
        let width, height, particles = [];
        let isHovered = false;
        
        function resize() {
            if (!bhContainer) return;
            width = bhCanvas.width = bhContainer.offsetWidth;
            height = bhCanvas.height = bhContainer.offsetHeight;
        }
        
        window.addEventListener('resize', resize);
        resize();
        
        class Star {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5;
                this.brightness = Math.random();
            }
            draw(ctx) {
                const dx = this.x - width / 2;
                const dy = this.y - height / 2;
                const dist = Math.hypot(dx, dy);
                const r = width * 0.08;
                
                // Gravitational Lensing (Position Shift)
                let lx = this.x;
                let ly = this.y;
                if (dist > r) {
                    const shift = (r * r) / (dist * 1.5);
                    lx = width / 2 + dx * (1 + shift/dist);
                    ly = height / 2 + dy * (1 + shift/dist);
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
                ctx.beginPath();
                ctx.arc(lx, ly, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class GasParticle {
            constructor() {
                this.reset();
            }
            reset() {
                this.angle = Math.random() * Math.PI * 2;
                this.dist = Math.random() * width * 0.7 + width * 0.05;
                this.speed = (Math.random() * 0.02 + 0.01) * (this.dist < width * 0.2 ? 1.5 : 1);
                this.size = Math.random() * 1.5 + 0.5;
                this.life = Math.random();
                
                // Physical Spectrum (White -> Gold -> Red)
                const d = this.dist / (width * 0.7);
                if (d < 0.2) this.color = [255, 255, 255];
                else if (d < 0.5) this.color = [255, 200, 50];
                else this.color = [200, 50, 0];
            }
            update() {
                const multi = isHovered ? 2.5 : 1;
                this.angle += this.speed * multi;
                this.dist -= 0.1 * multi;
                if (this.dist < width * 0.08 || this.dist > width * 0.8) this.reset();
            }
            draw(ctx) {
                const dx = Math.cos(this.angle) * this.dist;
                const dz = Math.sin(this.angle) * this.dist;
                
                // Cinematic Lensing (The "Wrap")
                const r = width * 0.08;
                let yOffset = dz * 0.25;
                if (this.dist > r) {
                    const lensFactor = Math.pow(r / this.dist, 2) * 50;
                    yOffset += (dz < 0 ? -lensFactor : lensFactor); // Wrap over top/bottom
                }

                const x = width / 2 + dx;
                const y = height / 2 + yOffset;

                // Redshift/Blueshift (Simple tint based on x-pos)
                const shift = (dx / (width * 0.5)) * 30;
                ctx.fillStyle = `rgba(${this.color[0] + shift}, ${this.color[1]}, ${this.color[2] - shift}, 0.2)`;
                ctx.beginPath();
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const stars = Array.from({ length: 150 }, () => new Star());
        const gas = Array.from({ length: 800 }, () => new GasParticle());

        function animateBH() {
            // High Fade for Volumetric Gaseous Look
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.globalCompositeOperation = 'screen';
            
            // 1. STARFIELD LAYER (Lensed)
            stars.forEach(s => s.draw(ctx));

            // 2. VOLUMETRIC ACCRETION
            gas.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            // 3. THE PERFECT VOID (Masking)
            const r = width * 0.08 + (isHovered ? Math.sin(Date.now()*0.01)*2 : 0);
            
            // Punch Hole
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(width/2, height/2, r, 0, Math.PI * 2);
            ctx.fill();

            // Source Over for Final Void & Photosphere
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(width/2, height/2, r, 0, Math.PI * 2);
            ctx.fill();

            // Photosphere Shimmer
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.random()*0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(width/2, height/2, r + 0.5, 0, Math.PI * 2);
            ctx.stroke();

            requestAnimationFrame(animateBH);
        }
        animateBH();

        bhContainer.addEventListener('mouseenter', () => isHovered = true);
        bhContainer.addEventListener('mouseleave', () => isHovered = false);
        
        let isCollapsed = false;
        bhContainer.addEventListener('click', () => {
            console.log("Singularity Clicked! Starting countdown...");
            if (isCollapsed) return;
            startCountdown();
        });
    }

    function startCountdown() {
        if (anomalyAlert) anomalyAlert.classList.add('active');
        let count = 3;
        if (countdownEl) countdownEl.innerText = count;
        
        const timer = setInterval(() => {
            count--;
            if (countdownEl) countdownEl.innerText = count > 0 ? count : "!!!";
            if (count <= 0) {
                clearInterval(timer);
                triggerUniversalCollapse();
            }
        }, 1000);
    }

    function triggerUniversalCollapse() {
        isCollapsed = true;
        const bhRect = bhContainer.getBoundingClientRect();
        const focalX = bhRect.left + bhRect.width / 2;
        const focalY = bhRect.top + bhRect.height / 2;

        const targets = document.querySelectorAll('main > section, .navbar, .footer, .floating-socials, .back-to-top');
        
        window.collapseTimeline = gsap.timeline({
            onComplete: () => showCorruptedState()
        });

        // 1. SEISMIC SHAKE (Heavy Warning)
        window.collapseTimeline.to(targets, {
            duration: 0.1,
            x: () => (Math.random() - 0.5) * 40,
            y: () => (Math.random() - 0.5) * 40,
            repeat: 10,
            yoyo: true,
            ease: "none"
        });

        // 2. THE SINGULARITY PULL (Maximum Intensity)
        window.collapseTimeline.to(targets, {
            duration: 4,
            x: (i, el) => focalX - (el.getBoundingClientRect().left + el.offsetWidth / 2),
            y: (i, el) => focalY - (el.getBoundingClientRect().top + el.offsetHeight / 2),
            scaleY: 20,   // Extreme Spaghettification
            scaleX: 0.01,
            rotation: 1080, // Triple Spiral
            filter: "blur(50px) brightness(10) contrast(3) saturate(0) invert(1) hue-rotate(180deg)",
            opacity: 0,
            stagger: {
                amount: 1.5,
                from: "edges"
            },
            ease: "expo.in"
        }, "+=0.2");

        // Background layers: Extreme Distortion
        window.collapseTimeline.to(['#starfieldCanvas', '#warpCanvas', '.cosmos-journey-v2'], {
            duration: 3,
            scale: 0.01,
            rotation: 720,
            opacity: 0,
            filter: "brightness(20) contrast(5)",
            ease: "expo.in"
        }, 0.5);
        
        // Violent pulse of the black hole
        window.collapseTimeline.to(bhContainer, {
            scale: 3,
            duration: 0.15,
            repeat: 15,
            yoyo: true,
            ease: "power2.inOut"
        }, 0.8);

        // Final Singular Snap
        window.collapseTimeline.to(bhContainer, {
            scale: 0,
            duration: 0.4,
            ease: "power4.in"
        }, "-=0.2");
        
        // Screen Flash before Corruption
        window.collapseTimeline.to('body', {
            backgroundColor: "#fff",
            duration: 0.1,
            yoyo: true,
            repeat: 1
        }, "-=0.4");
    }

    function showCorruptedState() {
        if (corruptionOverlay) {
            corruptionOverlay.style.display = 'flex';
            gsap.to(corruptedContent, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" });
            
            setTimeout(() => {
                if (rescueShip) {
                    rescueShip.style.display = 'flex';
                    gsap.fromTo(rescueShip, 
                        { opacity: 0, y: 100, scale: 0 },
                        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "back.out(1.7)" }
                    );
                }
            }, 3000);
        }
    }

    if (rescueShip) {
        rescueShip.addEventListener('click', () => {
            restoreUniverseSequentially();
        });
    }

    function restoreUniverseSequentially() {
        gsap.to(rescueShip, {
            scale: 20, opacity: 0, duration: 1.5, ease: "power4.in",
            onComplete: () => {
                if (corruptionOverlay) corruptionOverlay.style.display = 'none';
                if (window.collapseTimeline) window.collapseTimeline.reverse();
                if (anomalyAlert) anomalyAlert.classList.remove('active');
                if (countdownEl) countdownEl.innerText = "";
                isCollapsed = false;
                
                // Final clean reset of specific background layers GSAP didn't reverse perfectly
                gsap.to(['#starfieldCanvas', '#warpCanvas', '.cosmos-journey-v2', '.black-hole-container'], {
                    scale: 1, opacity: 1, duration: 1, clearProps: "all"
                });
            }
        });
        gsap.to(corruptedContent, { opacity: 0, filter: "blur(20px)", duration: 0.8 });
    }

    /* ==========================================================================
       SET CURRENT YEAR
       ========================================================================== */
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) currentYearEl.innerText = new Date().getFullYear();
})();

/* ==========================================================================
   SPACE STATION TERMINAL INTERACTIVITY
   ========================================================================== */

function initStationTerminal() {
    const terminal = document.querySelector('.station-terminal-container');
    if (!terminal) return;

    // 1. DYNAMIC SIGNAL STRENGTH
    const lastBar = terminal.querySelector('.bar.s-4');
    setInterval(() => {
        if (Math.random() > 0.7) {
            lastBar.classList.toggle('active');
        }
    }, 1000);

    // 2. LIVE TELEMETRY UPDATES
    const telemetry = terminal.querySelector('.console-telemetry');
    const statuses = [
        '>_ WAITING_FOR_PAYLOAD',
        '>_ SYNCING_COORDINATES',
        '>_ UPLINK_STABLE',
        '>_ BUFFERING_DATA_STREAM',
        '>_ SECURE_CHANNEL_ACTIVE'
    ];
    let statusIndex = 0;
    setInterval(() => {
        telemetry.style.opacity = '0';
        setTimeout(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            telemetry.innerText = statuses[statusIndex];
            telemetry.style.opacity = '1';
        }, 500);
    }, 4000);

    // 3. HOLOGRAPHIC SWEEP
    const sweep = document.createElement('div');
    sweep.className = 'terminal-holographic-sweep';
    terminal.appendChild(sweep);

    // 4. FORM SUBMISSION SEQUENCE
    const contactForm = document.getElementById('contactForm');
    const uplinkBtn = terminal.querySelector('.btn-uplink');
    const btnText = uplinkBtn.querySelector('.btn-content');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Only stop if we want to simulate or prevent default for custom handling
            // Assuming default submission for now, but adding a visual trigger
            uplinkBtn.disabled = true;
            btnText.innerHTML = 'TRANSMITTING... <i class="fas fa-satellite animate-spin"></i>';
            telemetry.innerText = '>_ UPLINK_INITIATED_SUCCESS';
            telemetry.style.color = '#00ff88';
        });
    }
}

// Add the holographic sweep CSS dynamically to keep script self-contained if needed,
// but I've already added the sweep class logic. Let's add the CSS for it here too.
const style = document.createElement('style');
style.textContent = `
    .terminal-holographic-sweep {
        position: absolute;
        top: 0; left: -100%;
        width: 50%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.05), transparent);
        transform: skewX(-20deg);
        z-index: 15;
        pointer-events: none;
        animation: holo-sweep 10s ease-in-out infinite;
    }
    @keyframes holo-sweep {
        0% { left: -100%; }
        20% { left: 200%; }
        100% { left: 200%; }
    }
    .animate-spin { animation: fa-spin 2s linear infinite; }
`;
document.head.append(style);

// Initialize on load
document.addEventListener('DOMContentLoaded', initStationTerminal);

