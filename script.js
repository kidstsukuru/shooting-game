// ゲームキャンバスとコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI要素の取得
const gameUI = document.getElementById('game-ui');
const gameMessage = document.getElementById('game-message');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const hpDisplay = document.getElementById('hpDisplay'); // HP表示要素
const bossHpDisplay = document.getElementById('bossHpDisplay'); // ボスHPコンテナ
const bossHpBar = document.getElementById('bossHpBar'); // ボスHPバー

// ゲームの状態変数
let gameRunning = false;
let score = 0;
let playerHP = 3; // プレイヤーのHP
let player;
let bullets = []; // プレイヤーの弾丸
let enemies = []; // 通常の敵
let smallEnemies = []; // 小型の敵
let boss; // ボス
let bossBullets = []; // ボスの弾丸
let enemyBullets = []; // 敵の弾丸
let stars = []; // 背景の星
let particles = []; // エフェクト用パーティクル
let keys = {}; // 押されているキーを追跡
let currentGameState = 'start'; // 'start', 'playing_waves', 'boss_approaching', 'boss_battle', 'game_over', 'victory'
let isPlayerDead = false; // プレイヤーが破壊されたかどうか

// タッチ制御用の変数
let touchStartX = 0;
let isTouching = false;

// ゲーム設定
let PLAYER_SPEED = 10; // モバイル用に少し速く
const BULLET_SPEED = 15; // 弾速アップ
const ENEMY_SPEED = 3; // モバイル用に少し遅く
const ENEMY_SPAWN_INTERVAL = 1000; // 敵の出現間隔 (ミリ秒)
const SMALL_ENEMY_SPAWN_INTERVAL = 3000; // 小型敵の出現間隔 (ミリ秒)
let BULLET_FIRE_INTERVAL = 80; // 連射速度アップ (200 -> 80)
const MAX_ENEMIES = 8; // 画面上の最大敵数

// ボス戦デバフ設定
const NORMAL_PLAYER_SPEED = 10;
const NORMAL_FIRE_INTERVAL = 80;
const DEBUFF_PLAYER_SPEED = 3; // 移動速度低下
const DEBUFF_FIRE_INTERVAL = 300; // 連射速度低下
const DEATH_TIMER_SECONDS = 30; // 30秒後に爆死

let deathTimer = 0;
let deathTimerInterval;
const MAX_SMALL_ENEMIES = 3; // 画面上の最大小型敵数
const INITIAL_PLAYER_HP = 3; // 初期HP

const BOSS_TRIGGER_SCORE = 500; // ボスが出現するスコア
const BOSS_INITIAL_HP = 500; // ボスの初期HP (100 -> 500)
const BOSS_SPEED = 4; // ボスの移動速度 (2 -> 4)
const BOSS_BULLET_SPEED = 8; // ボスの弾丸速度 (7 -> 8)
const BOSS_BULLET_FIRE_INTERVAL = 400; // ボスの発射間隔 (350 -> 400, 3-wayになるため調整)
const ENEMY_BULLET_SPEED = 6; // 敵の弾の速度
const ENEMY_FIRE_CHANCE = 0.005; // 敵が弾を発射する確率

// リサイズハンドラ
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // プレイヤーの位置を調整 (画面内に収める)
    if (player) {
        player.x = Math.min(Math.max(0, player.x), canvas.width - player.width);
        player.y = Math.min(Math.max(0, player.y), canvas.height - player.height);
    }
    // ボス戦中にリサイズされた場合、ボスの位置を調整
    if (boss && (currentGameState === 'boss_approaching' || currentGameState === 'boss_battle')) {
        boss.targetY = canvas.height * 0.2; // 画面の20%の位置に固定
        // ボスがすでに定位置にいる場合は位置を調整
        if (currentGameState === 'boss_battle') {
            boss.y = boss.targetY;
        }
    }
}

// リサイズイベント
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

// タッチイベント
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY; // Y座標も記録
    isTouching = true;
    movePlayer(touch.clientX, touch.clientY);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isTouching) {
        const touch = e.touches[0];
        movePlayer(touch.clientX, touch.clientY);
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isTouching = false;
}, { passive: false });

