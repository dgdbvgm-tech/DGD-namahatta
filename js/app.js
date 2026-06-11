const App = {
    data: [],
    container: null,

    async init() {
        this.container = document.getElementById('app-content');
        this.initTheme();
        
        try {
            const response = await fetch('data/events.json');
            this.data = await response.json();
        } catch (e) {
            console.error("Failed to load events data", e);
            this.container.innerHTML = '<div class="loader">Ошибка загрузки данных.</div>';
            return;
        }

        this.initRouter();
    },

    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme, toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme, toggleBtn);
        });
    },

    updateThemeIcon(theme, btn) {
        if (theme === 'dark') {
            btn.innerHTML = '☀️'; // Show sun icon to switch to light
        } else {
            btn.innerHTML = '🌙'; // Show moon icon to switch to dark
        }
    },

    initRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // initial load
    },

    handleRoute() {
        const hash = window.location.hash || '#timeline';
        
        // Use View Transitions API if supported for smooth page changes
        if (!document.startViewTransition) {
            this.renderRoute(hash);
            return;
        }

        document.startViewTransition(() => {
            this.renderRoute(hash);
        });
    },

    renderRoute(hash) {
        window.scrollTo(0, 0);

        if (hash === '#timeline') {
            this.renderTimeline();
        } else if (hash.startsWith('#event/')) {
            const eventId = hash.replace('#event/', '');
            this.renderEventDetail(eventId);
        } else {
            this.renderTimeline();
        }

        // Re-init intersection observer for scroll animations
        setTimeout(() => this.initScrollAnimations(), 100);
    },

    renderTimeline() {
        // Sort data descending by ID (assuming ID is date-based YYYY-MM-DD)
        const sortedEvents = [...this.data].sort((a, b) => b.id.localeCompare(a.id));

        let html = `
            <header class="hero">
                <h1>Хроники Нама-хатты</h1>
                <p class="subtitle">Цифровая капсула времени. Летопись наших встреч, связывающих поколения.</p>
            </header>
            <div class="container timeline">
        `;

        sortedEvents.forEach(event => {
            html += `
                <div class="timeline-item reveal" onclick="window.location.hash='#event/${event.id}'">
                    <div class="timeline-date">${event.date} • ${event.location}</div>
                    <h2 class="timeline-title">${event.title}</h2>
                    <p class="timeline-desc">${event.subtitle}</p>
                </div>
            `;
        });

        html += `</div>`;
        this.container.innerHTML = html;
    },

    renderEventDetail(id) {
        const event = this.data.find(e => e.id === id);
        if (!event) {
            this.container.innerHTML = '<div class="loader">Событие не найдено.</div>';
            return;
        }

        let html = `
            <header class="hero">
                <div class="date-badge">${event.date} • ${event.location}</div>
                <h1>${event.title}</h1>
                <p class="subtitle">${event.subtitle}</p>
            </header>
            <div class="container">
        `;

        // 1. Participants Section
        if (event.participants && event.participants.length > 0) {
            html += `
                <section class="card reveal">
                    <h2>Круг Общения</h2>
                    <div class="participants-list">
            `;
            event.participants.forEach(group => {
                html += `<div class="participant-group"><h3>${group.group}</h3>`;
                group.people.forEach(person => {
                    html += `<p>${person}</p>`;
                });
                html += `</div>`;
            });
            html += `</div>`;
            
            if (event.participantsQuote) {
                html += `<div class="academic-quote">${event.participantsQuote}</div>`;
            }
            html += `</section>`;
        }

        // 2. Roots/Main Content Section
        if (event.roots) {
            html += `
                <section class="card reveal">
                    <h2>Корни Традиции</h2>
                    <p style="line-height: 1.7; color: var(--text-light); margin-bottom: 1rem;">${event.roots.intro}</p>
            `;
            if (event.roots.quote) {
                html += `<div class="academic-quote">${event.roots.quote}</div>`;
            }
            if (event.roots.photo) {
                html += `
                    <div class="photo-container">
                        <img src="${event.roots.photo}" alt="Фотография с нама-хатты">
                    </div>
                `;
            }
            if (event.roots.conclusion) {
                html += `<p style="line-height: 1.7; color: var(--text-light);">${event.roots.conclusion}</p>`;
            }
            html += `</section>`;
        }

        // 3. Topics Section
        if (event.topics && event.topics.length > 0) {
            html += `
                <section class="card reveal">
                    <h2>Философские Узлы (Темы беседы)</h2>
            `;
            event.topics.forEach(topic => {
                html += `
                    <div class="topic-item">
                        <h3>${topic.title}</h3>
                        <p>${topic.description}</p>
                    </div>
                `;
            });
            html += `</section>`;
        }

        // 4. Future Section
        if (event.future) {
            html += `
                <section class="card reveal">
                    <h2>Вайшнавское Будущее</h2>
                    <p style="line-height: 1.7; color: var(--text-light);">${event.future.text}</p>
            `;
            if (event.future.photo) {
                html += `
                    <div class="photo-container">
                        <img src="${event.future.photo}" alt="Дети и преданные">
                    </div>
                `;
            }
            html += `</section>`;
        }

        html += `</div>`;
        this.container.innerHTML = html;
    },

    initScrollAnimations() {
        const reveals = document.querySelectorAll('.reveal');
        const revealOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        });

        reveals.forEach(reveal => {
            revealOnScroll.observe(reveal);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
