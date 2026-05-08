export const State = {
    gameRunning: false,
    score: 0,
    playerHP: 3,
    playerLevel: 1,
    playerExp: 0,
    expToNextLevel: 50,
    bulletCount: 1,
    weaponType: 'normal',
    bossesDefeated: 0,
    
    currentGameState: 'start', // 'start', 'playing_waves', 'boss_approaching', 'boss_battle', 'game_over', 'victory'
    isPlayerDead: false,
    deathTimer: 0,

    playerSpeed: 10,
    bulletFireInterval: 150,
    bulletDamage: 10,
    selectedShipId: 'striker',

    player: null,
    boss: null,

    bullets: [],
    enemies: [],
    smallEnemies: [],
    bossBullets: [],
    enemyBullets: [],
    stars: [],
    particles: [],

    timers: {
        enemySpawnTimer: null,
        smallEnemySpawnTimer: null,
        bulletFireTimer: null,
        bossBulletFireTimer: null,
        deathTimerInterval: null
    },

    reset() {
        this.score = 0;
        this.playerHP = 3;
        this.playerLevel = 1;
        this.playerExp = 0;
        this.expToNextLevel = 50;
        this.bulletCount = 1;
        this.weaponType = 'normal';
        this.bossesDefeated = 0;
        
        this.isPlayerDead = false;
        this.currentGameState = 'playing_waves';
        this.playerSpeed = 10;
        this.bulletFireInterval = 150;
        this.bulletDamage = 10;
        this.selectedShipId = 'striker';

        this.player = null;
        this.boss = null;
        
        this.bullets = [];
        this.enemies = [];
        this.smallEnemies = [];
        this.bossBullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.stars = [];
    }
};
