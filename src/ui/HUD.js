import { State } from '../core/State.js';
import { Particle } from '../entities/Effects.js';
import { INITIAL_PLAYER_HP } from '../utils/constants.js';

let uiElements = {};

export function initHUD() {
    uiElements = {
        scoreDisplay: document.getElementById('scoreDisplay'),
        playerHpBar: document.getElementById('playerHpBar'),
        levelDisplay: document.getElementById('levelDisplay'),
        expBar: document.getElementById('expBar'),
        levelUpDisplay: document.getElementById('levelUpDisplay'),
        levelUpReward: document.getElementById('levelUpReward'),
        bossHpDisplay: document.getElementById('bossHpDisplay'),
        bossHpBar: document.getElementById('bossHpBar'),
        skillBar: document.getElementById('skillBar'),
        gameUI: document.getElementById('game-ui'),
        gameMessage: document.getElementById('game-message'),
        startButton: document.getElementById('startButton'),
        restartButton: document.getElementById('restartButton'),
    };
    
    // Create dynamically if missing
    if (!uiElements.levelDisplay) {
        uiElements.levelDisplay = document.createElement('div');
        uiElements.levelDisplay.id = 'levelDisplay';
        uiElements.levelDisplay.className = 'game-level';
        uiElements.levelDisplay.textContent = 'Lv.1';
        document.getElementById('game-container').appendChild(uiElements.levelDisplay);
    }
    if (!uiElements.expBar) {
        const container = document.createElement('div');
        container.id = 'expBarContainer';
        uiElements.expBar = document.createElement('div');
        uiElements.expBar.id = 'expBar';
        container.appendChild(uiElements.expBar);
        document.getElementById('game-container').appendChild(container);
    }
}

export function updateHUD() {
    if(uiElements.scoreDisplay) uiElements.scoreDisplay.textContent = `スコア: ${State.score}`;
    if(uiElements.playerHpBar) {
        const hpPercent = Math.max(0, (State.playerHP / INITIAL_PLAYER_HP) * 100);
        uiElements.playerHpBar.style.width = `${hpPercent}%`;
    }
}

export function updateSkillGauge() {
    if (uiElements.skillBar) {
        uiElements.skillBar.style.width = `${State.skillGauge}%`;
        if (State.skillGauge >= 100) {
            uiElements.skillBar.classList.add('ready');
        } else {
            uiElements.skillBar.classList.remove('ready');
        }
    }
}

export function updateLevelDisplay() {
    if(uiElements.levelDisplay) uiElements.levelDisplay.textContent = `Lv.${State.playerLevel}`;
    const expPercent = (State.playerExp / State.expToNextLevel) * 100;
    if(uiElements.expBar) uiElements.expBar.style.width = `${expPercent}%`;
}

export function showLevelUpEffect(rewardMessage, playerX, playerY, playerWidth, playerHeight) {
    if(uiElements.levelUpReward) uiElements.levelUpReward.textContent = rewardMessage;
    if(uiElements.levelUpDisplay) uiElements.levelUpDisplay.classList.remove('hidden');

    for (let i = 0; i < 20; i++) {
        State.particles.push(new Particle(playerX + playerWidth / 2, playerY + playerHeight / 2, '#ffd700'));
    }

    setTimeout(() => {
        if(uiElements.levelUpDisplay) uiElements.levelUpDisplay.classList.add('hidden');
    }, 2000);
}

export function showBossHPBar(show) {
    if(uiElements.bossHpDisplay) uiElements.bossHpDisplay.style.display = show ? 'block' : 'none';
    if(show && uiElements.bossHpBar) uiElements.bossHpBar.style.width = '100%';
}

export function updateBossHPBar() {
    if(State.boss && uiElements.bossHpBar) {
        uiElements.bossHpBar.style.width = `${(State.boss.hp / State.boss.maxHp) * 100}%`;
    }
}

export function toggleUIForGameRun(isRunning) {
    if (isRunning) {
        uiElements.gameUI.classList.add('hidden');
        uiElements.startButton.classList.add('hidden');
        uiElements.restartButton.classList.add('hidden');
        showBossHPBar(false);
    } else {
        uiElements.gameUI.classList.remove('hidden');
        uiElements.restartButton.classList.remove('hidden');
        showBossHPBar(false);
    }
}

export function showMessage(msg) {
    if(uiElements.gameMessage) uiElements.gameMessage.textContent = msg;
}
