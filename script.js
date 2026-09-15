document.addEventListener('DOMContentLoaded', () => {
    // Lógica da Animação Inicial (Intro Overlay)
    const introOverlay = document.getElementById('intro-overlay');
    const inviteWrapper = document.getElementById('invite-wrapper');
    
    setTimeout(() => {
        if(introOverlay) {
            introOverlay.style.opacity = '0';
            introOverlay.style.visibility = 'hidden';
        }
        if(inviteWrapper) {
            inviteWrapper.classList.remove('hidden');
        }
    }, 3800);

    const envelope = document.getElementById('envelope');
    const letter = document.getElementById('letter');
    const openSeal = document.getElementById('open-seal');
    const closeSeal = document.getElementById('close-seal');
    const scrollContainer = document.getElementById('scroll-container');
    const dots = document.querySelectorAll('.v-dot');
    
    let isOpen = false;
    let currentSectionIndex = 0;
    const totalSections = 4; // Agora 4 seções completas
    let isTransitioning = false;

    // --- Função Mestra de Navegação Entre Páginas ---
    function goToSection(index) {
        if (index < 0 || index >= totalSections) return;
        currentSectionIndex = index;
        
        // Atualiza estado visual das bolinhas
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSectionIndex);
        });

        if (!scrollContainer) return;
        const targetScroll = currentSectionIndex * scrollContainer.clientHeight;
        
        isTransitioning = true;
        scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        // Trava novas ações até a animação de deslize concluir perfeitamente
        setTimeout(() => {
            isTransitioning = false;
        }, 650);
    }

    // --- Abrir e Fechar Carta ---
    if(openSeal) {
        openSeal.addEventListener('click', () => {
            if (!isOpen) {
                isOpen = true;
                envelope.classList.add('is-open');
                const btn = document.getElementById('version-toggle');
                if(btn) { btn.style.opacity = '0'; btn.style.pointerEvents = 'none'; }
                setTimeout(() => {
                    envelope.classList.add('is-reading');
                    currentSectionIndex = 0;
                    goToSection(0);
                }, 1000); 
            }
        });
    }

    if(closeSeal) {
        closeSeal.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) {
                isOpen = false;
                envelope.classList.remove('is-reading');
                const btn = document.getElementById('version-toggle');
                if(btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
                setTimeout(() => {
                    envelope.classList.remove('is-open');
                    currentSectionIndex = 0;
                    if (scrollContainer) {
                        scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
                    }
                    dots.forEach((dot, i) => dot.classList.toggle('active', i === 0));
                }, 800); 
            }
        });
    }

    // --- Clique Direto nas Bolinhas ---
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (envelope.classList.contains('is-reading') && !isTransitioning) {
                goToSection(index);
            }
        });
    });

    // --- Rolagem com a Roda do Mouse (Passada Completa por Vez) ---
    if (letter) {
        letter.addEventListener('wheel', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            e.preventDefault();
            if (isTransitioning) return;

            // Filtra toques acidentais mínimos
            if (Math.abs(e.deltaY) < 15) return;

            if (e.deltaY > 0) {
                // Rolar para baixo -> vai para a próxima página
                goToSection(currentSectionIndex + 1);
            } else {
                // Rolar para cima -> vai para a página anterior
                goToSection(currentSectionIndex - 1);
            }
        }, { passive: false });

        // --- Suporte a Gesto de Arraste (Touch / Celular) ---
        let touchStartY = 0;

        letter.addEventListener('touchstart', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        letter.addEventListener('touchmove', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            e.preventDefault();
        }, { passive: false });

        letter.addEventListener('touchend', (e) => {
            if (!envelope.classList.contains('is-reading')) return;
            if (isTransitioning) return;

            const touchEndY = e.changedTouches[0].clientY;
            const diffY = touchStartY - touchEndY;

            // Se arrastou para cima mais de 35px -> próxima página
            if (diffY > 35) {
                goToSection(currentSectionIndex + 1);
            }
            // Se arrastou para baixo mais de 35px -> página anterior
            else if (diffY < -35) {
                goToSection(currentSectionIndex - 1);
            }
        });
    }

    // Mantém alinhamento exato se a janela for redimensionada
    window.addEventListener('resize', () => {
        if (envelope && envelope.classList.contains('is-reading') && scrollContainer) {
            scrollContainer.scrollTop = currentSectionIndex * scrollContainer.clientHeight;
        }
    });

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

});
