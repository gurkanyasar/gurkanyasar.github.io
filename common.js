function formGonder(e) {
    e.preventDefault();
    if (!navigator.onLine) {
        alert("⚠️ İnternet bağlantınız yok."); return;
    }
    const form = e.target;
    const emailInput = form.querySelector('input[name="email"]');
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(emailInput.value)) {
        alert("⚠️ Geçerli bir e-posta girin."); emailInput.focus(); return;
    }
    const btn = form.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Gönderiliyor...'; btn.disabled = true;

    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(r => {
            if (r.ok) { alert(document.documentElement.lang === 'tr' ? "✅ Mesaj gönderildi!" : "✅ Message sent!"); form.reset(); }
            else { alert("❌ Hata oluştu."); }
        })
        .catch(() => alert("❌ Bağlantı hatası."))
        .finally(() => { btn.innerHTML = originalText; btn.disabled = false; });
}

const scrollBtn = document.getElementById('scrollTopBtn');
if (scrollBtn) {
    window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('active', window.scrollY > 300);
    });
}

function setTooltipPositions() {
    const skillTags = document.querySelectorAll('.skill-tag');
    const screenWidth = window.innerWidth;
    skillTags.forEach(tag => {
        const rect = tag.getBoundingClientRect();
        if (rect.left + (rect.width / 2) > screenWidth / 2) {
            tag.classList.add('align-right');
        } else {
            tag.classList.remove('align-right');
        }
    });
}
window.addEventListener('load', setTooltipPositions);
window.addEventListener('resize', setTooltipPositions);

function toggleCard(cardElement) {
    const isExpanded = cardElement.classList.contains('expanded');
    document.querySelectorAll('.project-card').forEach(c => c.classList.remove('expanded'));
    if (!isExpanded) {
        cardElement.classList.add('expanded');
    }
}

function renderProjects(containerSelector, isHomepage, lang) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (typeof projectData === 'undefined') {
        console.error("Error: projectData not found.");
        return;
    }

    const projectsToShow = isHomepage ? projectData.slice(0, 4) : projectData;
    container.innerHTML = '';

    projectsToShow.forEach((proj, index) => {
        const title = (proj[lang] && proj[lang].title) ? proj[lang].title : "";
        const desc = (proj[lang] && proj[lang].desc) ? proj[lang].desc : "";
        const icon = proj.icon || 'fas fa-code';
        const tagsHtml = (proj.tags || []).map(tag => `<span>${tag}</span>`).join('');

        let footerHtml = '';
        if (proj.status === 'WIP') {
            const wipText = lang === 'tr' ? 'Geliştiriliyor...' : 'In Development...';
            footerHtml = `<span class="btn-card wip" onclick="event.stopPropagation()"><i class="fas fa-tools"></i> ${wipText}</span>`;
        }
        else if (proj.github) {
            const btnText = lang === 'tr' ? 'Kaynak Kod' : 'Source Code';
            footerHtml = `<a href="${proj.github}" target="_blank" class="btn-card" onclick="event.stopPropagation()"><i class="fab fa-github"></i> ${btnText}</a>`;
        }

        const cardHtml = `
            <div class="project-card-wrapper">
                <div class="project-card" onclick="toggleCard(this)">
                    <div class="card-header"><i class="${icon} code-icon"></i></div>
                    <div class="card-body">
                        <h3>${title}</h3>
                        <p>${desc}</p>
                        <div class="tech-stack">${tagsHtml}</div>
                        <div class="card-links">${footerHtml}</div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });

    if (isHomepage && projectData.length > 2) {
        setupSliderControls(container);
    }
}

function setupSliderControls(container) {
    if (container.parentElement.querySelector('.slider-control')) return;

    const wrapper = container.parentElement;
    wrapper.classList.add('projects-section-wrapper');

    const leftButton = document.createElement('button');
    leftButton.className = 'slider-control left-control';
    leftButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftButton.onclick = () => scrollProjects('left', container);

    const rightButton = document.createElement('button');
    rightButton.className = 'slider-control right-control';
    rightButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightButton.onclick = () => scrollProjects('right', container);

    wrapper.appendChild(leftButton);
    wrapper.appendChild(rightButton);

    container.addEventListener('scroll', () => updateControlVisibility(container, leftButton, rightButton));
    setTimeout(() => updateControlVisibility(container, leftButton, rightButton), 100);
}

function scrollProjects(direction, container) {
    const cardWrapper = container.querySelector('.project-card-wrapper');
    if (!cardWrapper) return;
    const scrollAmount = direction === 'right' ? (cardWrapper.offsetWidth + 30) : -(cardWrapper.offsetWidth + 30);
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function updateControlVisibility(container, leftBtn, rightBtn) {
    leftBtn.style.visibility = container.scrollLeft <= 5 ? 'hidden' : 'visible';
    const maxScroll = container.scrollWidth - container.clientWidth;
    rightBtn.style.visibility = container.scrollLeft >= maxScroll - 5 ? 'hidden' : 'visible';
}

window.addEventListener('load', () => {
    const lang = document.documentElement.lang === 'tr' ? 'tr' : 'en';
    const isProjectPage = window.location.pathname.includes('projects');

    if (isProjectPage) {
        renderProjects('.projects-grid-container', false, lang);
        const container = document.querySelector('.projects-grid-container');
        if (container) {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
            container.style.gap = '25px';
            container.style.overflowX = 'visible';
            container.style.paddingBottom = '0';
        }
        document.querySelectorAll('.project-card-wrapper').forEach(w => {
            w.style.minWidth = 'auto'; w.style.maxWidth = 'none';
        });
    } else {
        renderProjects('.projects-grid-container', true, lang);
    }
    setTooltipPositions();
});