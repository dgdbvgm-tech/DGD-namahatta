const App = {
    data: [],
    ideasData: [],
    container: null,
    userDoc: null,
    currentUser: null,

    async init() {
        this.container = document.getElementById('app-content');
        this.initTheme();
        
        // 1. Сначала загружаем основную базу событий (чтобы сайт не падал целиком)
        try {
            const eventsRes = await fetch('data/events.json');
            this.data = await eventsRes.json();
        } catch (e) {
            console.error("Failed to load events.json", e);
            this.container.innerHTML = '<div class="loader">Критическая ошибка: не удалось загрузить данные капсулы.</div>';
            return;
        }

        // 2. Инициализируем Firebase (если упадет - логируем и отключаем фичу)
        try {
            await this.initAuth();
            
            if (window.fbDb && this.currentUser) {
                const snapshot = await window.fbDb.collection('Ideas').get();
                this.ideasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (e) {
            console.error("Firebase Init Error (Rules or Auth):", e);
            // Если Firebase не работает, оставляем пустой массив, чтобы сайт загрузился
            this.ideasData = [];
        }
        
        // Update nav link badge
        const ideasNav = document.getElementById('nav-ideas-link');
        if (ideasNav && this.ideasData) {
            ideasNav.innerHTML = `💡 Банк идей <span class="badge">${this.ideasData.length}</span>`;
        }

        this.initRouter();
        this.initSevaModal();
    },

    initAuth() {
        return new Promise((resolve, reject) => {
            if (!window.fbAuth) return resolve(null);
            
            window.fbAuth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        await this.loadUserDoc(user.uid);
                        resolve(user);
                    } catch (e) {
                        console.error("Failed to load user doc (check Firestore rules):", e);
                        reject(e);
                    }
                } else {
                    try {
                        await window.fbAuth.signInAnonymously();
                    } catch (err) {
                        console.error("Auth error (is Anonymous Auth enabled?):", err);
                        reject(err);
                    }
                }
            });
        });
    },

    async loadUserDoc(uid) {
        if (!window.fbDb) return;
        const userRef = window.fbDb.collection('Users').doc(uid);
        const docSnap = await userRef.get();
        if (docSnap.exists) {
            this.userDoc = docSnap.data();
        } else {
            const newUser = {
                votesLeft: 3,
                votedIdeaIds: [],
                isAdmin: false
            };
            await userRef.set(newUser);
            this.userDoc = newUser;
        }
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
            btn.innerHTML = '☀️';
        } else {
            btn.innerHTML = '🌙';
        }
    },

    initRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // initial load
    },

    handleRoute() {
        const hash = window.location.hash || '#timeline';
        
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
        } else if (hash === '#gallery') {
            this.renderGallery();
        } else if (hash.startsWith('#event/')) {
            const eventId = hash.replace('#event/', '');
            this.renderEventDetail(eventId);
        } else if (hash === '#ideas') {
            this.renderIdeas();
        } else {
            this.renderTimeline();
        }

        setTimeout(() => this.initScrollAnimations(), 100);
    },

    calculateStats() {
        let topicsCount = 0;
        let photosCount = 0;
        
        this.data.forEach(event => {
            if (event.topics) topicsCount += event.topics.length;
            if (event.roots && event.roots.photo) photosCount++;
            if (event.future && event.future.photo) photosCount++;
        });

        return {
            events: this.data.length,
            topics: topicsCount,
            photos: photosCount
        };
    },

    renderTimeline() {
        const stats = this.calculateStats();
        
        // Extract unique years
        const years = [...new Set(this.data.map(e => e.id.split('-')[0]))].sort((a,b) => b.localeCompare(a));
        
        let html = `
            <header class="hero" style="min-height: 40vh;">
                <h1>Хроники Нама-хатты</h1>
                <p class="subtitle">Цифровая капсула времени. Летопись наших встреч, связывающих поколения.</p>
                <div class="stats-container reveal">
                    <div class="stat-box" onclick="document.querySelector('.timeline').scrollIntoView({behavior: 'smooth'})" title="Перейти к списку встреч">
                        <span class="stat-number">${stats.events}</span>
                        <span class="stat-label">Встреч</span>
                    </div>
                    <div class="stat-box" onclick="window.location.hash='#ideas'" title="Перейти в банк идей">
                        <span class="stat-number">${this.ideasData ? this.ideasData.length : 0}</span>
                        <span class="stat-label">Идей</span>
                    </div>
                    <div class="stat-box" onclick="window.location.hash='#gallery'" title="Открыть медиа-галерею">
                        <span class="stat-number">${stats.photos}</span>
                        <span class="stat-label">Фото</span>
                    </div>
                </div>
            </header>
            
            <div class="container timeline">
                <div class="filter-container reveal">
                    <input type="text" id="searchInput" class="search-input" placeholder="Поиск по темам и событиям...">
                    <select id="yearSelect" class="year-select">
                        <option value="all">Все годы</option>
                        ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
                    </select>
                </div>
                <div id="timelineList" class="timeline-list">
                    <!-- Events will be rendered here -->
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.renderFilteredEvents(this.data);

        // Add event listeners for filters
        document.getElementById('searchInput').addEventListener('input', () => this.handleFilter());
        document.getElementById('yearSelect').addEventListener('change', () => this.handleFilter());
    },

    handleFilter() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const selectedYear = document.getElementById('yearSelect').value;

        const filtered = this.data.filter(event => {
            const matchesYear = selectedYear === 'all' || event.id.startsWith(selectedYear);
            
            // Search in title, subtitle, and topics
            const searchStr = [
                event.title, 
                event.subtitle, 
                ...(event.topics || []).map(t => t.title + ' ' + t.description)
            ].join(' ').toLowerCase();
            
            const matchesSearch = searchStr.includes(searchTerm);
            
            return matchesYear && matchesSearch;
        });

        this.renderFilteredEvents(filtered);
        this.initScrollAnimations();
    },

    renderFilteredEvents(eventsToRender) {
        const listContainer = document.getElementById('timelineList');
        const sortedEvents = [...eventsToRender].sort((a, b) => b.id.localeCompare(a.id));

        if (sortedEvents.length === 0) {
            listContainer.innerHTML = '<p class="loader" style="padding: 2rem;">События не найдены.</p>';
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = sortedEvents.filter(e => e.id >= today).sort((a, b) => a.id.localeCompare(b.id)); // sort ascending for upcoming
        const pastEvents = sortedEvents.filter(e => e.id < today);

        let html = '';

        if (upcomingEvents.length > 0) {
            html += '<h2 class="section-title reveal">Предстоящие встречи (Анонсы)</h2>';
            upcomingEvents.forEach(event => {
                html += `
                    <div class="timeline-item upcoming-item reveal" style="margin-bottom: 3rem;" onclick="window.location.hash='#event/${event.id}'">
                        <div class="upcoming-badge">Скоро</div>
                        <div class="timeline-date">${event.date} • ${event.location}</div>
                        <h2 class="timeline-title">${event.title}</h2>
                        <p class="timeline-desc">${event.subtitle}</p>
                    </div>
                `;
            });
        }

        if (pastEvents.length > 0) {
            html += '<h2 class="section-title reveal">Летопись Нама-хатт</h2>';
            pastEvents.forEach(event => {
                html += `
                    <div class="timeline-item reveal" style="margin-bottom: 2rem;" onclick="window.location.hash='#event/${event.id}'">
                        <div class="timeline-date">${event.date} • ${event.location}</div>
                        <h2 class="timeline-title">${event.title}</h2>
                        <p class="timeline-desc">${event.subtitle}</p>
                    </div>
                `;
            });
        }

        listContainer.innerHTML = html;
    },

    renderGallery() {
        const photos = [];
        this.data.forEach(event => {
            if (event.roots && event.roots.photo) {
                photos.push({ url: event.roots.photo, title: event.title, date: event.date, eventId: event.id });
            }
            if (event.future && event.future.photo) {
                photos.push({ url: event.future.photo, title: "Будущее поколение", date: event.date, eventId: event.id });
            }
        });

        let html = `
            <header class="hero" style="min-height: 30vh;">
                <h1>Медиа-галерея</h1>
                <p class="subtitle">Сохраненные моменты нашего общения</p>
            </header>
            <div class="container">
                <div class="gallery-grid">
        `;

        if (photos.length === 0) {
            html += '<p class="loader">Фотографии пока не добавлены.</p>';
        } else {
            photos.forEach(photo => {
                html += `
                    <div class="gallery-item reveal" onclick="window.location.hash='#event/${photo.eventId}'">
                        <img src="${photo.url}" alt="${photo.title}">
                        <div class="gallery-overlay">
                            <div class="gallery-title">${photo.title}</div>
                            <div class="gallery-date">${photo.date}</div>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
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

        // 2. Roots Section
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
        if ((event.topics && event.topics.length > 0) || event.dynamicTopIdea) {
            html += `
                <section class="card reveal">
                    <h2>Философские Узлы (Темы беседы)</h2>
            `;
            
            let topicsToRender = event.topics || [];
            
            // Fetch top idea if dynamicTopIdea is true
            if (event.dynamicTopIdea && this.ideasData && this.ideasData.length > 0) {
                // Sort by votes
                const sortedIdeas = [...this.ideasData].sort((a, b) => {
                    const aVotes = a.voteCount || 0;
                    const bVotes = b.voteCount || 0;
                    return bVotes - aVotes;
                });
                const topIdea = sortedIdeas[0];
                
                topicsToRender = [{
                    title: `🌟 ${topIdea.title} (Выбор участников)`,
                    description: topIdea.description,
                    articleUrl: topIdea.url || null,
                    articleButtonText: "Перейти к лонгриду"
                }];
            }
            
            topicsToRender.forEach(topic => {
                html += `
                    <div class="topic-item">
                        <h3>${topic.title}</h3>
                        <p>${topic.description}</p>
                        ${topic.articleUrl ? `<a href="${topic.articleUrl}" class="article-btn">${topic.articleButtonText || 'Читать статью'} &rarr;</a>` : ''}
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
    },

    initSevaModal() {
        const openBtn = document.getElementById('open-seva');
        const closeBtn = document.getElementById('close-seva');
        const modal = document.getElementById('seva-modal');
        const copyBtn = document.getElementById('copy-kaspi');
        const toast = document.getElementById('toast');

        if (!openBtn || !modal) return;

        // Open modal
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Copy Kaspi
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const phone = copyBtn.getAttribute('data-phone');
                try {
                    await navigator.clipboard.writeText(phone);
                    // Show toast
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 3000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
        }
    },

    async renderIdeas() {
        this.container.innerHTML = '<div class="loader">Загрузка идей...</div>';
        try {
            if (!window.fbDb) throw new Error("Firebase DB not initialized");
            const snapshot = await window.fbDb.collection('Ideas').get();
            let ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.ideasData = ideas; // update local cache
            
            // Filter by status if not admin
            if (!this.userDoc.isAdmin) {
                ideas = ideas.filter(idea => idea.status === 'Voting' || idea.status === 'Selected');
            }

            // Sort by votes
            ideas.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

            let html = `
                <div class="ideas-header animate-fade-in" style="text-align: center; margin: 2rem 0; padding: 0 1rem;">
                    <h1 class="page-title" style="font-size: 2.5rem; color: var(--primary-gold); margin-bottom: 1rem;">Банк идей 💡</h1>
                    <p class="page-subtitle" style="color: var(--text-color); opacity: 0.8; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                        Темы для будущих Нама-хатт. У вас осталось голосов: <strong>${this.userDoc.votesLeft} из 3</strong>
                    </p>
                    ${this.userDoc.isAdmin ? `<button onclick="App.addIdeaPrompt()" style="margin-top: 1.5rem; padding: 0.6rem 1.5rem; background: var(--primary-gold); color: #fff; border:none; border-radius: 20px; font-weight: 600; cursor: pointer; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); transition: transform 0.3s ease;">+ Добавить идею (Админ)</button>` : ''}
                </div>
                
                <div class="ideas-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding: 1rem;">
            `;

            const hasVotedAny = this.userDoc.votedIdeaIds && this.userDoc.votedIdeaIds.length > 0;

            ideas.forEach(idea => {
                const voted = this.userDoc.votedIdeaIds && this.userDoc.votedIdeaIds.includes(idea.id);
                const displayVotes = (hasVotedAny || this.userDoc.isAdmin) ? (idea.voteCount || 0) : '👁️‍🗨️';
                
                let imageHtml = '';
                if (idea.image) {
                    const imgTag = `<img src="${idea.image}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">`;
                    const innerHtml = idea.url ? `<a href="${idea.url}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%;">${imgTag}</a>` : imgTag;
                    imageHtml = `<div style="height: 160px; overflow: hidden; border-radius: 8px 8px 0 0; margin: -1.5rem -1.5rem 1rem -1.5rem;">
                                    ${innerHtml}
                                 </div>`;
                }

                let actionsHtml = '';
                if (idea.url) {
                    actionsHtml = `<a href="${idea.url}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-gold); font-weight: 600; text-decoration: none; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.3rem;">📖 Читать лонгрид</a>`;
                }
                
                let tagsHtml = '';
                if (idea.tags && idea.tags.length > 0) {
                    tagsHtml = idea.tags.map(tag => `<span style="font-size: 0.75rem; background: rgba(212, 175, 55, 0.1); color: var(--primary-gold); padding: 0.2rem 0.6rem; border-radius: 10px;">#${tag}</span>`).join('');
                }

                let adminActions = '';
                if (this.userDoc.isAdmin) {
                    adminActions = `<div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-color); opacity: 0.6; display:flex; justify-content: space-between; align-items: center;">
                        <span>Статус: <strong>${idea.status || 'New'}</strong></span>
                        <button onclick="App.changeIdeaStatus('${idea.id}')" style="background:transparent; border: 1px solid var(--border-color); color:var(--text-color); border-radius: 8px; cursor: pointer;">Изменить</button>
                    </div>`;
                }

                html += `
                    <div class="idea-card scroll-reveal" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; backdrop-filter: blur(10px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.3s ease; height: 100%;">
                        <div class="idea-content">
                            ${imageHtml}
                            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-color); margin-bottom: 0.5rem; line-height: 1.4;">${idea.title}</h3>
                            <p style="font-size: 0.95rem; color: var(--text-color); opacity: 0.7; margin-bottom: 1rem; line-height: 1.5;">${idea.description}</p>
                            <div class="idea-meta" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                ${idea.author ? `<span style="font-size: 0.85rem; font-weight: 600; color: var(--primary-gold);">✍️ ${idea.author}</span>` : ''}
                                <div class="idea-tags" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                    ${tagsHtml}
                                </div>
                            </div>
                            ${adminActions}
                        </div>
                        <div class="idea-vote" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: ${idea.url ? 'space-between' : 'flex-end'}; align-items: center;">
                            ${actionsHtml}
                            <button onclick="App.toggleVote('${idea.id}')" id="vote-btn-${idea.id}" style="background: ${voted ? 'var(--primary-gold)' : 'transparent'}; color: ${voted ? '#fff' : 'var(--text-color)'}; border: 1px solid ${voted ? 'var(--primary-gold)' : 'var(--border-color)'}; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem;" ${!voted && this.userDoc.votesLeft <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                                ${voted ? 'Снять голос' : 'Голосовать'} ⬆️ <span id="vote-count-${idea.id}">${displayVotes}</span>
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            this.container.innerHTML = html;
            setTimeout(() => this.initScrollAnimations(), 100);

        } catch (e) {
            console.error("Failed to load ideas", e);
            this.container.innerHTML = '<div class="loader">Ошибка загрузки идей.</div>';
        }
    },

    async toggleVote(id) {
        if (!this.currentUser) return;
        const btn = document.getElementById('vote-btn-' + id);
        
        const userRef = window.fbDb.collection('Users').doc(this.currentUser.uid);
        const ideaRef = window.fbDb.collection('Ideas').doc(id);

        try {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';

            await window.fbDb.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const ideaDoc = await transaction.get(ideaRef);
                
                if (!userDoc.exists || !ideaDoc.exists) throw "Document not found";
                
                const userData = userDoc.data();
                const ideaData = ideaDoc.data();
                
                const votedIdeaIds = userData.votedIdeaIds || [];
                const hasVoted = votedIdeaIds.includes(id);
                
                if (hasVoted) {
                    transaction.update(userRef, {
                        votedIdeaIds: firebase.firestore.FieldValue.arrayRemove(id),
                        votesLeft: firebase.firestore.FieldValue.increment(1)
                    });
                    transaction.update(ideaRef, {
                        voteCount: firebase.firestore.FieldValue.increment(-1)
                    });
                    this.userDoc.votedIdeaIds = votedIdeaIds.filter(v => v !== id);
                    this.userDoc.votesLeft = userData.votesLeft + 1;
                } else {
                    if (userData.votesLeft <= 0) {
                        throw "No votes left";
                    }
                    transaction.update(userRef, {
                        votedIdeaIds: firebase.firestore.FieldValue.arrayUnion(id),
                        votesLeft: firebase.firestore.FieldValue.increment(-1)
                    });
                    transaction.update(ideaRef, {
                        voteCount: firebase.firestore.FieldValue.increment(1)
                    });
                    this.userDoc.votedIdeaIds = [...votedIdeaIds, id];
                    this.userDoc.votesLeft = userData.votesLeft - 1;
                }
            });
            
            // Re-render ideas to reflect new state immediately
            this.renderIdeas();
            
            const toast = document.getElementById('toast');
            toast.textContent = 'Голос учтен! ✨';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);

        } catch (err) {
            console.error("Voting failed", err);
            alert(err === "No votes left" ? "У вас не осталось голосов!" : "Ошибка при голосовании");
        } finally {
            if(btn) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        }
    },

    async addIdeaPrompt() {
        const title = prompt("Название идеи:");
        if (!title) return;
        const description = prompt("Описание идеи:");
        if (!description) return;
        
        try {
            await window.fbDb.collection('Ideas').add({
                title,
                description,
                status: 'Voting',
                voteCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("Идея добавлена!");
            this.renderIdeas();
        } catch (e) {
            console.error(e);
            alert("Ошибка добавления");
        }
    },

    async changeIdeaStatus(id) {
        const newStatus = prompt("Новый статус (New, Grooming, Voting, Selected, Discussed):");
        if (!newStatus) return;
        try {
            await window.fbDb.collection('Ideas').doc(id).update({ status: newStatus });
            this.renderIdeas();
        } catch (e) {
            console.error(e);
            alert("Ошибка обновления статуса");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
