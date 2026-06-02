import { State } from './State.js';
import { checkCollision } from '../systems/Collision.js';
import { updateHUD, updateLevelDisplay, showLevelUpEffect, toggleUIForGameRun, updateBossHPBar, showMessage, updateSkillGauge } from '../ui/HUD.js';
import { startEnemySpawn, stopEnemySpawn, triggerBoss } from '../systems/Spawner.js';
import { Bullet, SpreadBullet, LaserBullet, BossBullet } from '../entities/Bullet.js';
import { Player } from '../entities/Player.js';
import { Star, Particle } from '../entities/Effects.js';
import { BOSS_BULLET_FIRE_INTERVAL, DEATH_TIMER_SECONDS, BOSS_TRIGGER_LEVEL } from '../utils/constants.js';
import { keys } from './Input.js';

let canvas;
let ctx;

export function initGameLoop(gameCanvas, gameCtx) {
    canvas = gameCanvas;
    ctx = gameCtx;
}

export function startGame(skinId = 'striker') {
    State.reset();
    State.selectedShipId = skinId;
    
    State.player = new Player(canvas.width, canvas.height, skinId);
    
    for (let i = 0; i < 100; i++) {
        State.stars.push(new Star(canvas.width, canvas.height));
    }

    State.gameRunning = true;
    toggleUIForGameRun(true);
    updateHUD();
    updateLevelDisplay();
    
    startEnemySpawn(canvas.width);
    startBulletFire();
    
    requestAnimationFrame(gameLoop);
}

function startBulletFire() {
    if (State.timers.bulletFireTimer) clearInterval(State.timers.bulletFireTimer);
    State.timers.bulletFireTimer = setInterval(() => {
        if (State.gameRunning && State.player && !State.isPlayerDead) {
            fireBullets();
        }
    }, State.bulletFireInterval);
}

function stopBulletFire() {
    clearInterval(State.timers.bulletFireTimer);
}

