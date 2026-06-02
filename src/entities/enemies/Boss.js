import { BOSS_INITIAL_HP, BOSS_SPEED } from '../../utils/constants.js';

export class Boss {
    constructor(canvasWidth, canvasHeight) {
        this.width = 220; // 画像に合わせてサイズ調整
        this.height = 220;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = -this.height;
        this.hp = BOSS_INITIAL_HP;
        this.maxHp = BOSS_INITIAL_HP;
        this.color = '#a020f0';
        this.speed = BOSS_SPEED;
        this.direction = 1;
        this.targetY = canvasHeight * 0.15; // 少し上に
        this.angle = 0; // 回転演出用
        
        this.burnTimer = 0;
        this.poisonTimer = 0;
        this.freezeTimer = 0;

        this.image = new Image();
        this.image.src = 'assets/images/boss.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw(ctx) {
        if (this.imageLoaded) {
            ctx.save();
            // 中心を基準に180度回転
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI);

            // グロー効果
            ctx.shadowBlur = 20;
            if (this.freezeTimer > 0) ctx.shadowColor = '#44aaff'; // 氷
            else if (this.poisonTimer > 0) ctx.shadowColor = '#aaff00'; // 毒
            else if (this.burnTimer > 0) ctx.shadowColor = '#ff6600'; // 炎
            else ctx.shadowColor = '#d53f8c';

            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            // グロー効果
            ctx.shadowBlur = 20;
            if (this.freezeTimer > 0) ctx.shadowColor = '#44aaff'; // 氷
            else if (this.poisonTimer > 0) ctx.shadowColor = '#aaff00'; // 毒
            else if (this.burnTimer > 0) ctx.shadowColor = '#ff6600'; // 炎
            else ctx.shadowColor = '#d53f8c';

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

    update(canvasWidth, currentGameState, onStartBossBattleMode) {
        // 氷づけの時は動かない
        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            return;
        }

        if (this.y < this.targetY) {
            this.y += this.speed * 2;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                if (currentGameState !== 'boss_battle') {
                    onStartBossBattleMode();
                }
            }
        } else {
            this.x += this.speed * this.direction;

            if (this.x + this.width > canvasWidth || this.x < 0) {
                this.direction *= -1;
            }
        }
    }
}