function movePlayer(touchX, touchY) {
    if (player) {
        player.x = touchX - player.width / 2;
        player.y = touchY - player.height / 2;

        // 画面外に出ないように制限
        player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
        player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
    }
}

// ダブルタップで画面全体表示をトグル
let lastTap = 0;
document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
        // ダブルタップ検出
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('フルスクリーンエラー:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    lastTap = currentTime;
});

// 背景の星クラス
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 3 + 0.5;
        this.brightness = Math.random();
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
        // キラキラさせる
        this.brightness += (Math.random() - 0.5) * 0.1;
        if (this.brightness > 1) this.brightness = 1;
        if (this.brightness < 0.3) this.brightness = 0.3;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// パーティクルクラス（爆発エフェクトなど）
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10;
        this.life = 1.0; // 透明度兼寿命
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.95;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// プレイヤーオブジェクト
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 60;
        this.image = new Image();
        this.image.src = 'images/player.png';
        this.imageLoaded = false;
        this.visible = true;

        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (!this.visible) return;
        // エンジン噴射エフェクト
        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 - 5, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2 + 5, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height + 20 + Math.random() * 10);
        ctx.fill();
        ctx.restore();

        if (this.imageLoaded) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI);
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    update() {
        if (isPlayerDead) return;
        // 横移動
        if (keys['ArrowLeft'] || keys['a']) {
            this.x -= PLAYER_SPEED;
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x += PLAYER_SPEED;
        }

        // 縦移動
        if (keys['ArrowUp'] || keys['w']) {
            this.y -= PLAYER_SPEED;
        }
        if (keys['ArrowDown'] || keys['s']) {
            this.y += PLAYER_SPEED;
        }

        // 画面外に出ないように制限
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }
}

// プレイヤーの弾丸オブジェクト
class Bullet {
    constructor(x, y) {
        this.width = 4;
        this.height = 20;
        this.x = x - this.width / 2;
        this.y = y;
        this.color = '#00ffff';
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    update() {
        this.y -= BULLET_SPEED;
    }
}

// 敵の弾丸クラス
class EnemyBullet {
    constructor(x, y, targetX, targetY) {
        this.width = 6;
        this.height = 15;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = ENEMY_BULLET_SPEED;
        this.color = '#ff0055';

        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.draw();
    }
}

// 通常の敵オブジェクト
class Enemy {
    constructor() {
        this.width = 60; // 画像に合わせてサイズ調整
        this.height = 60;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.color = '#ff4444';
        this.health = 1;

        this.image = new Image();
        this.image.src = 'images/enemy.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI); // 180度回転
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            // 敵のデザインを少し凝ったものに
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.lineTo(this.x, this.y);
            ctx.closePath();
            ctx.fill();

            // コア
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 3, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    update() {
        this.y += ENEMY_SPEED;

        if (Math.random() < ENEMY_FIRE_CHANCE) {
            enemyBullets.push(new EnemyBullet(
                this.x + this.width / 2,
                this.y + this.height,
                player.x + player.width / 2,
                player.y + player.height / 2
            ));
        }

        this.draw();
    }
}

// 小型の敵オブジェクト
class SmallEnemy {
    constructor() {
        this.width = 40; // 画像に合わせてサイズ調整
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.color = '#00ff00';
        this.speed = ENEMY_SPEED * 1.5;
        this.health = 1;
        this.fireCooldown = 0;

        this.image = new Image();
        this.image.src = 'images/small_enemy.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI); // 180度回転
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;

            // ひし形
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    update() {
        this.y += this.speed;

        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        if (this.fireCooldown <= 0 && this.y > 0) {
            enemyBullets.push(new EnemyBullet(
                this.x + this.width / 2,
                this.y + this.height,
                player.x + player.width / 2,
                player.y + player.height / 2
            ));
            this.fireCooldown = 60;
        }

        this.draw();
    }
}

// ボスオブジェクト
class Boss {
    constructor() {
        this.width = 220; // 画像に合わせてサイズ調整
        this.height = 220;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = -this.height;
        this.hp = BOSS_INITIAL_HP;
        this.maxHp = BOSS_INITIAL_HP;
        this.color = '#a020f0';
        this.speed = BOSS_SPEED;
        this.direction = 1;
        this.targetY = canvas.height * 0.15; // 少し上に
        this.angle = 0; // 回転演出用

        this.image = new Image();
        this.image.src = 'images/boss.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI); // 180度回転

            // グロー効果
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#d53f8c';

            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            // グロー効果
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#d53f8c';

            // ボス本体
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, this.height / 2);
            ctx.lineTo(this.width / 2, -this.height / 2);
            ctx.lineTo(-this.width / 2, -this.height / 2);
            ctx.closePath();
            ctx.fill();

