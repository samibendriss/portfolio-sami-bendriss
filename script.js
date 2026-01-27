// ===== SCRIPT COMPLET FONCTIONNEL =====

// Current page tracking
let currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'home';

// Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
    }, 1500);
});

// Theme Toggle
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    }

    // Initialiser le thème
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(getSystemTheme());
    }

    // Écouter les changements système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Basculer manuellement
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Custom Cursor - UNIQUEMENT sur desktop (min-width: 1024px) avec hover
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');
    const isDesktopWithHover = window.matchMedia('(min-width: 1024px) and (hover: hover)').matches;

    if (cursor && cursorFollower && isDesktopWithHover) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;

            setTimeout(() => {
                cursorFollower.style.left = `${e.clientX - 10}px`;
                cursorFollower.style.top = `${e.clientY - 10}px`;
            }, 100);
        });

        // Cursor hover effect
        const updateCursorTargets = () => {
            document.querySelectorAll('a, button, .project-card, .skill-card, .contact-item').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.style.transform = 'scale(1.5)';
                    cursorFollower.style.transform = 'scale(1.5)';
                });
                el.addEventListener('mouseleave', () => {
                    cursor.style.transform = 'scale(1)';
                    cursorFollower.style.transform = 'scale(1)';
                });
            });
        };
        updateCursorTargets();
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        // calcule la position actuelle du hamburger (coin haut-gauche)
        const setMenuFixedPosition = () => {
            const r = menuToggle.getBoundingClientRect();
            // on mémorise la position *avant* de passer en fixed
            menuToggle.style.setProperty('--menu-x', r.left + 'px');
            menuToggle.style.setProperty('--menu-y', r.top + 'px');
        };

        const onViewportChangeWhileOpen = () => {
            // recalcule la position si la barre se décale (scroll/resize) pendant l’ouverture
            setMenuFixedPosition();
        };

        menuToggle.addEventListener('click', () => {
            const opening = !menuToggle.classList.contains('active');

            if (opening) {
                setMenuFixedPosition();               // 1) fige aux coordonnées du hamburger
                menuToggle.classList.add('active');   // 2) transforme en croix (même place)
                navLinks.classList.add('active');

                // suit les petits décalages pendant l’ouverture
                window.addEventListener('scroll', onViewportChangeWhileOpen, { passive: true });
                window.addEventListener('resize', onViewportChangeWhileOpen);
            } else {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');

                // nettoyage
                window.removeEventListener('scroll', onViewportChangeWhileOpen);
                window.removeEventListener('resize', onViewportChangeWhileOpen);
                menuToggle.style.removeProperty('--menu-x');
                menuToggle.style.removeProperty('--menu-y');
            }
        });
    }

    // Navigation entre pages
    function navigateTo(page) {
        // Gérer le cas spécial de la page d'accueil
        if (page === 'home') page = 'index';

        if (page === currentPage) return;

        // Transition
        const transition = document.getElementById('pageTransition');
        if (transition) transition.classList.add('active');

        setTimeout(() => {
            window.location.href = `${page}.html`;
        }, 300);
    }

    // Configurer le logo pour revenir à l'accueil
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('home');
        });
    }

    // Configurer les liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navigateTo(this.dataset.page);
        });
    });

    // Configurer le bouton de contact
    const contactButton = document.querySelector('.nav-cta-btn');
    if (contactButton) {
        contactButton.addEventListener('click', function (e) {
            e.preventDefault();
            navigateTo('contact');
        });
    }

    // ==== FONCTION GLOBALE POUR LE FILTRAGE ====
    window.filterProjects = function (category) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projects = document.querySelectorAll('.project-card');

        // Mettre à jour le filtre actif (normalise les accents)
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
            const catKey = norm(category);
            const btnKey = norm(btn.textContent);
            if ((catKey === 'all' && btn.textContent.trim() === 'TOUS') ||
                (catKey !== 'all' && btnKey.includes(catKey))) {
                btn.classList.add('active');
            }
        });

        // Filtrer les projets
        projects.forEach(project => {
            if (category === 'all' || project.dataset.category === category) {
                project.style.display = 'flex'; // Modifier en 'flex'
                // Réinitialiser l'animation
                project.classList.remove('fadeInUp');
                void project.offsetWidth;
                project.classList.add('fadeInUp');
                project.addEventListener('animationend', function handler(e) {
                    if (e.animationName === 'fadeInUp') {
                        project.classList.remove('fadeInUp');
                        project.removeEventListener('animationend', handler);
                    }
                }, { once: true });
            } else {
                project.style.display = 'none';
            }
        });

        // Mettre à jour le compteur
        updateProjectCount();

        // Recalculer l'empilement après filtrage (§4)
        debouncedUpdateAll();

        updateAllBadgeStacking();
    }

    // Fonction pour compter et afficher le nombre de projets
    function updateProjectCount() {
        // Compter tous les projets visibles (pas cachés)
        const allProjects = document.querySelectorAll('.project-card');
        const visibleProjects = Array.from(allProjects).filter(project => {
            const style = window.getComputedStyle(project);
            return style.display !== 'none';
        });

        const count = visibleProjects.length;
        const countElement = document.getElementById('projectsCount');

        if (countElement) {
            if (count === 0) {
                countElement.textContent = 'Aucun projet trouvé';
            } else if (count === 1) {
                countElement.textContent = '1 projet';
            } else {
                countElement.textContent = `${count} projets`;
            }
        }
    }

    // Modifier la fonction filterProjects existante
    function filterProjects(category) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projects = document.querySelectorAll('.project-card');

        // Update active filter (normalise les accents)
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
            const catKey = norm(category);
            const btnKey = norm(btn.textContent);
            if ((catKey === 'all' && btn.textContent.trim() === 'TOUS') ||
                (catKey !== 'all' && btnKey.includes(catKey))) {
                btn.classList.add('active');
            }
        });

        // Filter projects
        projects.forEach((project, index) => {
            if (category === 'all' || project.dataset.category === category) {
                project.style.display = 'block';
                project.style.animationDelay = `${index * 0.1}s`;
                project.classList.remove('fadeInUp');
                void project.offsetWidth; // Trigger reflow
                project.classList.add('fadeInUp');
                project.addEventListener('animationend', function handler(e) {
                    if (e.animationName === 'fadeInUp') {
                        project.classList.remove('fadeInUp');
                        project.removeEventListener('animationend', handler);
                    }
                }, { once: true });
            } else {
                project.style.display = 'none';
            }
        });

        // Mettre à jour le compte après le filtrage
        updateProjectCount();
        debouncedUpdateAll();
    }

    // Form submission
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.onsubmit = function (event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);

            fetch(form.action, { method: form.method || 'POST', body: formData, headers: { 'Accept': 'application/json' } })
                .then(() => {
                    alert('Merci pour votre message ! Je vous répondrai dans les plus brefs délais.');
                    form.reset();
                    // Réinitialiser la hauteur du textarea après reset
                    const textarea = form.querySelector('textarea');
                    if (textarea) {
                        textarea.style.height = '';
                    }
                })
                .catch(() => {
                    alert('Erreur lors de l\'envoi. Veuillez réessayer.');
                });
        };

        // Auto-expansion du textarea (s'agrandit uniquement si le texte dépasse)
        const messageTextarea = contactForm.querySelector('textarea#message');
        if (messageTextarea) {
            const minHeight = 150; // Hauteur minimale en pixels

            function autoExpand() {
                // Réinitialise à 'auto' pour mesurer le vrai scrollHeight
                this.style.height = 'auto';
                // Applique la hauteur : max entre la hauteur minimale et le contenu
                const newHeight = Math.max(minHeight, this.scrollHeight);
                this.style.height = newHeight + 'px';
            }

            messageTextarea.addEventListener('input', autoExpand);
            // Initialiser au cas où il y aurait du contenu pré-rempli
            autoExpand.call(messageTextarea);
        }
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Parallax effect for hero background
    if (currentPage === 'home') {
        window.addEventListener('scroll', () => {
            const parallax = document.querySelector('.hero-background');
            if (parallax) {
                parallax.style.transform = `translateY(${window.scrollY * 0.5}px)`;
            }
        });
    }

    // Add magnetic effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // Typewriter Effect
    if (document.getElementById('typewriter')) {
        const typewriterElement = document.getElementById('typewriter');
        const cursorElement = document.querySelector('.typewriter-cursor');
        const words = ['étudiant', 'curieux', 'ambitieux', 'rigoureux', 'motivé', 'persévérant', 'dynamique', 'polyvalent'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function typeWriter() {
            const currentWord = words[wordIndex];
            const fullWord = currentWord + '.';

            if (isDeleting) {
                const displayText = fullWord.substring(0, charIndex - 1);
                if (charIndex > currentWord.length) {
                    typewriterElement.innerHTML = currentWord + '<span style="color: var(--text-primary)">.</span>';
                    if (cursorElement) cursorElement.style.color = 'var(--primary)';
                } else {
                    typewriterElement.textContent = displayText;
                }
                charIndex--;
                typeSpeed = 50;
            } else {
                const displayText = fullWord.substring(0, charIndex + 1);
                if (charIndex === currentWord.length) {
                    typewriterElement.innerHTML = currentWord + '<span style="color: var(--text-primary)">.</span>';
                    if (cursorElement) cursorElement.style.color = 'var(--text-primary)';
                } else {
                    typewriterElement.textContent = displayText;
                }
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === fullWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(typeWriter, typeSpeed);
        }

        setTimeout(typeWriter, 1000);
    }

    // Ajoutez cette fonction
    function updateActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // --- Détection de chevauchement category/level ---
    function badgesOverlap(a, b) {
        if (!a || !b) return false;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return !(ra.right <= rb.left || ra.left >= rb.right || ra.bottom <= rb.top || ra.top >= rb.bottom);
    }

    // --- Chevauchement robuste (mesuré dans l'état "normal" absolu) ---
    function updateBadgeStacking(card) {
        const cat = card.querySelector('.project-category');
        const lvl = card.querySelector('.project-level');
        if (!cat || !lvl || getComputedStyle(card).display === 'none') return;

        // mesurer dans l'état par défaut (sans .badges-stacked)
        const hadStack = card.classList.contains('badges-stacked');
        if (hadStack) card.classList.remove('badges-stacked');
        void card.offsetWidth; // force reflow

        const a = cat.getBoundingClientRect();
        const b = lvl.getBoundingClientRect();
        // APRÈS (considère "se touchent" comme chevauchement)
        const overlap = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

        // appliquer l'état final
        if (overlap) card.classList.add('badges-stacked');
        else card.classList.remove('badges-stacked');
    }

    function updateAllBadgeStacking() {
        document.querySelectorAll('.project-card').forEach(updateBadgeStacking);
    }

    // petit debounce pour éviter de spammer
    const debounce = (fn, delay = 60) => {
        let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
    };
    const debouncedUpdateAll = debounce(updateAllBadgeStacking, 80);

    // Recalcule sur resize / orientation
    window.addEventListener('resize', updateAllBadgeStacking);
    // Recalcule après chargement complet
    window.addEventListener('load', updateAllBadgeStacking);
    // Recalcule après chargement des polices (les largeurs changent souvent ici)
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateAllBadgeStacking);
    }

    // recalcul après chargement des images (mesures fiables)
    document.querySelectorAll('.project-card .project-image img').forEach(img => {
        if (img.complete) return;
        img.addEventListener('load', updateAllBadgeStacking, { once: true });
        // Recalcul sur changement de taille de chaque carte (grid responsive, etc.)
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(entries => {
                for (const entry of entries) {
                    updateBadgeStacking(entry.target); // instantané, sans délai
                }
            });
            document.querySelectorAll('.project-card').forEach(card => ro.observe(card));
        }
    });

    // ===== FONCTIONS POUR LA MODAL DE PROJET =====

    // Fonction pour ouvrir la modal avec les détails du projet
    function openProjectModal(projectData) {
        const modal = document.getElementById('projectModal');
        const body = document.body;

        // Remplir les données de la modal
        populateModalData(projectData);

        // Afficher la modal
        modal.style.display = 'flex';
        body.classList.add('modal-open');

        // Animation d'ouverture
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    // Fonction pour fermer la modal
    function closeProjectModal() {
        const modal = document.getElementById('projectModal');
        const body = document.body;

        // Animation de fermeture
        modal.classList.remove('active');
        modal.classList.add('closing');

        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
            body.classList.remove('modal-open');
        }, 300);
    }

    // Fonction pour remplir les données de la modal
    function populateModalData(data) {
        // Image
        const modalImage = document.querySelector('.modal-image');
        modalImage.src = data.src;
        modalImage.alt = data.title;

        // Catégorie
        const modalCategory = document.querySelector('.modal-category');
        modalCategory.textContent = data.category;

        // Titre
        const modalTitle = document.querySelector('.modal-title');
        modalTitle.textContent = data.title;

        // Description
        const modalDescription = document.querySelector('.modal-description');
        modalDescription.textContent = data.description;

        // Date de rendu
        const modalDate = document.querySelector('.modal-date');
        modalDate.textContent = data.date;

        // Collaborateurs
        const modalCollaborators = document.querySelector('.modal-collaborators');
        modalCollaborators.innerHTML = '';

        if (data.collaborators && data.collaborators.trim()) {
            const collaboratorsList = data.collaborators.split(',');
            collaboratorsList.forEach(collaborator => {
                const collaboratorItem = document.createElement('div');
                collaboratorItem.className = 'collaborator-item';
                collaboratorItem.textContent = collaborator.trim();
                modalCollaborators.appendChild(collaboratorItem);
            });
        } else {
            const noCollaborators = document.createElement('div');
            noCollaborators.className = 'collaborator-item';
            noCollaborators.textContent = 'Projet individuel';
            noCollaborators.style.fontStyle = 'italic';
            modalCollaborators.appendChild(noCollaborators);
        }

        // Outils
        const modalTools = document.querySelector('.modal-tools');
        modalTools.innerHTML = '';

        if (data.tools && data.tools.trim()) {
            const toolsList = data.tools.split(',');
            toolsList.forEach(tool => {
                const toolTag = document.createElement('span');
                toolTag.className = 'modal-tool-tag';
                toolTag.textContent = tool.trim();
                modalTools.appendChild(toolTag);
            });
        }

        // Récupérer les liens depuis la carte du projet
        const projectCard = document.querySelector(`[data-title="${data.title}"]`).closest('.project-card');
        const projectLinks = projectCard.querySelectorAll('.project-link');
        const modalProjectLinks = document.querySelector('.modal-project-links');
        modalProjectLinks.innerHTML = '';

        // Cloner les liens existants
        projectLinks.forEach(link => {
            const clonedLink = link.cloneNode(true);
            modalProjectLinks.appendChild(clonedLink);
        });
    }

    // Fonction pour initialiser les événements de la modal
    function initializeModalEvents() {
        // Événements pour les images cliquables
        document.querySelectorAll('.clickable-image').forEach(image => {
            image.addEventListener('click', function () {
                const projectData = {
                    title: this.dataset.title,
                    category: this.dataset.category,
                    description: this.dataset.description,
                    date: this.dataset.date,
                    collaborators: this.dataset.collaborators,
                    tools: this.dataset.tools,
                    src: this.dataset.src
                };

                openProjectModal(projectData);
            });
        });

        // Fermeture avec Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('projectModal');
                if (modal && modal.classList.contains('active')) {
                    closeProjectModal();
                }
            }
        });

        // Empêcher la fermeture quand on clique sur le contenu de la modal
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    }

    // Rendre les fonctions globales pour qu'elles soient accessibles depuis le HTML
    window.openProjectModal = openProjectModal;
    window.closeProjectModal = closeProjectModal;
    window.initializeModalEvents = initializeModalEvents;

    // Réinitialiser les événements après le filtrage des projets
    function reinitializeModalEvents() {
        // Supprimer les anciens événements
        document.querySelectorAll('.clickable-image').forEach(image => {
            image.removeEventListener('click', openProjectModal);
        });

        // Réajouter les événements
        initializeModalEvents();
    }

    // Appelez cette fonction au chargement et après navigation
    document.addEventListener('DOMContentLoaded', function () {
        updateActiveNavLink();

        // Ajoutez cet écouteur après la navigation
        window.addEventListener('popstate', updateActiveNavLink);
    });

    // Modifiez la fonction navigateTo
    function navigateTo(page) {
        if (page === 'home') page = 'index';
        if (page === currentPage) return;

        const transition = document.getElementById('pageTransition');
        if (transition) transition.classList.add('active');

        setTimeout(() => {
            window.location.href = `${page}.html`;
            updateActiveNavLink(); // Mettre à jour après navigation
        }, 300);
    }

    // Fonction pour appliquer view-fit à TOUS les PDFs automatiquement
    function applyViewFitToAllPDFs() {
        // Applique view-fit à tous les PDFs existants
        const pdfLinks = document.querySelectorAll('a[href$=".pdf"]');
        pdfLinks.forEach(link => {
            if (!link.href.includes('#')) {
                link.href += '#zoom=page-fit&view=Fit';
            }
        });

        // Observer pour les nouveaux PDFs ajoutés dynamiquement
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        // Vérifie les nouveaux liens PDF dans les nœuds ajoutés
                        const newPdfLinks = node.querySelectorAll ? node.querySelectorAll('a[href$=".pdf"]') : [];
                        newPdfLinks.forEach(link => {
                            if (!link.href.includes('#')) {
                                link.href += '#zoom=page-fit&view=Fit';
                            }
                        });

                        // Vérifie si le nœud lui-même est un lien PDF
                        if (node.tagName === 'A' && node.href && node.href.endsWith('.pdf') && !node.href.includes('#')) {
                            node.href += '#zoom=page-fit&view=Fit';
                        }
                    }
                });
            });
        });

        // Démarre l'observation
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialisation et application continue
    document.addEventListener('DOMContentLoaded', function () {
        applyViewFitToAllPDFs();

        // Réapplication périodique pour garantir 100% de couverture
        setInterval(applyViewFitToAllPDFs, 3000);
    });

    // Application immédiate si le DOM est déjà chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyViewFitToAllPDFs);
    } else {
        applyViewFitToAllPDFs();
    }

    // Activer la page courante au chargement
    document.addEventListener('DOMContentLoaded', function () {
        const homePages = ['home', 'index', ''];
        if (!homePages.includes(currentPage)) {
            const pageElement = document.getElementById(currentPage);
            if (pageElement) {
                pageElement.style.display = 'block';
                setTimeout(() => {
                    pageElement.classList.add('active');
                }, 10);
            }
        }

        // Project filtering
        if (document.querySelector('.projects-page')) {
            // Compter IMMÉDIATEMENT tous les projets au chargement
            const totalProjects = document.querySelectorAll('.project-card').length;
            const countElement = document.getElementById('projectsCount');
            if (countElement) {
                countElement.textContent = `${totalProjects} projets`;
            }

            filterProjects('all'); // Ensuite appliquer le filtre
            updateAllBadgeStacking();

            // Observateurs de mise à jour auto
            const cards = document.querySelectorAll('.project-card');

            // ResizeObserver: quand la carte change de taille (grid responsive, etc.)
            if (window.ResizeObserver) {
                const ro = new ResizeObserver(() => debouncedUpdateAll());
                cards.forEach(c => ro.observe(c));
            }

            // MutationObserver: quand display/class/style changent (ex: filtrage)
            const mo = new MutationObserver(debouncedUpdateAll);
            cards.forEach(c => mo.observe(c, { attributes: true, attributeFilter: ['class', 'style'] }));

            // Première passe
            updateAllBadgeStacking();

        }

        // Initialiser les événements de la modal
        if (document.querySelector('.projects-page')) {
            initializeModalEvents();
        }
    });
});

