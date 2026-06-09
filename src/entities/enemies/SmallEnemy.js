import { ENEMY_SPEED } from '../../utils/constants.js';
import { EnemyBullet } from '../Bullet.js';

export class SmallEnemy {
    constructor(canvasWidth) {
        this.width = 40; // 画像に合わせてサイズ調整
        this.height = 40;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        this.color = '#00ff00';
        this.speed = ENEMY_SPEED * 1.5;
        this.health = 200;
        this.fireCooldown = 0;

        this.image = new Image();
        this.image.src = 'assets/images/small_enemy.png';
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

    update(player, enemyBullets) {
        this.y += this.speed;

        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        if (this.fireCooldown <= 0 && this.y > 0 && player) {
            enemyBullets.push(new EnemyBullet(
                this.x + this.width / 2,
                this.y + this.height,
                player.x + player.width / 2,
                player.y + player.height / 2
            ));
            this.fireCooldown = 60;
        }
    }
}