function fireBullets() {
    const centerX = State.player.x + State.player.width / 2;
    const startY = State.player.y;
    // 機体の色を取得するよ！
    const playerColor = State.player.color;
    // 機体の種類も取得するよ！
    const skinId = State.player.skinId;

    if (State.weaponType === 'normal') {
        const spacing = 15;
        const totalWidth = (State.bulletCount - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        for (let i = 0; i < State.bulletCount; i++) {
            State.bullets.push(new Bullet(startX + i * spacing, startY, playerColor, skinId));
        }
    } else if (State.weaponType === 'spread') {
        const angleSpread = 0.3;
        const totalAngle = angleSpread * (State.bulletCount - 1);
        const startAngle = -totalAngle / 2;
        for (let i = 0; i < State.bulletCount; i++) {
            const angle = startAngle + i * angleSpread;
            State.bullets.push(new SpreadBullet(centerX, startY, angle, playerColor, skinId));
        }
    } else if (State.weaponType === 'laser') {
        State.bullets.push(new LaserBullet(centerX, startY, State.bulletCount, playerColor, skinId));
    }

    if (State.playerLevel >= 10) {
        const leftX = State.player.x - 20;
        const rightX = State.player.x + State.player.width + 20;
        const optionY = State.player.y + 20;

        if (State.weaponType === 'normal') {
            State.bullets.push(new Bullet(leftX, optionY, playerColor, skinId));
            State.bullets.push(new Bullet(rightX, optionY, playerColor, skinId));
        } else if (State.weaponType === 'spread') {
            State.bullets.push(new SpreadBullet(leftX, optionY, -0.2, playerColor, skinId));
            State.bullets.push(new SpreadBullet(rightX, optionY, 0.2, playerColor, skinId));
        } else if (State.weaponType === 'laser') {
            State.bullets.push(new LaserBullet(leftX, optionY, 1, playerColor, skinId));
            State.bullets.push(new LaserBullet(rightX, optionY, 1, playerColor, skinId));
        }
    }
}

export function startBossBattleMode() {
    State.currentGameState = 'boss_battle';
    startBossBulletFire();
    document.getElementById('fog-overlay').classList.remove('hidden');

    State.deathTimer = DEATH_TIMER_SECONDS;
    const timerElem = document.getElementById('boss-timer');
    timerElem.classList.remove('hidden');
    timerElem.textContent = `DEATH IN: ${State.deathTimer}`;

    if (State.timers.deathTimerInterval) clearInterval(State.timers.deathTimerInterval);
    State.timers.deathTimerInterval = setInterval(() => {
        State.deathTimer--;
        timerElem.textContent = `DEATH IN: ${State.deathTimer}`;
        if (State.deathTimer <= 0) {
            clearInterval(State.timers.deathTimerInterval);
            handlePlayerDeath();
        }
    }, 1000);
}

function startBossBulletFire() {
    if (State.timers.bossBulletFireTimer) clearInterval(State.timers.bossBulletFireTimer);
    State.timers.bossBulletFireTimer = setInterval(() => {
        if (State.gameRunning && State.boss && State.currentGameState === 'boss_battle') {
            if (State.boss.freezeTimer > 0) return; // 氷づけ中は撃たない
            const centerX = State.boss.x + State.boss.width / 2;
            const bottomY = State.boss.y + State.boss.height;
            State.bossBullets.push(new BossBullet(centerX, bottomY, Math.PI / 2));
            State.bossBullets.push(new BossBullet(centerX, bottomY, Math.PI / 2 - 0.3));
            State.bossBullets.push(new BossBullet(centerX, bottomY, Math.PI / 2 + 0.3));
        }
    }, BOSS_BULLET_FIRE_INTERVAL);
}

function stopBossBulletFire() {
    clearInterval(State.timers.bossBulletFireTimer);
}

function gainExp(amount) {
    State.playerExp += amount;
    while (State.playerExp >= State.expToNextLevel) {
        State.playerExp -= State.expToNextLevel;
        levelUp();
    }
    updateLevelDisplay();
}

function gainSkillGauge(amount) {
    if (State.skillGauge < 100) {
        State.skillGauge += amount;
        if (State.skillGauge > 100) State.skillGauge = 100;
        updateSkillGauge();
    }
}

function levelUp() {
    State.playerLevel++;
    State.expToNextLevel = Math.floor(50 * Math.pow(1.2, State.playerLevel - 1));

    let message = '';
    if (State.playerLevel % 5 === 0) {
        State.bulletCount = Math.min(State.bulletCount + 1, 7);
        message = `弾数 +1 (${State.bulletCount}発)`;
    } else if (State.playerLevel % 3 === 0) {
        State.bulletFireInterval = Math.max(State.bulletFireInterval - 10, 50);
        message = `連射速度 UP!`;
    } else if (State.playerLevel === 15) {
        State.weaponType = 'spread';
        message = `新武器: スプレッドショット!`;
    } else if (State.playerLevel === 25) {
        State.weaponType = 'laser';
        message = `新武器: レーザー!`;
    } else {
        State.playerHP = Math.min(State.playerHP + 1, 10);
        message = `HP +1`;
    }
    updateHUD();

    showLevelUpEffect(message, State.player.x, State.player.y, State.player.width, State.player.height);

    if (State.playerLevel % BOSS_TRIGGER_LEVEL === 0 && !State.boss && State.currentGameState === 'playing_waves') {
        setTimeout(() => triggerBoss(canvas.width, canvas.height), 2000);
    }
    startBulletFire();
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        State.particles.push(new Particle(x, y, color));
    }
}

function handlePlayerDeath() {
    if (State.isPlayerDead) return;
    State.isPlayerDead = true;
    State.player.visible = false;

    if (State.timers.deathTimerInterval) clearInterval(State.timers.deathTimerInterval);
    createExplosion(State.player.x + State.player.width / 2, State.player.y + State.player.height / 2, '#00ffff');
    
    for (let k = 0; k < 5; k++) {
        setTimeout(() => {
            if(State.player) createExplosion(State.player.x + Math.random() * State.player.width, State.player.y + Math.random() * State.player.height, '#ffffff');
        }, k * 100);
    }

    setTimeout(gameOver, 2000);
}

function gameOver() {
    State.gameRunning = false;
    State.currentGameState = 'game_over';
    stopEnemySpawn();
    stopBulletFire();
    stopBossBulletFire();
    if (State.timers.deathTimerInterval) clearInterval(State.timers.deathTimerInterval);
    
    showMessage(`GAME OVER - Score: ${State.score}`);
    toggleUIForGameRun(false);
    document.getElementById('fog-overlay').classList.add('hidden');
    document.getElementById('boss-timer').classList.add('hidden');
    
    // Background animation preview
    requestAnimationFrame(previewLoop);
}