            // 装飾
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();

            // 回転するリング
            this.angle += 0.05;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 40, this.angle, this.angle + Math.PI);
            ctx.stroke();

            ctx.restore();
        }
    }

    update() {
        if (this.y < this.targetY) {
            this.y += this.speed * 2;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                if (currentGameState !== 'boss_battle') {
                    currentGameState = 'boss_battle';
                    startBossBattleMode();
                }
            }
        } else {
            this.x += this.speed * this.direction;

            if (this.x + this.width > canvas.width || this.x < 0) {
                this.direction *= -1;
            }
        }
    }
}

function startBossBattleMode() {
    startBossBulletFire();

    // 霧エフェクト
    document.getElementById('fog-overlay').classList.remove('hidden');

    // デバフ適用
    PLAYER_SPEED = DEBUFF_PLAYER_SPEED;
    BULLET_FIRE_INTERVAL = DEBUFF_FIRE_INTERVAL;
    startBulletFire(); // 発射間隔更新のために再起動

    // タイマー開始
    deathTimer = DEATH_TIMER_SECONDS;
    const timerElem = document.getElementById('boss-timer');
    timerElem.classList.remove('hidden');
    timerElem.textContent = `DEATH IN: ${deathTimer}`;

    if (deathTimerInterval) clearInterval(deathTimerInterval);
    deathTimerInterval = setInterval(() => {
        deathTimer--;
        timerElem.textContent = `DEATH IN: ${deathTimer}`;
        if (deathTimer <= 0) {
            clearInterval(deathTimerInterval);
            handlePlayerDeath();
        }
    }, 1000);
}

