import { ENEMY_SPEED, ENEMY_FIRE_CHANCE } from '../../utils/constants.js';
import { EnemyBullet } from '../Bullet.js';

export class Enemy {
    constructor(canvasWidth) {
        this.width = 60; // 画像に合わせてサイズ調整
        this.height = 60;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        this.color = '#ff4444';
        this.health = 1;

        this.image = new Image();
        this.image.src = 'assets/images/enemy.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw(ctx) {
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

    update(player, enemyBullets) {
        this.y += ENEMY_SPEED;

        if (Math.random() < ENEMY_FIRE_CHANCE && player) {
            enemyBullets.push(new EnemyBullet(
                this.x + this.width / 2,
                this.y + this.height,
                player.x + player.width / 2,
                player.y + player.height / 2
            ));
        }
    }
}