// À la toute fin du fichier script.js, AJOUTER :
window.addEventListener('load', function () {
    if (document.querySelector('.projects-page')) {
        const totalProjects = document.querySelectorAll('.project-card').length;
        const countElement = document.getElementById('projectsCount');
        if (countElement) {
            countElement.textContent = `${totalProjects} projets`;
        }
    }
});

// Fonctions pour les modales de projets
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêche le scroll de la page
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Réactive le scroll
    }
}

// Fermer la modale en cliquant à l'extérieur
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('project-modal')) {
        closeModal(e.target.id);
    }
});

// Fermer la modale avec la touche Échap
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.project-modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

// SYSTÈME DE MODAL DYNAMIQUE POUR TOUS LES PROJETS

// Base de données des logos pour les outils
const TOOL_LOGOS = {
    'Canva': 'tool-logos/canva.svg',
    'Google Docs': 'tool-logos/google-docs.svg',
    'Google Sheets': 'tool-logos/google-sheets.svg',
    'Google Slides': 'tool-logos/google-slides.svg',
    'Adobe Premiere Pro': 'tool-logos/adobe-premiere-pro.svg',
    'Adobe Illustrator': 'tool-logos/adobe-illustrator.svg',
    'Adobe Photoshop': 'tool-logos/adobe-photoshop.svg',
    'Adobe InDesign': 'tool-logos/adobe-indesign.svg',
    'Adobe XD': 'tool-logos/adobe-xd.svg',
    'WordPress': 'tool-logos/wordpress.svg',
    'Pinterest': 'tool-logos/pinterest.svg',
    'Cairn.info': 'tool-logos/cairn.svg',
    'ChatGPT Image': 'dynamic:chatgpt', // MODIFIÉ
    'DALL-E 3': 'dynamic:chatgpt', // MODIFIÉ
    'Sora': 'dynamic:chatgpt', // MODIFIÉ
    'CapCut': 'tool-logos/capcut.svg',
    'Figma': 'tool-logos/figma.svg',
    'Nano Banana': 'tool-logos/gemini.svg',
    'Google Veo 3': 'tool-logos/gemini.svg',
    'Code': 'tool-logos/claude.png',
};