// ボスの弾丸オブジェクト
class BossBullet {
    constructor(x, y, angle = Math.PI / 2) {
        this.width = 10;
        this.height = 25;
        this.x = x - this.width / 2;
        this.y = y;
        this.color = '#ff00ff';
        this.speed = BOSS_BULLET_SPEED;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        // 進行方向に回転 (弾の絵が縦長なので -90度補正)
        ctx.rotate(Math.atan2(this.vy, this.vx) - Math.PI / 2);

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        // 中心を(0,0)として描画
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}

// 衝突判定関数 (AABB)
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

// 爆発エフェクト生成
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// ゲームの初期化
function initGame() {
    score = 0;
    playerHP = INITIAL_PLAYER_HP;
    scoreDisplay.textContent = `スコア: ${score}`;
    hpDisplay.textContent = `HP: ${playerHP}`;
    player = new Player();
    bullets = [];
    enemies = [];
    smallEnemies = [];
    boss = null; // ボスをリセット
    bossBullets = []; // ボスの弾丸をリセット
    enemyBullets = []; // 敵の弾丸をリセット
    enemyBullets = []; // 敵の弾丸をリセット
    particles = []; // パーティクルリセット
    isPlayerDead = false;

    // ボス戦エフェクトのリセット
    document.getElementById('fog-overlay').classList.add('hidden');
    document.getElementById('boss-timer').classList.add('hidden');
    if (deathTimerInterval) clearInterval(deathTimerInterval);
    PLAYER_SPEED = NORMAL_PLAYER_SPEED;
    BULLET_FIRE_INTERVAL = NORMAL_FIRE_INTERVAL;

    // 星の初期化
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    gameRunning = true;
    gameUI.classList.add('hidden');
    startButton.classList.add('hidden');
    restartButton.classList.add('hidden');
    bossHpDisplay.style.display = 'none'; // ボスHPバーを非表示に

    currentGameState = 'playing_waves'; // 初期状態は通常ウェーブ
    startEnemySpawn();
    startBulletFire();
}

let enemySpawnTimer;
let smallEnemySpawnTimer;

function startEnemySpawn() {
    // 通常の敵のスポーン
    if (enemySpawnTimer) clearInterval(enemySpawnTimer);
    enemySpawnTimer = setInterval(() => {
        if (enemies.length < MAX_ENEMIES && currentGameState === 'playing_waves') {
            enemies.push(new Enemy());
        }
    }, ENEMY_SPAWN_INTERVAL);

    // 小型の敵のスポーン
    if (smallEnemySpawnTimer) clearInterval(smallEnemySpawnTimer);
    smallEnemySpawnTimer = setInterval(() => {
        if (smallEnemies.length < MAX_SMALL_ENEMIES && currentGameState === 'playing_waves') {
            smallEnemies.push(new SmallEnemy());
        }
    }, SMALL_ENEMY_SPAWN_INTERVAL);
}

function stopEnemySpawn() {
    clearInterval(enemySpawnTimer);
}

let bulletFireTimer;
function startBulletFire() {
    if (bulletFireTimer) clearInterval(bulletFireTimer);
    bulletFireTimer = setInterval(() => {
        if (gameRunning && player) {
            // プレイヤーの上端中央から弾丸を発射
            bullets.push(new Bullet(player.x + player.width / 2, player.y));
        }
    }, BULLET_FIRE_INTERVAL);
}

function stopBulletFire() {
    clearInterval(bulletFireTimer);
}

let bossBulletFireTimer;
function startBossBulletFire() {
    if (bossBulletFireTimer) clearInterval(bossBulletFireTimer);
    bossBulletFireTimer = setInterval(() => {
        if (gameRunning && boss && currentGameState === 'boss_battle') {
            const centerX = boss.x + boss.width / 2;
            const bottomY = boss.y + boss.height;

            // 3-way弾
            // 真下
            bossBullets.push(new BossBullet(centerX, bottomY, Math.PI / 2));
            // 左斜め
            bossBullets.push(new BossBullet(centerX, bottomY, Math.PI / 2 - 0.3));
            // 右斜め
            bossBullets.push(new BossBullet(centerX, bottomY, Math.PI / 2 + 0.3));
        }
    }, BOSS_BULLET_FIRE_INTERVAL);
}

function stopBossBulletFire() {
    clearInterval(bossBulletFireTimer);
}

// プレイヤー死亡時の処理
function handlePlayerDeath() {
    if (isPlayerDead) return;
    isPlayerDead = true;
    player.visible = false;

    // タイマー停止
    if (deathTimerInterval) clearInterval(deathTimerInterval);

    // 派手な爆発エフェクト
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#00ffff');
    for (let k = 0; k < 5; k++) {
        setTimeout(() => {
            createExplosion(
                player.x + Math.random() * player.width,
                player.y + Math.random() * player.height,
                '#ffffff'
            );
        }, k * 100);
    }

    // 少し遅れてゲームオーバー画面を表示
    setTimeout(() => {
        gameOver();
    }, 2000);
}

// ゲームオーバー処理
function gameOver() {
    gameRunning = false;
    stopEnemySpawn();
    stopBulletFire();
    stopBossBulletFire();
    if (deathTimerInterval) clearInterval(deathTimerInterval); // 念のためここでも停止
    gameMessage.textContent = `GAME OVER - Score: ${score}`;
    gameUI.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    bossHpDisplay.style.display = 'none'; // ゲームオーバー時にボスHPバーを非表示に
    document.getElementById('fog-overlay').classList.add('hidden'); // 霧を消す
    document.getElementById('boss-timer').classList.add('hidden'); // タイマーを消す
    drawPreviewPlayer(); // プレビューを再開
}

// ゲームクリア処理
function victoryScreen() {
    gameRunning = false;
    stopEnemySpawn();
    stopBulletFire();
    stopBossBulletFire();
    if (deathTimerInterval) clearInterval(deathTimerInterval); // タイマー停止
    gameMessage.textContent = `VICTORY! - Score: ${score}`;
    gameUI.classList.remove('hidden');
    restartButton.classList.remove('hidden');
    bossHpDisplay.style.display = 'none'; // ゲームクリア時にボスHPバーを非表示に
    document.getElementById('fog-overlay').classList.add('hidden'); // 霧を消す
    document.getElementById('boss-timer').classList.add('hidden'); // タイマーを消す
    drawPreviewPlayer(); // プレビューを再開
}

// ゲームループ
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景の星を描画
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    player.update();
    player.draw();