function victoryScreen() {
    State.gameRunning = false;
    State.currentGameState = 'victory';
    stopEnemySpawn();
    stopBulletFire();
    stopBossBulletFire();
    if (State.timers.deathTimerInterval) clearInterval(State.timers.deathTimerInterval);
    
    showMessage(`VICTORY! - Score: ${State.score}`);
    toggleUIForGameRun(false);
    document.getElementById('fog-overlay').classList.add('hidden');
    document.getElementById('boss-timer').classList.add('hidden');
    
    requestAnimationFrame(previewLoop);
}

export function previewLoop() {
    if (State.gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (State.stars.length === 0) {
        for (let i = 0; i < 100; i++) State.stars.push(new Star(canvas.width, canvas.height));
    }
    State.stars.forEach(star => {
        star.update(canvas.width, canvas.height);
        star.draw(ctx);
    });
    requestAnimationFrame(previewLoop);
}

function gameLoop() {
    if (!State.gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    State.stars.forEach(star => {
        star.update(canvas.width, canvas.height);
        star.draw(ctx);
    });

    State.player.update(keys, State.playerSpeed, canvas.width, canvas.height, State.isPlayerDead);
    State.player.draw(ctx, State.playerLevel);

    for (let i = State.particles.length - 1; i >= 0; i--) {
        const p = State.particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) State.particles.splice(i, 1);
    }

    for (let i = State.bullets.length - 1; i >= 0; i--) {
        const bullet = State.bullets[i];
        bullet.update();
        bullet.draw(ctx);

        if (bullet.y + bullet.height < 0 || bullet.y > canvas.height || bullet.x + bullet.width < 0 || bullet.x > canvas.width) {
            State.bullets.splice(i, 1);
            continue;
        }

        if (State.currentGameState === 'playing_waves') {
            let hit = false;
            for (let j = State.enemies.length - 1; j >= 0; j--) {
                const enemy = State.enemies[j];
                if (checkCollision(bullet, enemy)) {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    State.bullets.splice(i, 1);
                    State.enemies.splice(j, 1);
                    State.score += 10;
                    gainExp(5);
                    gainSkillGauge(10);
                    updateHUD();
                    hit = true;
                    break;
                }
            }
            if(hit) continue;
        }

        for (let j = State.smallEnemies.length - 1; j >= 0; j--) {
            const smallEnemy = State.smallEnemies[j];
            if (checkCollision(bullet, smallEnemy)) {
                State.bullets.splice(i, 1);
                smallEnemy.health--;
                createExplosion(bullet.x, bullet.y, '#fff');
                if (smallEnemy.health <= 0) {
                    createExplosion(smallEnemy.x + smallEnemy.width / 2, smallEnemy.y + smallEnemy.height / 2, smallEnemy.color);
                    State.smallEnemies.splice(j, 1);
                    State.score += 20;
                    gainExp(10);
                    gainSkillGauge(15);
                    updateHUD();
                } else {
                    gainSkillGauge(5);
                }
                break;
            }
        }

        if (State.currentGameState === 'boss_battle' && State.boss) {
            if (checkCollision(bullet, State.boss)) {
                State.bullets.splice(i, 1);
                const damage = bullet.power ? State.bulletDamage * bullet.power : State.bulletDamage;
                State.boss.hp -= damage;
                createExplosion(bullet.x, bullet.y, '#fff');
                updateBossHPBar();
                gainSkillGauge(2);
                if (State.boss.hp <= 0) {
                    handleBossDeath();
                }
                break;
            }
        }
    }

    if (State.currentGameState === 'playing_waves') {
        for (let i = State.enemies.length - 1; i >= 0; i--) {
            const enemy = State.enemies[i];
            enemy.update(State.player, State.enemyBullets);
            enemy.draw(ctx);
            if (!State.isPlayerDead && State.player.invincibleTimer <= 0 && checkCollision(State.player, enemy)) {
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                State.enemies.splice(i, 1);
                continue;
            }
            if (enemy.y > canvas.height) State.enemies.splice(i, 1);
        }

        for (let i = State.smallEnemies.length - 1; i >= 0; i--) {
            const smallEnemy = State.smallEnemies[i];
            smallEnemy.update(State.player, State.enemyBullets);
            smallEnemy.draw(ctx);
            if (!State.isPlayerDead && State.player.invincibleTimer <= 0 && checkCollision(State.player, smallEnemy)) {
                createExplosion(smallEnemy.x + smallEnemy.width / 2, smallEnemy.y + smallEnemy.height / 2, smallEnemy.color);
                State.smallEnemies.splice(i, 1);
                continue;
            }
            if (smallEnemy.y > canvas.height) State.smallEnemies.splice(i, 1);
        }

        for (let i = State.enemyBullets.length - 1; i >= 0; i--) {
            const enemyBullet = State.enemyBullets[i];
            enemyBullet.update();
            enemyBullet.draw(ctx);
            if (!State.isPlayerDead && State.player.invincibleTimer <= 0 && checkCollision(State.player, enemyBullet)) {
                createExplosion(enemyBullet.x, enemyBullet.y, enemyBullet.color);
                State.enemyBullets.splice(i, 1);
                State.playerHP--;
                updateHUD();
                if (State.playerHP <= 0) handlePlayerDeath();
                continue;
            }
            if (enemyBullet.y > canvas.height || enemyBullet.y + enemyBullet.height < 0 || enemyBullet.x > canvas.width || enemyBullet.x + enemyBullet.width < 0) {
                State.enemyBullets.splice(i, 1);
            }
        }
    } else if (State.currentGameState === 'boss_approaching' || State.currentGameState === 'boss_battle') {
        if (State.boss) {
            // やけどのじわじわダメージ
            if (State.boss.burnTimer > 0) {
                State.boss.burnTimer--;
                if (State.boss.burnTimer % 30 === 0) {
                    State.boss.hp -= 30; // 0.5秒ごとに30ダメージ
                    createExplosion(State.boss.x + Math.random() * State.boss.width, State.boss.y + Math.random() * State.boss.height, '#ff6600');
                    updateBossHPBar();
                    if (State.boss.hp <= 0) handleBossDeath();
                }
            }
            // 毒のじわじわダメージ
            if (State.boss && State.boss.poisonTimer > 0) {
                State.boss.poisonTimer--;
                if (State.boss.poisonTimer % 30 === 0) {
                    State.boss.hp -= 30;
                    createExplosion(State.boss.x + Math.random() * State.boss.width, State.boss.y + Math.random() * State.boss.height, '#aaff00');
                    updateBossHPBar();
                    if (State.boss.hp <= 0) handleBossDeath();
                }
            }
        }
        
        if (State.boss) {
            State.boss.update(canvas.width, State.currentGameState, startBossBattleMode);
            State.boss.draw(ctx);
            if (!State.isPlayerDead && State.player.invincibleTimer <= 0 && checkCollision(State.player, State.boss)) {
                createExplosion(State.player.x + State.player.width / 2, State.player.y + State.player.height / 2, '#fff');
            }
        }
        for (let i = State.bossBullets.length - 1; i >= 0; i--) {
            const bossBullet = State.bossBullets[i];
            bossBullet.update();
            bossBullet.draw(ctx);
            if (bossBullet.y > canvas.height) {
                State.bossBullets.splice(i, 1);
                continue;
            }
            if (!State.isPlayerDead && State.player.invincibleTimer <= 0 && checkCollision(bossBullet, State.player)) {
                createExplosion(bossBullet.x, bossBullet.y, bossBullet.color);
                State.bossBullets.splice(i, 1);
                State.playerHP--;
                updateHUD();
                if (State.playerHP <= 0) handlePlayerDeath();
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

// Debug: Level Up with L key
window.addEventListener('keydown', (e) => {
    if ((e.key === 'l' || e.key === 'L') && State.gameRunning) {
        levelUp();
    }
});

// ボスの撃破処理
function handleBossDeath() {
    createExplosion(State.boss.x + State.boss.width / 2, State.boss.y + State.boss.height / 2, State.boss.color);
    for (let k = 0; k < 5; k++) {
        setTimeout(() => {
            if(State.boss) createExplosion(State.boss.x + Math.random() * State.boss.width, State.boss.y + Math.random() * State.boss.height, State.boss.color);
        }, k * 100);
    }
    gainExp(100);
    State.score += 500;
    State.bossesDefeated++;
    updateHUD();
    stopBossBulletFire();
    document.getElementById('fog-overlay').classList.add('hidden');
    document.getElementById('boss-timer').classList.add('hidden');
    if (State.timers.deathTimerInterval) clearInterval(State.timers.deathTimerInterval);
    updateBossHPBar(false); // Hide
    
    State.boss = null;
    State.bossBullets = [];
    State.currentGameState = 'playing_waves';
    startEnemySpawn(canvas.width);
}

// 画面内の敵を一掃する処理（道中の必殺技用）
function wipeScreenEnemies() {
    for (let i = State.enemies.length - 1; i >= 0; i--) {
        const enemy = State.enemies[i];
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
    }
    State.enemies = [];
    for (let i = State.smallEnemies.length - 1; i >= 0; i--) {
        const smallEnemy = State.smallEnemies[i];
        createExplosion(smallEnemy.x + smallEnemy.width / 2, smallEnemy.y + smallEnemy.height / 2, smallEnemy.color);
    }
    State.smallEnemies = [];
    for (let i = State.enemyBullets.length - 1; i >= 0; i--) {
        const enemyBullet = State.enemyBullets[i];
        createExplosion(enemyBullet.x, enemyBullet.y, enemyBullet.color);
    }
    State.enemyBullets = [];
}

// 必殺技の発動
export function useSpecialSkill() {
    if (State.skillGauge < 100) return false; // ゲージが100%じゃないと使えない
    if (State.isPlayerDead) return false;

    State.skillGauge = 0;
    updateSkillGauge();
    
    // 発動メッセージ
    showMessage("必殺技発動！");

    const skinId = State.selectedShipId;
    
    if (skinId === 'phantom') {
        State.player.invincibleTimer = 300; 
    } else if (skinId === 'crimson') {
        if (State.boss) {
            State.boss.hp = Math.floor(State.boss.hp / 2);
            createExplosion(State.boss.x + State.boss.width / 2, State.boss.y + State.boss.height / 2, '#ff2244');
            updateBossHPBar();
        } else {
            wipeScreenEnemies();
        }
    } else if (skinId === 'nova') {
        const targetX = State.boss ? State.boss.x + State.boss.width/2 : canvas.width/2;
        const targetY = State.boss ? State.boss.y + State.boss.height/2 : canvas.height/2;
        for (let k = 0; k < 15; k++) {
            setTimeout(() => createExplosion(targetX - 100 + Math.random() * 200, targetY - 100 + Math.random() * 200, '#ffffff'), k * 50);
        }
        if (State.boss) {
            State.boss.hp -= 500;
            updateBossHPBar();
            if (State.boss.hp <= 0) handleBossDeath();
        } else {
            wipeScreenEnemies();
        }
    } else if (skinId === 'sakura') {
        const targetX = State.boss ? State.boss.x + State.boss.width/2 : canvas.width/2;
        const targetY = State.boss ? State.boss.y + State.boss.height/2 : canvas.height/2;
        for (let k = 0; k < 15; k++) {
            setTimeout(() => createExplosion(targetX - 100 + Math.random() * 200, targetY - 100 + Math.random() * 200, '#ff77aa'), k * 50);
        }
        if (State.boss) {
            State.boss.hp -= 500;
            updateBossHPBar();
            if (State.boss.hp <= 0) handleBossDeath();
        } else {
            wipeScreenEnemies();
        }
    } else if (skinId === 'thunder') {
        const targetX = State.boss ? State.boss.x + State.boss.width/2 : canvas.width/2;
        const targetY = State.boss ? State.boss.y + State.boss.height/2 : canvas.height/2;
        for (let k = 0; k < 15; k++) {
            setTimeout(() => createExplosion(targetX - 100 + Math.random() * 200, targetY - 100 + Math.random() * 200, '#aa66ff'), k * 50);
        }
        if (State.boss) {
            State.boss.hp -= 500;
            updateBossHPBar();
            if (State.boss.hp <= 0) handleBossDeath();
        } else {
            wipeScreenEnemies();
        }
    } else if (skinId === 'inferno') {
        if (State.boss) State.boss.burnTimer = 600;
        else wipeScreenEnemies();
    } else if (skinId === 'viper') {
        if (State.boss) State.boss.poisonTimer = 600;
        else wipeScreenEnemies();
    } else if (skinId === 'glacier') {
        if (State.boss) State.boss.freezeTimer = 300;
        else wipeScreenEnemies();
    }

    return true; 
}