// Base de données des informations spécifiques par projet
// CLÉ = valeur de l'attribut alt de l'image
const PROJECT_DATA = {
    // 1) Challenge de la com - 2026 (Stade Toulousain)
    'stade-toulousain-challenge': {
        date: 'Janvier 2026',
        time: '5 jours',
        teacher: 'Jean-Dominique DALLOZ',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Diya BHAVSAR', 'Naïma ALI SAÏD', 'Tokiana RAKOTONDRAFARA', 'Tom ROBERT', 'Lisa-Marie DA SILVA OLIVEIRA (coach)'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Stade-Toulousain-Challenge-Com-Presentation.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'devoirs/Stade-Toulousain-Challenge-Com-Dossier.pdf',
                text: 'Dossier final',
                icon: 'document'
            },
            {
                href: 'devoirs/Stade-Toulousain-Challenge-Com-Annexes.pdf',
                text: 'Annexes',
                icon: 'document'
            }
        ],
        description: `Ce projet s’inscrit dans le cadre du <mark>Challenge National de la Communication 2026</mark>, 
            un concours inter-universitaire réunissant les meilleurs étudiants en communication de France. 
            Notre équipe a élaboré une recommandation stratégique complète pour le Stade Toulousain, 
            club de rugby le plus titré d’Europe.
            <br><br>
            L’objectif était de développer une stratégie de communication innovante pour renforcer 
            l’attractivité du club auprès des nouvelles générations, tout en consolidant son ancrage 
            territorial et son rayonnement international. Notre recommandation propose des actions 
            concrètes pour moderniser l’image du club tout en préservant ses valeurs historiques 
            d’excellence et de convivialité.
            <br><br>
            Avant la finale nationale à Toulouse, une sélection interne a été organisée au sein de 
            notre IUT pour désigner l’équipe représentante : nous avons terminé à la <mark>3ème place</mark> de 
            cette phase locale.`
    },
    // 2) Challenge de la com - 2025 (Verifone)
    'verifone-challenge': {
        date: 'Mars 2025',
        time: '1 semaine',
        teacher: 'Jean-Dominique DALLOZ',
        authors: ['Sami BENDRISS', 'Liliane MADJITEY-PELLET', 'Elsa MAGISTER', 'Lucy PIROT', 'Fitia RAHARIMALALA', 'Clara RAKOTOMAVO', 'Marc BOURGOIS (coach)'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Verifone-Challenge-Com-Presentation.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'devoirs/Verifone-Challenge-Com-Dossier.pdf',
                text: 'Dossier final',
                icon: 'document'
            },
            {
                href: 'devoirs/Verifone-Challenge-Com-Annexes.pdf',
                text: 'Annexes',
                icon: 'document'
            }
        ],
        description: `Ce projet s’inscrit dans le cadre du <mark>Challenge Local de la Communication 2025</mark>, 
            un concours interne organisé par notre IUT. Notre équipe a élaboré une recommandation 
            stratégique complète pour Verifone, leader mondial des solutions de paiement électronique.
            <br><br>
            L’objectif était de développer une stratégie de communication innovante pour renforcer 
            la présence de Verifone sur le marché français, en mettant l’accent sur leurs nouvelles 
            solutions de paiement sans contact, ainsi que sur leurs services pour les commerçants.`
    },
    // 3) Pontseine - Communication politique (déplacé ici depuis la fin)
    'pontseine': {
        date: 'Octobre 2025 - Décembre 2025',
        time: '2 mois',
        teacher: 'Nadia HATHROUBI-SAFSAF',
        authors: ['TP1 - 3ème année, promotion 2025-2026'],
        tools: ['Canva', 'Google Docs', 'Code', 'Nano Banana'],
        links: [
            {
                href: 'devoirs/Pontseine-Dossier-SAE-Politique.pdf',
                text: 'Voir le dossier',
                icon: 'document'
            },
            {
                href: 'devoirs/Pontseine-Presentation-SAE-Politique.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'https://pontseine2026.netlify.app/',
                text: 'Voir le site de campagne',
                icon: 'external'
            }
        ],
        description: `Dossier complet et présentation pour une <mark>campagne de communication politique</mark> pour Pontseine,
            intégrant stratégie électorale, messages clés, plan média et déploiement des actions de campagne. Ce
            projet développe une approche professionnelle de la communication politique territoriale.
            <br><br>
            La stratégie comprend diagnostic du territoire, positionnement politique, construction narrative du
            candidat, identification des cibles électorales, et déploiement multicanal (réseaux sociaux, médias
            traditionnels, événements de proximité, supports imprimés) pour maximiser l’impact de la campagne.`
    },
    // 4) Maison Populaire de Montreuil
    'maison-populaire': {
        date: 'Septembre 2024 - Mars 2025',
        time: '7 mois',
        teacher: 'Cyril JACQUEL',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI'],
        tools: ['Google Docs', 'Adobe Premiere Pro', 'Canva'],
        links: [
            {
                href: 'devoirs/Maison-Populaire-SAE-Communication.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'https://www.instagram.com/maisonpopulaire/reel/DG3V7H0AR8Q/',
                text: 'Voir la vidéo',
                icon: 'external'
            }
        ],
        description: `Projet tuteuré en collaboration avec la Maison Populaire de Montreuil, un lieu culturel 
            emblématique de la Seine-Saint-Denis. Notre mission était de concevoir et réaliser une 
            stratégie de communication pour le <mark>Pop[lab]</mark>, leur espace dédié à la création numérique 
            et aux nouvelles technologies.
            <br><br>
            Le projet a culminé avec la création d’une <mark>vidéo promotionnelle créative</mark>, diffusée sur 
            leurs réseaux sociaux pour valoriser les activités du Pop[lab] et attirer un public 
            jeune vers ce lieu d’innovation culturelle.`
    },
    // 5) KREDEN - Conseil et marque
    'kreden': {
        date: 'Novembre 2025 - Janvier 2026',
        time: '2 mois',
        teacher: 'Marc BOURGOIS',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Diya BHAVSAR'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Kreden-Recommandation.pdf',
                text: 'Voir la recommandation',
                icon: 'document'
            }
        ],
        description: `Recommandation d’agence complète pour KREDEN, développant une stratégie de marque et un
            positionnement stratégique adapté aux objectifs de l’entreprise. Ce projet de <mark>conseil en communication
            et branding</mark> propose une analyse approfondie de l’identité de marque et des axes de développement.
            <br><br>
            La recommandation intègre diagnostic de marque, étude concurrentielle, définition du territoire de
            communication, plateforme de marque et déclinaison opérationnelle des actions à mettre en œuvre pour
            renforcer la présence et la cohérence de KREDEN sur son marché.`
    },
    // 6) Maison Francis Kurkdjian - Communication 360°
    'maison-francis-kurkdjian': {
        date: 'Novembre 2025 - Janvier 2026',
        time: '2 mois',
        teacher: 'Lisa-Marie DA SILVA OLIVEIRA',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Diya BHAVSAR', 'Céline SALLOUM', 'Naïma ALI SAÏD'],
        tools: ['Canva', 'Google Docs', 'Nano Banana', 'Google Veo 3'],
        links: [
            {
                href: 'devoirs/Maison-Francis-Kurkdjian-SAE-Communication-360.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'https://drive.google.com/file/d/1caQx_IAeBrm3eS8ybsQPwR6IByF6KHWF/view?usp=drive_link',
                text: 'Voir la vidéo',
                icon: 'external'
            }
        ],
        description: `Stratégie de communication 360° complète pour la Maison Francis Kurkdjian, <mark>marque de
            parfumerie de luxe</mark> créée par le célèbre parfumeur Francis Kurkdjian. Ce projet développe une approche
            globale et innovante intégrant tous les canaux de communication pour renforcer la notoriété et l’image
            de prestige de la maison.
            <br><br>
            La stratégie 360° englobe la communication digitale, événementielle, relationnelle et médias, avec un
            positionnement affirmé dans l’univers du luxe créatif et de l’excellence artisanale française.`
    },
    // 7) La Fabrique Cookies - Proposer une recommandation
    'fabrique-cookies': {
        date: 'Octobre 2024 - Janvier 2025',
        time: '3 mois',
        teacher: 'Marc BOURGOIS',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Fabrique-Cookies-Recommandation.pdf',
                text: 'Voir la recommandation',
                icon: 'document'
            }
        ],
        description: `Élaboration d’une recommandation stratégique complète pour “La Fabrique Cookies”, 
            <mark>entreprise artisanale de cookies</mark> créée en 2012. Face à la domination des grandes surfaces 
            sur le marché du biscuit, notre mission était de proposer une stratégie de communication pour 
            <mark>différencier la marque</mark> grâce à son authenticité et son positionnement premium.
            <br><br>
            Notre recommandation finale développe un plan d’action 360° autour de notre campagne « La véritable 
            recette du cookie : vous serez toujours plus heureux avec le moelleux ! ».`
    },
    // 8) Nestlé - Communication sensible
    'nestle': {
        date: 'Octobre 2025 - Décembre 2025',
        time: '2 mois',
        teacher: 'Martine SAVARY',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Diya BHAVSAR'],
        tools: ['Canva', 'Google Docs', 'Code'],
        links: [
            {
                href: 'devoirs/Nestle-Dossier-SAE-Communication-sensible.pdf',
                text: 'Voir le dossier',
                icon: 'document'
            },
            {
                href: 'devoirs/Nestle-Presentation-SAE-Communication-sensible.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'https://nestle-engagements-audits.netlify.app/',
                text: 'Voir notre page « Engagements et audits »',
                icon: 'external'
            }
        ],
        description: `Stratégie de communication sensible pour Nestlé, <mark>leader mondial de l’agroalimentaire</mark> confronté
            à de nombreuses controverses (eau, nutrition infantile, durabilité). Ce projet aborde les sujets délicats
            avec une approche éthique, responsable et transparente, dans un contexte de défiance croissante des
            consommateurs.
            <br><br>
            La communication sensible développée propose des réponses stratégiques aux critiques légitimes, tout en
            valorisant les engagements positifs de l’entreprise. Le projet explore les enjeux de réputation, de
            légitimité et de reconstruction de la confiance dans un environnement médiatique complexe et scruté.`
    },
    // 9) Talaria - Webdesign
    'talaria-webdesign': {
        date: 'Février 2025 - Mai 2025',
        time: '4 mois',
        teacher: 'Stan VINCENT',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT'],
        tools: ['Adobe Illustrator', 'Adobe XD', 'Pinterest', 'Google Docs', 'Canva'],
        links: [
            {
                href: 'devoirs/Webdesign-Application-Talaria.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'https://xd.adobe.com/view/26046bc8-d95d-4ec5-ad3e-1bb1c9e8bd7c-7357/?fullscreen',
                text: 'Voir la démo',
                icon: 'external'
            }
        ],
        description: `Conception d’une application mobile éducative <mark>destinée aux 11-15 ans</mark> pour les guider 
            dans l’univers de l’influence numérique. Talaria fonctionne comme une encyclopédie interactive 
            où chaque influenceur est évalué via une “grille de légitimité” basée sur des critères éthiques 
            et d’engagement.
            <br><br>
            Le projet intègre un <mark>univers mythologique captivant</mark> associant les différents types d’influenceurs 
            aux Muses grecques, avec un système de gamification complet (badges, certificats, avatar évolutif). 
            L’objectif : développer l’esprit critique des adolescents face aux pratiques peu éthiques, 
            tout en rendant l’apprentissage ludique et engageant.`
    },
    // 10) CNRS - Podcast “Ça s’explique !”
    'cnrs': {
        date: 'Novembre 2025',
        time: '3 semaines',
        teacher: 'Doria LE FUR',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Diya BHAVSAR', 'Céline SALLOUM', 'Yasmine LERANDY'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/CNRS-Podcast-Communication-scientifique.pdf',
                text: 'Voir le projet',
                icon: 'document'
            }
        ],
        description: `Plan de communication pour le lancement d’un <mark>nouveau podcast pour le CNRS</mark> (Centre National de la 
            Recherche Scientifique), inspiré de l’émission « La Terre au carré » de France Inter. Ce podcast met en avant 
            des chercheurs de toutes disciplines scientifiques à travers des interviews accessibles au grand public.
            <br><br>
            Notre podcast s’appelle <mark>« Ça s’explique ! »</mark>, et le projet comprend notamment la réalisation d’un 
            plan de communication détaillé avec diagramme de Gantt, la création d’une charte graphique, un visuel de lancement 
            et un communiqué de presse. Le tout avec un budget de 15.000€ et un délai de 3 mois pour monter et lancer le projet.`
    },
    // 11) Jacquemus X L’Oréal - Communication numérique
    'jacquemus-loreal': {
        date: 'Février 2025 - Avril 2025',
        time: '3 mois',
        teacher: 'Julia ROSSELLO',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY'],
        tools: ['Canva', 'ChatGPT Image', 'Sora'],
        links: [
            {
                href: 'devoirs/Jacquemus-Loreal-Strategie-Numerique.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            },
            {
                href: 'https://drive.google.com/file/d/16m-gwigDPblYaJrPwmHWvMgSfdYX-KIx/view?usp=sharing',
                text: 'Voir le teaser',
                icon: 'external'
            }
        ],
        description: `Projet de stratégie de communication digitale pour une collaboration fictive entre Jacquemus 
            et L’Oréal autour de la création d’un parfum fictif que nous avons nommé <mark>« Trésor Partagé »</mark>. Cette alliance 
            imaginaire unit la créativité méditerranéenne de Simon Porte Jacquemus avec l’expertise beauté mondiale de L’Oréal.
            <br><br>
            Le projet développe une stratégie digitale 360° complète incluant analyse des marques, étude du marché du parfum 
            de luxe, et création d’un univers narratif puissant. La campagne raconte l’histoire de deux hommes qui 
            se rejoignent pour découvrir ensemble un trésor, métaphore de la collaboration créative entre les deux maisons.`
    },
    // 12) IKEA - RSOCD
    'ikea': {
        date: 'Octobre 2025',
        time: '2 semaines',
        teacher: 'Jean-Dominique DALLOZ',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Diya BHAVSAR'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/IKEA-Communication-durable.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            }
        ],
        description: `Stratégie de communication durable pour IKEA, <mark>géant suédois du mobilier</mark> qui vise à devenir circulaire 
            et climatiquement positif d’ici 2030. Ce projet analyse les initiatives existantes d’IKEA en matière de durabilité et propose 
            une stratégie de communication adaptée à leur présence internationale.
            <br><br>
            Notre stratégie répond aux <mark>défis majeurs d’IKEA</mark> : concilier son image abordable avec des pratiques durables, 
            éviter les accusations de greenwashing malgré son modèle de consommation de masse, et encourager l’adoption 
            de comportements responsables (réparation, réutilisation, recyclage) tout en maintenant l’activité commerciale.`
    },
    // 13) Magazine MOD
    'mod-magazine': {
        date: 'Février 2024 - Juin 2024',
        time: '5 mois',
        teacher: 'Stan VINCENT',
        authors: ['TP3 - 1ère année, promotion 2023-2024'],
        tools: ['WordPress', 'Pinterest', 'Adobe Illustrator', 'Google Docs'],
        links: [
            {
                href: 'https://www.mod.atelier.xzstudio.fr/',
                text: 'Voir le site',
                icon: 'external'
            }
        ],
        description: `<mark>Création collaborative</mark> d’un magazine en ligne “Mode Of the Day” (MOD) réalisé 
            collectivement par l’ensemble du TP3 de première année, soit un groupe de 15 étudiants. 
            Ce projet de stratégie éditoriale explore l’univers de la mode et du lifestyle à travers 
            une approche moderne et créative, développant une ligne éditoriale cohérente et engageante.
            <br><br>
            Le magazine digital propose une <mark>expérience utilisateur complète</mark> avec articles de fond, 
            tendances mode, conseils lifestyle et contenus visuels soignés. Cette réalisation collective 
            illustre la capacité du groupe à coordonner un projet éditorial d’envergure, de la conception 
            graphique à la publication web, en passant par la rédaction et la curation de contenu.`
    },
    // 14) Clip vidéo Yseult
    'clip-video-audivisuel': {
        date: 'Novembre 2024 - Janvier 2025',
        time: '8 semaines',
        teacher: 'Bérénice ANDRÉ',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY'],
        tools: ['Google Docs', 'Adobe Premiere Pro', 'Canva'],
        links: [
            {
                href: 'https://www.youtube.com/watch?v=BIF5HjG62zo',
                text: 'Voir le clip',
                icon: 'external'
            }
        ],
        description: `Projet audiovisuel réalisé autour de <mark>la chanson « Indélébile » d’Yseult</mark>, conçu comme une campagne 
            publicitaire (fictive) pour un podcast “Survivre aux éclats” en collaboration avec le média Slate. Ce clip explore 
            les thèmes de l’amour, de la rupture et de la reconstruction personnelle.
            <br><br>
            Le projet se distingue par une <mark>approche narrative sophistiquée</mark>, filmé dans des lieux emblématiques parisiens, 
            et l’intégration d’extraits vocaux authentiques de témoignages sur les relations amoureuses. Cette réalisation 
            combine profondeur émotionnelle et excellence technique pour encourager la parole sur les questions sentimentales.`
    },
    // 15) Santé publique France - Campagne publicitaire
    'sante-publique-france': {
        date: 'Novembre 2024 - Décembre 2024',
        time: '6 semaines',
        teacher: 'Bérénice ANDRÉ',
        authors: ['Sami BENDRISS', 'Candice DANIEL', 'Dylan MICHINEAU', 'Fanta SYLLA'],
        tools: ['Google Docs', 'Canva', 'DALL-E 3'],
        links: [
            {
                href: 'devoirs/Sante-Publique-France-Campagne.pdf',
                text: 'Voir la campagne',
                icon: 'document'
            }
        ],
        description: `Campagne de communication audiovisuelle pour “Santé publique France” sur <mark>la sensibilisation 
            à l’hyperconnexion</mark> pendant les fêtes de fin d’année, avec le slogan « Choisir le réel, c’est partager l’essentiel ! ». 
            Le projet met en scène un père gamer confronté au dilemme entre son univers virtuel et les moments familiaux du réveillon.
            <br><br>
            Cette réalisation complète comprend pitch émotionnel, scénario détaillé, storyboard professionnel, et direction 
            artistique élaborée. <mark>L’approche humoristique</mark> et optimiste évite la culpabilisation tout en invitant à privilégier 
            les liens humains authentiques face aux risques de l’isolement numérique.`
    },
    // 16) SHS - Enquête par observation
    'shs': {
        date: 'Avril 2025',
        time: '3 semaines',
        teacher: 'Marc KAISER',
        authors: ['Sami BENDRISS'],
        tools: ['Google Docs', 'Cairn.info'],
        links: [
            {
                href: 'devoirs/SHS-Enquete-terrain.pdf',
                text: 'Voir le rapport',
                icon: 'document'
            }
        ],
        description: `Enquête de terrain en Sciences Humaines et Sociales répondant à la problématique suivante : 
            <mark>« Comment l’orientation politique de la mairie influence l’organisation de l’espace urbain ? »</mark>. 
            J’ai comparé deux quartiers aux orientations politiques opposées : les 4000 Sud à La Courneuve 
            (ville orientée à gauche) et le Mail à Vélizy-Villacoublay (ville orientée à droite).
            <br><br>
            L’observation a confirmé trois hypothèses : les espaces publics sont plus collectifs à gauche et plus 
            ordonnés/privatisés à droite ; la mobilité privilégie les transports collectifs à gauche et l’automobile 
            à droite ; l’économie locale favorise le commerce de proximité à gauche et les zones commerciales 
            importantes à droite. L’analyse s’appuie sur Lefebvre et Topalov pour montrer que <mark>l’espace urbain 
            traduit les idéologies dominantes</mark>.`
    },
    // 17) TPM Montreuil - Communication culturelle
    'tpm-theatre': {
        date: 'Novembre 2024',
        time: '3 semaines',
        teacher: 'Marine SEGUI',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI'],
        tools: ['Google Docs', 'Google Sheets', 'Canva'],
        links: [
            {
                href: 'devoirs/TPM-Communication-Culturelle-Dossier.pdf',
                text: "Voir le dossier",
                icon: 'document'
            },
            {
                href: 'devoirs/TPM-Communication-Culturelle-Presentation.pdf',
                text: "Voir la présentation",
                icon: 'document'
            }
        ],
        description: `Création d’un appel à projet pour le <mark>dispositif « Arthécimus » du Théâtre Public de Montreuil</mark>, 
            ciblant des enfants de 10 à 11 ans issus de deux centres de loisirs. Le projet s’articule autour 
            de la pièce théâtrale “Peau d’âne - La fête est finie” et vise à sensibiliser sur les violences 
            familiales tout en développant l’expression artistique des enfants.
            <br><br>
            L’initiative comprend 8 phases structurées : de l’initiation théâtrale à l’exposition finale, en passant 
            par la création d’une fresque collective murale. <mark>Entièrement subventionné par la mairie de Montreuil</mark>, 
            le projet mobilise des professionnels du théâtre, des arts plastiques et de la prévention pour offrir 
            une expérience culturelle complète et éducative.`
    },
    // 18) Xing Fu Tang - Marketing
    'xing-fu-tang': {
        date: 'Décembre 2024 - Janvier 2025',
        time: '4 semaines',
        teacher: 'Yann LE GALL',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI'],
        tools: ['Google Docs', 'Canva'],
        links: [
            {
                href: 'devoirs/Xing-Fu-Tang-Marketing.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            }
        ],
        description: `Élaboration d’un <mark>plan de marchéage complet</mark> pour l’enseigne de bubble tea “Xing Fu Tang”, 
            chaîne premium taïwanaise spécialisée dans les boissons artisanales aux perles de tapioca. Cette analyse 
            marketing approfondie examine la stratégie globale de la marque fondée en 2018, qui s’est rapidement 
            imposée comme l’une des références mondiales du secteur avec plus de 150 boutiques dans 18 pays.
            <br><br>
            L’analyse développe une <mark>double approche méthodologique</mark> : l’étude des 4P traditionnels et l’analyse des 4E modernes. 
            Cette démarche permet d’analyser la cohérence stratégique de Xing Fu Tang, ainsi que de proposer à l’enseigne 
            des préconisations concrètes.`
    },
    // 19) Mercredi (Netflix) - Expression écrite et orale
    'mercredi-netflix': {
        date: 'Décembre 2024 - Janvier 2025',
        time: '6 semaines',
        teacher: 'Viviane CLAUS',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY'],
        tools: ['Canva', 'Google Docs', 'Google Sheets'],
        links: [
            {
                href: 'devoirs/Evenement-Mercredi-Brochure.pdf',
                text: 'Voir la brochure',
                icon: 'external'
            },
            {
                href: 'devoirs/Evenement-Mercredi-Presentation.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            }
        ],
        description: `Organisation complète d’un <mark>événement promotionnel fictif pour Netflix</mark>, célébrant la 
			sortie de la saison 2 de la série “Mercredi”. Ce projet d’envergure simule la création d’une 
			soirée de lancement premium au Montmanoir de Montlignon, un château du XIXe siècle, que nous 
			avons choisi pour son esthétique gothique qui est parfaitement alignée avec l’univers de la série.
			<br><br>
			Le concept développé propose une <mark>expérience immersive</mark> de 9 heures pour 120 invités VIP, incluant 
			de nombreuses surprises activités pour un moment mémorable en cette effrayante soirée d’Halloween.`
    },
    // 20) Magazin Insurrection - Gazette fictive
    'magazine-insurrection': {
        date: 'Mars 2024 - Mai 2024',
        time: '3 mois',
        teacher: 'Hélène MOREAU',
        authors: ['Sami BENDRISS', 'Ariana SEPAHPOUR-FARD'],
        tools: ['Adobe InDesign', 'Google Docs', 'Pinterest'],
        links: [
            {
                href: 'devoirs/Magazine-Insurrection-Gazette.pdf',
                text: 'Voir le magazine',
                icon: 'document'
            }
        ],
        description: `Production de la gazette fictive <mark>“Insurrection”</mark>, 
            qui positionne l’art comme arme de résistance contre l’oppression et l’injustice sociale. 
            Ce magazine engagé explore différentes formes d’expression artistique révolutionnaire à 
            travers trois articles principaux mêlant cinéma, peinture et musique.
            <br><br>
            Le magazine analyse le film <mark>“Chroniques de Téhéran”</mark> d’Ali Asgari et Alireza Khatami, 
            critique humoristique des absurdités de la vie sous la dictature iranienne. Il présente également le 
            portrait du peintre congolais Chéri Samba et son art narratif coloré, ainsi qu’un hommage 
            à Bob Marley, icône culturelle et politique de la résistance.`
    },
    // 21) Cahier de tendances - Tourisme
    'cahier-tendances': {
        date: 'Novembre 2024 - Décembre 2024',
        time: '8 semaines',
        teacher: 'Hélène MOREAU',
        authors: ['Sami BENDRISS', 'Céline SALLOUM'],
        tools: ['Google Docs', 'Canva', 'Pinterest'],
        links: [
            {
                href: 'devoirs/Cahier-Tendances-Tourisme.pdf',
                text: 'Voir le cahier de tendances',
                icon: 'document'
            }
        ],
        description: `Création d’un cahier de tendances sur <mark>l’évolution du secteur touristique en 2024-2025</mark>, 
			analysant six tendances majeures qui redéfinissent les pratiques de voyage contemporaines. Cette étude 
			explore les destinations “dupes”, l’influence des médias sur les choix touristiques, et la 
			montée de la conscience environnementale chez les voyageurs.
			<br><br>
			Notre document développe une <mark>analyse approfondie des nouvelles formes de tourisme</mark> incluant la quête 
			d’authenticité, l’essor du tourisme d’aventure et l’intégration massive des technologies digitales. 
			Cette recherche s’appuie sur des données statistiques concrètes et des observations comportementales, 
			afin d’anticiper les évolutions futures du marché touristique français et international.`
    },
    // 22) Disney - Management de la performance
    'disney': {
        date: 'Janvier 2025 - Mars 2025',
        time: '7 semaines',
        teacher: 'Yann LE GALL',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI'],
        tools: ['Google Docs', 'Canva'],
        links: [
            {
                href: 'devoirs/Disney-Management-Performance.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            }
        ],
        description: `Élaboration d’une analyse complète du management de la performance de The Walt Disney Company
			après les <mark>transformations stratégiques majeures</mark> qui sont entreprises depuis 2023. Le projet examine les impacts de la 
			restructuration organisationnelle, des licenciements massifs et de la réorganisation du groupe en 3 
			segments distincts : ESPN, Disney Entertainment ainsi que Disney Parks, Experiences and Products.
			<br><br>
			L’étude développe une <mark>évaluation détaillée des conséquences sur la performance globale du groupe</mark>, analysant 
			les résultats financiers positifs mais aussi les tensions sociales et l’insatisfaction clientèle. Le travail 
            propose 6 préconisations stratégiques incluant l’amélioration de la communication interne, la révision 
            tarifaire des parcs et le renforcement des contenus locaux européens.`
    },
    // 23) Patrick Roger - Communication événementielle
    'patrick-roger': {
        date: 'Décembre 2024',
        time: '2 heures 30 minutes',
        teacher: 'Lisa-Marie DA SILVA OLIVEIRA',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY', 'Céline SALLOUM'],
        tools: ['Canva'],
        links: [
            {
                href: 'devoirs/Patrick-Roger-Communication-Evenementielle.pdf',
                text: 'Voir la stratégie',
                icon: 'document'
            }
        ],
        description: `Stratégie de communication événementielle sur <mark>la soirée de lancement des nouvelles créations</mark> du chocolatier 
			Patrick Roger. Le projet développe un concept créatif innovant mêlant défilé de mode et gastronomie de luxe, 
			transformant le Petit Palais en forêt mystérieuse avec décors immersifs, sculptures chocolatées monumentales 
			et mannequins portant des accessoires en chocolat dans un univers “Dark Forest”.
			<br><br>
			La recommandation stratégique propose une <mark>expérience premium complète</mark> incluant cocktail VIP, défilé thématique 
			avec orchestre en live, sculpture en direct par l’artiste et moments de dégustation exclusive. Cette approche 
			360° positionne le chocolat comme une véritable œuvre d’art, renforçant l’image de marque innovante et exclusive 
			de Patrick Roger auprès d’une clientèle haut de gamme, médias spécialisés et influenceurs du secteur luxe.`
    },
    // 24) Recueil de textes - Expression écrite et orale
    'recueil-textes': {
        date: 'Septembre 2024 - Avril 2025',
        time: '8 mois',
        teacher: 'Viviane CLAUS',
        authors: ['Sami BENDRISS'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Recueil-Textes-Sami.pdf',
                text: 'Voir le recueil',
                icon: 'document'
            }
        ],
        description: `Document créatif qui présente <mark>l’ensemble de mes textes écrits</mark> durant l’année scolaire
			2024-2025, pendant les cours d’Expression écrite et orale. Ce recueil rassemble 9 créations littéraires
			variées, allant du slam personnel aux chroniques créatives, en passant par des textes libres et des
			comptes-rendus professionnels, illustrant la diversité des exercices rédactionnels proposés.
			<br><br>
			Cette compilation témoigne du développement des <mark>compétences créatives et rédactionnelles</mark> à travers des
			formats multiples : monologue d’un monument historique, réflexions dystopiques, règles de vie inspirées
			de Maylis de Kerangal, et analyse d’une table ronde sur l’éducation culturelle. Un parcours d’écriture
			complet mêlant créativité personnelle et rigueur académique dans un cadre bienveillant d’expression libre.`
    },
    // --- //
    // --- //
    // Buitoni - Stratégie de communication
    'buitoni': {
        date: 'Mars 2025 - Avril 2025',
        time: '6 semaines',
        teacher: 'Manuel HOUSSAIS',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY', 'Céline SALLOUM'],
        tools: ['Google Docs', 'Cairn.info', 'Canva'],
        links: [
            {
                href: 'devoirs/Buitoni-Strategie-com.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            }
        ],
        description: `Analyse approfondie de la stratégie de communication du scandale Buitoni de 2022, 
			avec une montée en généralité via des concepts théoriques scientifiques. Cette étude 
			examine les défaillances dans les systèmes de contrôle et de gestion des risques révélées 
			par la crise sanitaire liée aux pizzas contaminées à la bactérie E. coli.
			<br><br>
			Le projet développe une problématique complexe interrogeant la gouvernance des risques 
			alimentaires et la confiance des consommateurs dans un contexte de production globalisée. 
			L’analyse s’articule autour de trois concepts théoriques majeurs : dynamiques institutionnelles, 
			construction médiatique du risque et enjeux de la sécurité sanitaire mondialisée.`
    },
    // Pomme à Paume - Plan de communication
    'pomme-a-paume': {
        date: 'Février 2024 - Mai 2024',
        time: '4 mois',
        teacher: 'Marc BOURGOIS',
        authors: ['Sami BENDRISS', 'Céline SALLOUM', 'Awa DEMBELE', 'Kevin TUAU'],
        tools: ['Canva', 'Google Docs', 'DALL-E 3'],
        links: [
            {
                href: 'devoirs/Pomme-Paume-Plan-Communication.pdf',
                text: 'Recommandation',
                icon: 'document'
            }
        ],
        description: `Création d’un plan de communication complet pour l’association “Pomme à Paume”, 
			organisation récemment fondée basée à Melun qui apporte un soutien essentiel aux étudiants 
			en situation de précarité, particulièrement ceux issus des banlieues, ainsi qu’aux sans-abri.
            <br><br>
			Face à la concurrence féroce d’associations bien établies comme Action contre la Faim et COP1, 
			notre projet développe une stratégie de communication 360° autour de la campagne « Ensemble, 
			bâtissons un avenir meilleur ».`
    },
    // Engie - Communication de crise
    'engie': {
        date: 'Décembre 2023 - Janvier 2024',
        time: '4 semaines',
        teacher: 'Jean-Dominique DALLOZ',
        authors: ['Sami BENDRISS'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Engie-Communication-Crise.pdf',
                text: 'Voir la stratégie',
                icon: 'document'
            }
        ],
        description: `Élaboration d’une stratégie complète de communication de crise pour Engie Home Services 
			face au scandale (fictif) des chaudières Viessmann. Ce projet développe une réponse organisationnelle 
			structurée incluant reconnaissance des faits, gestion des parties prenantes, communication externe 
			vers les médias et pouvoirs publics, et protection du personnel sur le terrain.
			<br><br>
			La stratégie couvre l’ensemble du processus de gestion de crise depuis la constitution d’une cellule 
			dédiée jusqu’au soutien aux victimes, en passant par une enquête collaborative avec des experts. 
			Cette simulation réaliste intègre tous les aspects cruciaux de la communication de crise moderne : 
			transparence, empathie, responsabilité et reconstruction de la confiance publique.`
    },
    // Yves Rocher - Communication numérique
    'yves-rocher': {
        date: 'Janvier 2025 - Février 2025',
        time: '3 semaines',
        teacher: 'Julia ROSSELLO',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY', 'Céline SALLOUM'],
        tools: ['Canva', 'Google Docs'],
        links: [
            {
                href: 'devoirs/Yves-Rocher-Communication-Numerique.pdf',
                text: 'Voir la présentation',
                icon: 'document'
            }
        ],
        description: `Analyse complète de la proposition de valeurs et de la stratégie digitale de l’enseigne “Yves Rocher”. 
			Le projet examine la marque de cosmétique végétale bretonne, fondée en 1959, présente dans 91 pays avec 2300 magasins 
			mondiaux, en décryptant sa mission de « reconnecter les femmes et les hommes à la nature » et ses valeurs d’engagement, 
			respect, exigence et passion pour une beauté accessible et responsable.
			<br><br>
			L’étude développe une analyse approfondie de la stratégie digitale multi-plateforme avec des innovations comme les 
            TikTok Video Shopping Ads, diagnostics peau interactifs et centralisation de 22 sites internationaux. Cette approche 360° 
            positionne Yves Rocher comme leader de la cosmétique végétale éthique, combinant accessibilité tarifaire, engagement 
            écologique fort et expérience client personnalisée omnicanale.`
    },
    // ShopNow - Communication interne
    'shopnow': {
        date: 'Novembre 2024',
        time: '3 heures',
        teacher: 'Céline LASHERMES',
        authors: ['Sami BENDRISS', 'Imen TAMOUNEIT', 'Léa KACEMI', 'Yasmine LERANDY'],
        tools: ['Canva'],
        links: [
            {
                href: 'devoirs/ShopNow-Communication-Interne.pdf',
                text: 'Voir la stratégie',
                icon: 'document'
            }
        ],
        description: `Création d’une stratégie de communication interne complète pour l’entreprise fictive 
			“ShopNow”, spécialisée dans le e-commerce. Face à une problématique de désengagement des salariés 
			et de turn-over croissant, le projet développe une approche structurée pour renforcer la cohésion 
			et stimuler la productivité à travers trois objectifs principaux.
			<br><br>
			La stratégie proposée s’articule autour de la valorisation humaine, du renforcement de la cohésion 
			d’équipe et du développement du sentiment d’appartenance. Le plan d’action intègre formation des 
			managers, programme de reconnaissance, événements conviviaux et communication bidirectionnelle, 
			avec un système de feedback trimestriel pour mesurer l’efficacité des actions mises en œuvre.`
    },

};

// Fonction pour déterminer la classe CSS selon la catégorie
function getCategoryClass(dataCategory) {
    const key = (dataCategory || '')
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')  // enlève les accents
        .toLowerCase();
    if (key === 'strategies') return 'modal-strategies';
    if (key === 'creations') return 'modal-creations';
    if (key === 'analyses') return 'modal-analyses';
    return 'modal-default';
}

// Fonction pour ouvrir la modal dynamique
function openDynamicModal(projectCard) {
    const modal = document.getElementById('dynamic-project-modal');

    // Extraire les données de la project-card
    const projectData = extractProjectData(projectCard);

    // AJOUTER : Supprimer toutes les classes de catégorie existantes
    modal.classList.remove('modal-strategies', 'modal-creations', 'modal-analyses');

    // AJOUTER : Ajouter la classe correspondante à la catégorie
    const categoryClass = getCategoryClass(projectCard.getAttribute('data-category'));
    if (categoryClass !== 'modal-default') {
        modal.classList.add(categoryClass);
    }

    // === Badge catégorie (actif pour TOUS les projets) ===
    const catBadgeEl = document.getElementById('modal-dynamic-catbadge');
    if (catBadgeEl) {
        const rawCat = projectCard.getAttribute('data-category') || '';
        const key = rawCat.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const labelMap = { strategies: 'Stratégies', creations: 'Créations', analyses: 'Analyses' };
        catBadgeEl.textContent = labelMap[key] || rawCat;
        catBadgeEl.style.display = 'inline-flex';
    }

    // Remplir la modal avec les données
    populateDynamicModal(projectData);

    // AJOUTER : Remettre le scroll en haut de la modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }

    // Afficher la modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        modal.classList.add('active');

        // AJOUTER : Double vérification après l'animation
        setTimeout(() => {
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
        }, 50);
    }, 10);
}