    // パーティクルの更新と描画
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // プレイヤーの弾丸の更新と描画
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        bullet.draw();

        if (bullet.y + bullet.height < 0) { // 画面上端を越えたら削除
            bullets.splice(i, 1);
            continue;
        }

        // 通常の敵との衝突判定
        if (currentGameState === 'playing_waves') {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (checkCollision(bullet, enemy)) {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    score += 10;
                    scoreDisplay.textContent = `スコア: ${score}`;
                    break;
                }
            }
        }
        // 小型の敵との衝突判定
        for (let j = smallEnemies.length - 1; j >= 0; j--) {
            const smallEnemy = smallEnemies[j];
            if (checkCollision(bullet, smallEnemy)) {
                bullets.splice(i, 1);
                smallEnemy.health--;
                createExplosion(bullet.x, bullet.y, '#fff'); // ヒットエフェクト
                if (smallEnemy.health <= 0) {
                    createExplosion(smallEnemy.x + smallEnemy.width / 2, smallEnemy.y + smallEnemy.height / 2, smallEnemy.color);
                    smallEnemies.splice(j, 1);
                    score += 20; // 小型敵は倒すと高得点
                }
                break;
            }
        }
        // ボスとの衝突判定
        if (currentGameState === 'boss_battle' && boss) {
            if (checkCollision(bullet, boss)) {
                bullets.splice(i, 1);
                boss.hp -= 10; // ボスにダメージ
                createExplosion(bullet.x, bullet.y, '#fff'); // ヒットエフェクト
                bossHpBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`; // HPバーを更新
                if (boss.hp <= 0) {
                    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.color);
                    // 大爆発
                    for (let k = 0; k < 5; k++) {
                        setTimeout(() => {
                            createExplosion(
                                boss.x + Math.random() * boss.width,
                                boss.y + Math.random() * boss.height,
                                boss.color
                            );
                        }, k * 100);
                    }
                    victoryScreen(); // ボスを倒したらゲームクリア
                    return;
                }
                break;
            }
        }
    }

    // ゲーム状態による処理の分岐
    if (currentGameState === 'playing_waves') {
        // 通常の敵の更新と描画
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update();
            enemy.draw();

            // 敵とプレイヤーの衝突判定（ダメージなしで消えるだけ）
            if (!isPlayerDead && checkCollision(player, enemy)) {
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                enemies.splice(i, 1);
                continue;
            }

            // 画面の下端に到達した敵を削除し、HPを減らす
            if (enemy.y > canvas.height) {
                enemies.splice(i, 1);
                if (!isPlayerDead) {
                    playerHP--;
                    hpDisplay.textContent = `HP: ${playerHP}`;
                    if (playerHP <= 0) {
                        handlePlayerDeath();
                    }
                }
            }
        }

        // 小型の敵の更新と描画
        for (let i = smallEnemies.length - 1; i >= 0; i--) {
            const smallEnemy = smallEnemies[i];
            smallEnemy.update();
            smallEnemy.draw();

            // 小型の敵とプレイヤーの衝突判定（ダメージなしで消えるだけ）
            if (!isPlayerDead && checkCollision(player, smallEnemy)) {
                createExplosion(smallEnemy.x + smallEnemy.width / 2, smallEnemy.y + smallEnemy.height / 2, smallEnemy.color);
                smallEnemies.splice(i, 1);
                continue;
            }

            // 画面の下端に到達した小型の敵を削除
            if (smallEnemy.y > canvas.height) {
                smallEnemies.splice(i, 1);
            }
        }

        // 敵の弾丸の更新と描画
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const enemyBullet = enemyBullets[i];
            enemyBullet.update();

            // 敵の弾丸とプレイヤーの衝突判定（ここでのみHPが減る）
            if (!isPlayerDead && checkCollision(player, enemyBullet)) {
                createExplosion(enemyBullet.x, enemyBullet.y, enemyBullet.color);
                enemyBullets.splice(i, 1);
                playerHP--;
                hpDisplay.textContent = `HP: ${playerHP}`;
                if (playerHP <= 0) {
                    handlePlayerDeath();
                }
                continue; // 1つの弾で1回だけダメージ
            }

            // 画面外に出た敵の弾丸を削除
            if (enemyBullet.y > canvas.height || enemyBullet.y + enemyBullet.height < 0 || enemyBullet.x > canvas.width || enemyBullet.x + enemyBullet.width < 0) {
                enemyBullets.splice(i, 1);
            }
        }

        // ボス出現条件のチェック
        if (score >= BOSS_TRIGGER_SCORE && !boss) {
            currentGameState = 'boss_approaching';
            stopEnemySpawn(); // 通常の敵の出現を停止
            enemies = []; // 画面上の残っている敵をクリア
            smallEnemies = []; // 画面上の残っている小型の敵をクリア
            boss = new Boss();
            bossHpDisplay.style.display = 'block'; // ボスHPバーを表示
        }

    } else if (currentGameState === 'boss_approaching' || currentGameState === 'boss_battle') {
        // ボスの更新と描画
        if (boss) {
            boss.update();
            boss.draw();

            // ボスとプレイヤーの衝突判定
            if (!isPlayerDead && checkCollision(player, boss)) {
                playerHP--;
                hpDisplay.textContent = `HP: ${playerHP}`;
                createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#fff');
                if (playerHP <= 0) {
                    handlePlayerDeath();
                }
                // ボスとの衝突ではボスは消えない
            }
        }

        // ボスの弾丸の更新と描画
        for (let i = bossBullets.length - 1; i >= 0; i--) {
            const bossBullet = bossBullets[i];
            bossBullet.update();
            bossBullet.draw();

            // 画面外に出たボスの弾丸を削除
            if (bossBullet.y > canvas.height) { // 画面下端を越えたら削除
                bossBullets.splice(i, 1);
                continue;
            }

            // ボスの弾丸とプレイヤーの衝突判定
            if (!isPlayerDead && checkCollision(bossBullet, player)) {
                createExplosion(bossBullet.x, bossBullet.y, bossBullet.color);
                bossBullets.splice(i, 1);
                playerHP--;
                hpDisplay.textContent = `HP: ${playerHP}`;
                if (playerHP <= 0) {
                    handlePlayerDeath();
                }
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// キーボードイベントリスナー
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// ボタンイベントリスナー
startButton.addEventListener('click', () => {
    initGame();
    gameLoop();
});

restartButton.addEventListener('click', () => {
    initGame();
    gameLoop();
});

let previewPlayer;

// プレビュー用プレイヤー描画
function drawPreviewPlayer() {
    if (!gameRunning) {
        // 背景の星を描画（プレビュー時も動かす）
        if (stars.length === 0) {
            for (let i = 0; i < 100; i++) {
                stars.push(new Star());
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        if (!previewPlayer) {
            previewPlayer = new Player();
            previewPlayer.x = canvas.width / 2 - previewPlayer.width / 2;
            previewPlayer.y = canvas.height - 150;
        }

        previewPlayer.draw();

        requestAnimationFrame(drawPreviewPlayer);
    }
}

// 初期表示
window.onload = function () {
    resizeCanvas();
    gameMessage.textContent = 'SPACE SHOOTER';
    gameUI.classList.remove('hidden');
    startButton.classList.remove('hidden');
    hpDisplay.textContent = `HP: ${INITIAL_PLAYER_HP}`;
    drawPreviewPlayer();
};
