import { State } from '../core/State.js';
import { Enemy } from '../entities/enemies/Enemy.js';
import { SmallEnemy } from '../entities/enemies/SmallEnemy.js';
import { Boss } from '../entities/enemies/Boss.js';
import { updateBossHPBar, showBossHPBar } from '../ui/HUD.js';
import { ENEMY_SPAWN_INTERVAL, SMALL_ENEMY_SPAWN_INTERVAL, MAX_ENEMIES, MAX_SMALL_ENEMIES, BOSS_INITIAL_HP } from '../utils/constants.js';

export function startEnemySpawn(canvasWidth) {
    if (State.timers.enemySpawnTimer) clearInterval(State.timers.enemySpawnTimer);
    State.timers.enemySpawnTimer = setInterval(() => {
        if (State.enemies.length < MAX_ENEMIES && State.currentGameState === 'playing_waves') {
            State.enemies.push(new Enemy(canvasWidth));
        }
    }, ENEMY_SPAWN_INTERVAL);

    if (State.timers.smallEnemySpawnTimer) clearInterval(State.timers.smallEnemySpawnTimer);
    State.timers.smallEnemySpawnTimer = setInterval(() => {
        if (State.smallEnemies.length < MAX_SMALL_ENEMIES && State.currentGameState === 'playing_waves') {
            State.smallEnemies.push(new SmallEnemy(canvasWidth));
        }
    }, SMALL_ENEMY_SPAWN_INTERVAL);
}

export function stopEnemySpawn() {
    clearInterval(State.timers.enemySpawnTimer);
    clearInterval(State.timers.smallEnemySpawnTimer);
}

export function triggerBoss(canvasWidth, canvasHeight) {
    if (State.boss || State.currentGameState !== 'playing_waves') return;

    State.currentGameState = 'boss_approaching';
    stopEnemySpawn();
    State.enemies = []; 
    State.smallEnemies = [];

    const bossHp = BOSS_INITIAL_HP + (State.bossesDefeated * 200);
    State.boss = new Boss(canvasWidth, canvasHeight);
    State.boss.hp = bossHp;
    State.boss.maxHp = bossHp;

    showBossHPBar(true);
}
