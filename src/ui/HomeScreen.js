import { SKINS, SKIN_ORDER, DEFAULT_SKIN } from '../entities/ShipTypes.js';

let homeScreenEl = null;
let selectedIndex = 0;
let onStartCallback = null;
let isAnimating = false;

export function showHomeScreen(onStart) {
    onStartCallback = onStart;
    selectedIndex = 0;

    if (homeScreenEl) homeScreenEl.remove();

    homeScreenEl = document.createElement('div');
    homeScreenEl.id = 'home-screen';
    homeScreenEl.innerHTML = buildHomeHTML();
    document.getElementById('game-container').appendChild(homeScreenEl);

    setupEventListeners();
    updateCarousel(false);
}

export function hideHomeScreen() {
    if (homeScreenEl) {
        homeScreenEl.classList.add('home-fade-out');
        setTimeout(() => {
            if (homeScreenEl) homeScreenEl.remove();
            homeScreenEl = null;
        }, 400);
    }
}

function buildHomeHTML() {
    const skinSlides = SKIN_ORDER.map((id, i) => {
        const skin = SKINS[id];
        return `
            <div class="carousel-slide" data-index="${i}" data-skin-id="${id}">
                <div class="slide-glow" style="--skin-color: ${skin.color}; --skin-glow: ${skin.glowColor}"></div>
                <canvas class="slide-canvas" width="200" height="200" data-skin-id="${id}"></canvas>
                <div class="slide-label" style="color: ${skin.color}">${skin.name}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="home-overlay">
            <div class="home-content">
                <div class="home-title-group">
                    <h1 class="home-title">STARBLAZE</h1>
                    <p class="home-tagline">― SELECT YOUR SKIN ―</p>
                </div>

                <div class="carousel-wrapper">
                    <button class="carousel-arrow carousel-arrow-left" id="carousel-left">‹</button>
                    <div class="carousel-track" id="carousel-track">
                        ${skinSlides}
                    </div>
                    <button class="carousel-arrow carousel-arrow-right" id="carousel-right">›</button>
                </div>

                <div class="carousel-dots" id="carousel-dots">
                    ${SKIN_ORDER.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                </div>

                <div class="skin-desc-box" id="skin-desc-box">
                    <p id="skin-desc-text">${SKINS[SKIN_ORDER[0]].description}</p>
                </div>

                <button class="home-start-btn" id="home-start-btn">
                    <span class="btn-text">LAUNCH</span>
                    <span class="btn-icon">▶</span>
                </button>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // 矢印ボタン
    homeScreenEl.querySelector('#carousel-left').addEventListener('click', () => navigate(-1));
    homeScreenEl.querySelector('#carousel-right').addEventListener('click', () => navigate(1));

    // ドット
    homeScreenEl.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.index);
            if (idx !== selectedIndex) {
                selectedIndex = idx;
                updateCarousel(true);
            }
        });
    });

    // スライドクリック
    homeScreenEl.querySelectorAll('.carousel-slide').forEach(slide => {
        slide.addEventListener('click', () => {
            const idx = parseInt(slide.dataset.index);
            if (idx !== selectedIndex) {
                selectedIndex = idx;
                updateCarousel(true);
            }
        });
    });

    // スワイプ対応
    let touchStartX = 0;
    const track = homeScreenEl.querySelector('#carousel-track');
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            navigate(diff > 0 ? 1 : -1);
        }
    }, { passive: true });

    // キーボード
    const keyHandler = (e) => {
        if (!homeScreenEl) {
            window.removeEventListener('keydown', keyHandler);
            return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'a') navigate(-1);
        if (e.key === 'ArrowRight' || e.key === 'd') navigate(1);
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            launchGame();
        }
    };
    window.addEventListener('keydown', keyHandler);

    // スタートボタン
    homeScreenEl.querySelector('#home-start-btn').addEventListener('click', launchGame);

    // プレビュー描画
    drawAllPreviews();
}

function launchGame() {
    if (onStartCallback) {
        const skinId = SKIN_ORDER[selectedIndex];
        hideHomeScreen();
        onStartCallback(skinId);
    }
}

function navigate(dir) {
    if (isAnimating) return;
    const newIndex = selectedIndex + dir;
    if (newIndex < 0 || newIndex >= SKIN_ORDER.length) return;
    selectedIndex = newIndex;
    updateCarousel(true);
}

function updateCarousel(animate) {
    if (!homeScreenEl) return;
    isAnimating = animate;

    const slides = homeScreenEl.querySelectorAll('.carousel-slide');
    slides.forEach((slide, i) => {
        const offset = i - selectedIndex;
        slide.classList.remove('active', 'prev', 'next', 'far-left', 'far-right');
        slide.style.transition = animate ? 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';

        if (offset === 0) {
            slide.classList.add('active');
        } else if (offset === -1) {
            slide.classList.add('prev');
        } else if (offset === 1) {
            slide.classList.add('next');
        } else if (offset < -1) {
            slide.classList.add('far-left');
        } else {
            slide.classList.add('far-right');
        }
    });

    // ドット更新
    const dots = homeScreenEl.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === selectedIndex);
    });

    // 説明文更新
    const descText = homeScreenEl.querySelector('#skin-desc-text');
    if (descText) {
        if (animate) {
            descText.style.opacity = '0';
            descText.style.transform = 'translateY(8px)';
            setTimeout(() => {
                descText.textContent = SKINS[SKIN_ORDER[selectedIndex]].description;
                descText.style.opacity = '1';
                descText.style.transform = 'translateY(0)';
            }, 200);
        } else {
            descText.textContent = SKINS[SKIN_ORDER[selectedIndex]].description;
        }
    }

    // 矢印の有効/無効
    const leftBtn = homeScreenEl.querySelector('#carousel-left');
    const rightBtn = homeScreenEl.querySelector('#carousel-right');
    leftBtn.style.opacity = selectedIndex === 0 ? '0.2' : '1';
    leftBtn.style.pointerEvents = selectedIndex === 0 ? 'none' : 'auto';
    rightBtn.style.opacity = selectedIndex === SKIN_ORDER.length - 1 ? '0.2' : '1';
    rightBtn.style.pointerEvents = selectedIndex === SKIN_ORDER.length - 1 ? 'none' : 'auto';

    if (animate) setTimeout(() => { isAnimating = false; }, 400);
}

function drawAllPreviews() {
    const canvases = homeScreenEl.querySelectorAll('.slide-canvas');
    canvases.forEach(c => {
        const id = c.dataset.skinId;
        const skin = SKINS[id];
        const ctx = c.getContext('2d');
        const cx = 100, cy = 100;

        ctx.clearRect(0, 0, 200, 200);

        const img = new Image();
        img.src = skin.image;
        img.onload = () => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.PI);
            ctx.shadowBlur = 30;
            ctx.shadowColor = skin.color;
            ctx.drawImage(img, -70, -70, 140, 140);
            ctx.restore();
        };
        img.onerror = () => {
            // フォールバック
            ctx.save();
            ctx.shadowBlur = 25;
            ctx.shadowColor = skin.color;
            ctx.fillStyle = skin.color;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 60);
            ctx.lineTo(cx - 40, cy + 50);
            ctx.lineTo(cx + 40, cy + 50);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };
    });
}
