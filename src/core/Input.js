export const keys = {};
export let touchStartX = 0;
export let isTouching = false;
let lastTap = 0;

export function initInputListeners(canvas, movePlayerCallback, toggleFullscreenCallback, startGameCallback) {
    // キーボードイベントリスナー
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;

        // スペースキーでゲーム開始/リスタート
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault(); // ページのスクロールを防ぐ
            startGameCallback();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // タッチイベント
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        isTouching = true;
        movePlayerCallback(touch.clientX, touch.clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isTouching) {
            const touch = e.touches[0];
            movePlayerCallback(touch.clientX, touch.clientY);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        isTouching = false;
    }, { passive: false });

    // ダブルタップで画面全体表示をトグル
    document.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            toggleFullscreenCallback();
        }
        lastTap = currentTime;
    });
}
