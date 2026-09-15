document.addEventListener('DOMContentLoaded', () => {
    // Show envelope immediately
    const inviteWrapper = document.getElementById('invite-wrapper');
    if(inviteWrapper) {
        inviteWrapper.classList.remove('hidden');
    }

    const envelope = document.getElementById('envelope');
    const openSeal = document.getElementById('open-seal');
    const closeSeal = document.getElementById('close-seal');
    const scrollContainers = document.querySelectorAll('.scroll-container');
    const versionSwitch = document.getElementById('version-switch');
    const vOptions = document.querySelectorAll('.v-option');
    const vContents = document.querySelectorAll('.v-content');
    
    let isOpen = false;
    let isTransitioning = false;
    let currentV1Page = 0; // 0 = capa, 1 = detalhes

    // --- Version Toggle Logic ---
    vOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            if(isOpen) return; // Cannot toggle while envelope is open
            
            // Update active button
            vOptions.forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');

            // Show correct content wrapper
            const targetV = e.target.getAttribute('data-v');
            vContents.forEach(content => {
                if (content.id === targetV + '-content') {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // --- JS Smart Scroll (Empurrãozinho) for V1 ---
    const v1ScrollContainer = document.querySelector('#v1-content .scroll-container');
    const v1Content = document.getElementById('v1-content');

    function goToV1Page(pageIndex) {
        if (!v1ScrollContainer) return;
        if (pageIndex < 0) pageIndex = 0;
        if (pageIndex > 1) pageIndex = 1;
        
        currentV1Page = pageIndex;
        isTransitioning = true;
        
        const targetEl = currentV1Page === 0 ? document.querySelector('.page-cover') : document.querySelector('.page-details');
        if (targetEl) {
            v1ScrollContainer.scrollTo({
                top: targetEl.offsetTop,
                behavior: 'smooth'
            });
        }

        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }

    if (v1Content) {
        // Wheel support (Desktop)
        v1Content.addEventListener('wheel', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            e.preventDefault();
            if (isTransitioning) return;
            if (Math.abs(e.deltaY) < 15) return;

            if (e.deltaY > 0) {
                goToV1Page(1); // down
            } else {
                goToV1Page(0); // up
            }
        }, { passive: false });

        // Touch support (Mobile)
        let touchStartY = 0;
        v1Content.addEventListener('touchstart', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        v1Content.addEventListener('touchmove', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            e.preventDefault();
        }, { passive: false });

        v1Content.addEventListener('touchend', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            if (isTransitioning) return;

            const touchEndY = e.changedTouches[0].clientY;
            const diffY = touchStartY - touchEndY;

            if (diffY > 40) {
                goToV1Page(1); // arrastou pra cima, quer ver abaixo
            } else if (diffY < -40) {
                goToV1Page(0); // arrastou pra baixo, quer ver acima
            }
        });
    }

    // --- Abrir e Fechar Carta ---
    if(openSeal) {
        openSeal.addEventListener('click', () => {
            if (!isOpen) {
                isOpen = true;
                envelope.classList.add('is-open');
                if (versionSwitch) versionSwitch.classList.add('hidden-switch');
                
                setTimeout(() => { envelope.classList.add('is-reading'); currentV1Page = 0; if(v1ScrollContainer) v1ScrollContainer.scrollTo({ top: 0 }); resizePages(); }, 100); 
            }
        });
    }

    if(closeSeal) {
        closeSeal.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                isOpen = false;
                envelope.classList.remove('is-reading');
                if (versionSwitch) versionSwitch.classList.remove('hidden-switch');

                setTimeout(() => {
                    envelope.classList.remove('is-open');
                    // Scroll all containers to top
                    scrollContainers.forEach(container => {
                        container.scrollTo({ top: 0, behavior: 'auto' });
                    });
                    currentV1Page = 0;
                }, 800); 
            }
        });
    }

    // --- Contagem Regressiva ---
    const targetDate = new Date('2026-11-14T16:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            const countdownEl = document.getElementById('countdown');
            if (countdownEl) countdownEl.innerHTML = "<p style='font-family: Playfair Display; font-size: 1.5rem; color: #fff;'>O grande dia chegou!</p>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        if (daysEl) {
            daysEl.innerText = days.toString().padStart(2, '0');
            document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
            document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();


    // --- Dynamic Height Fix for Exact Envelope Fit ---
    function resizePages() {
        const sc = document.querySelector('#v1-content .scroll-container');
        if(sc) {
            const h = sc.clientHeight + 'px';
            const cover = document.querySelector('.page-cover');
            const details = document.querySelector('.page-details');
            if(cover) cover.style.height = h;
            if(details) details.style.height = h;
        }
    }
    window.addEventListener('resize', resizePages);
    // Run it once the envelope is opened (or immediately)
    setTimeout(resizePages, 100);
    setTimeout(resizePages, 1500); // After envelope opens
});

