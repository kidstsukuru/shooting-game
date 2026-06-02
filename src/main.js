import { initHUD } from './ui/HUD.js';
import { initInputListeners } from './core/Input.js';
import { initGameLoop, startGame, previewLoop, useSpecialSkill } from './core/Game.js';
import { State } from './core/State.js';
import { showHomeScreen } from './ui/HomeScreen.js';

let canvas;
let ctx;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (State.player) {
        State.player.x = Math.min(Math.max(0, State.player.x), canvas.width - State.player.width);
        State.player.y = Math.min(Math.max(0, State.player.y), canvas.height - State.player.height);
    }
    
    if (State.boss && (State.currentGameState === 'boss_approaching' || State.currentGameState === 'boss_battle')) {
        State.boss.targetY = canvas.height * 0.2;
        if (State.currentGameState === 'boss_battle') {
            State.boss.y = State.boss.targetY;
        }
    }
}

/** ホーム画面を表示してゲーム開始を待つ */
function showHome() {
    // ゲーム中のUIは隠す
    document.getElementById('game-ui').classList.add('hidden');

    showHomeScreen((shipId) => {
        // ホーム画面の「LAUNCH」ボタンが押された時
        startGame(shipId);
    });
}

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize DOM elements
    initHUD();
    
    // Set initial size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    // Initialize Game loop references
    initGameLoop(canvas, ctx);

    // Input listeners setup
    initInputListeners(
        canvas,
        (touchX, touchY) => {
            if (State.player) {
                State.player.x = touchX - State.player.width / 2;
                State.player.y = touchY - State.player.height / 2;
                State.player.x = Math.max(0, Math.min(State.player.x, canvas.width - State.player.width));
                State.player.y = Math.max(0, Math.min(State.player.y, canvas.height - State.player.height));
            }
        },
        () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.error(err));
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        },
        () => {
            // スペースキーはゲーム中のみ有効（ホーム画面では無視）
            // ゲームオーバー後のリスタート用
            if (!State.gameRunning && State.currentGameState !== 'start') {
                showHome();
            }
        },
        () => {
            // 必殺技を発動する（Game.jsの関数を呼ぶ）
            return useSpecialSkill();
        }
    );

    // 背景の星アニメーションを開始
    requestAnimationFrame(previewLoop);

    // ホーム画面を表示
    showHome();

    // リスタートボタン → ホーム画面に戻る
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (!State.gameRunning) showHome();
        });
    }
}

// Start application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