// Fonction pour ferrer la modal dynamique
function closeDynamicModal() {
    const modal = document.getElementById('dynamic-project-modal');

    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Fonction pour extraire les données d'une project-card
function extractProjectData(projectCard) {
    const image = projectCard.querySelector('.project-image img');
    const title = projectCard.querySelector('.project-title');
    const category = projectCard.querySelector('.project-category');
    const level = projectCard.getAttribute('data-level');

    // Convertir le niveau en texte
    const levelText = {
        'but1': 'BUT 1',
        'but2': 'BUT 2',
        'but3': 'BUT 3'
    }[level] || 'BUT';

    // Extraire et nettoyer l'alt pour la clé
    let projectKey = '';
    if (image && image.alt) {
        projectKey = image.alt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    return {
        image: image ? image.src : '',
        imageAlt: image ? image.alt : '',
        title: title ? title.textContent.trim() : '',
        category: category ? category.textContent.trim() : '',
        level: levelText,
        projectKey: projectKey // Clé pour chercher dans PROJECT_DATA
    };
}

// Fonction pour générer les icônes SVG selon le type
function getIconSVG(iconType) {
    const icons = {
        'document': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>`,
        'external': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>`,
        'video': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <polygon points="23 7 16 12 23 17 23 7"></polygon>
                     <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>`
    };

    return icons[iconType] || icons['document'];
}

// Fonction pour remplir la modal avec les données
function populateDynamicModal(data) {
    // Image
    document.getElementById('modal-dynamic-image').src = data.image;
    document.getElementById('modal-dynamic-image').alt = data.imageAlt;

    // Titre
    document.getElementById('modal-dynamic-title').textContent = data.title;

    // Catégorie
    document.getElementById('modal-dynamic-category').textContent = data.category;

    // Niveau
    document.getElementById('modal-dynamic-level').textContent = data.level;

    // Récupérer les données spécifiques du projet via la clé
    const specificData = PROJECT_DATA[data.projectKey];

    if (!specificData) {
        console.warn(`Aucune donnée trouvée pour le projet avec la clé: ${data.projectKey}`);
        console.warn(`Alt de l'image: ${data.imageAlt}`);
        console.warn(`Clés disponibles:`, Object.keys(PROJECT_DATA));
        return;
    }

    // Description
    document.getElementById('modal-dynamic-description').innerHTML = specificData.description;

    // Date
    document.getElementById('modal-dynamic-date').textContent = specificData.date || 'Chargement...';

    // Durée
    document.getElementById('modal-dynamic-time').textContent = specificData.time || 'Chargement...';

    // Professeur
    /* document.getElementById('modal-dynamic-teacher').textContent = specificData.teacher || 'À déterminer'; */

    // Auteurs
    const authorsContainer = document.getElementById('modal-dynamic-authors');
    authorsContainer.innerHTML = '';
    const authors = specificData.authors || ['Sami BENDRISS'];
    authors.forEach(author => {
        const authorDiv = document.createElement('div');
        authorDiv.className = 'detail-value';

        // Mettre Sami BENDRISS en couleur (mais pas en gras)
        if (author.toUpperCase().includes('SAMI BENDRISS')) {
            authorDiv.innerHTML = `<span class="author-highlight">${author}</span>`;
        } else {
            authorDiv.textContent = author;
        }

        authorsContainer.appendChild(authorDiv);
    });

    // Outils avec logos
    const toolsContainer = document.getElementById('modal-dynamic-tools');
    toolsContainer.innerHTML = '';
    const tools = specificData.tools || [];
    tools.forEach(toolName => {
        const toolItem = document.createElement('div');
        toolItem.className = 'tool-item';

        const toolNameSpan = document.createElement('span');
        toolNameSpan.className = 'tool-name';
        toolNameSpan.textContent = toolName;

        const toolLogo = document.createElement('div');
        toolLogo.className = 'tool-logo';

        if (TOOL_LOGOS[toolName]) {
            const logoImg = document.createElement('img');

            // Vérifier si c'est un logo dynamique
            if (TOOL_LOGOS[toolName].startsWith('dynamic:')) {
                const logoBase = TOOL_LOGOS[toolName].replace('dynamic:', '');
                const isDarkMode = document.body.classList.contains('dark-mode');
                logoImg.src = `tool-logos/${logoBase}-${isDarkMode ? 'white' : 'black'}.svg`;
            } else {
                logoImg.src = TOOL_LOGOS[toolName];
            }

            logoImg.alt = toolName;
            logoImg.className = 'tool-logo-img';
            toolLogo.appendChild(logoImg);
        } else {
            // Logo par défaut si non trouvé
            toolLogo.innerHTML = '<span style="font-size: 12px;">🔧</span>';
        }

        toolItem.appendChild(toolNameSpan);
        toolItem.appendChild(toolLogo);
        toolsContainer.appendChild(toolItem);
    });

    // Liens
    const linksContainer = document.getElementById('modal-dynamic-links');
    linksContainer.innerHTML = '';
    const links = specificData.links || [];
    links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.target = '_blank';

        // Déterminer la classe CSS en fonction du type de lien
        let linkClass = 'modal-link-large';
        if (link.icon === 'external') {
            // Détecter la plateforme pour appliquer la bonne couleur
            const href = link.href.toLowerCase();
            if (href.includes('drive.google.com')) {
                linkClass += ' modal-link-gdrive';
            } else if (href.includes('instagram.com')) {
                linkClass += ' modal-link-instagram';
            } else if (href.includes('youtube.com') || href.includes('youtu.be')) {
                linkClass += ' modal-link-youtube';
            } else if (href.includes('xd.adobe.com')) {
                linkClass += ' modal-link-adobexd';
            } else {
                linkClass += ' modal-link-external';
            }
        }
        linkElement.className = linkClass;

        // Ajouter l'icône selon le type
        linkElement.innerHTML = getIconSVG(link.icon);

        const textSpan = document.createElement('span');
        textSpan.textContent = link.text;
        linkElement.appendChild(textSpan);

        linksContainer.appendChild(linkElement);
    });
}

// Initialiser les événements pour toutes les project-card avec modal
function initializeDynamicModals() {
    document.querySelectorAll('.project-card[data-has-modal="true"] .project-image').forEach(image => {
        image.addEventListener('click', function () {
            const projectCard = this.closest('.project-card');
            openDynamicModal(projectCard);
        });
    });

    // Fermeture avec Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('dynamic-project-modal');
            if (modal && modal.classList.contains('active')) {
                closeDynamicModal();
            }
        }
    });

    // Fermeture en cliquant sur l'overlay
    document.getElementById('dynamic-project-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeDynamicModal();
        }
    });
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.projects-page')) {
        initializeDynamicModals();
    }
});

// Rendre les fonctions globales
window.openDynamicModal = openDynamicModal;
window.closeDynamicModal = closeDynamicModal;
window.initializeDynamicModals = initializeDynamicModals;

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        const modal = document.getElementById('dynamic-project-modal');
        if (modal && window.getComputedStyle(modal).display !== 'none') {
            e.preventDefault();
            e.stopPropagation();
            closeDynamicModal();
        }
    }
});  