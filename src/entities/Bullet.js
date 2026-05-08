import { BULLET_SPEED, ENEMY_BULLET_SPEED, BOSS_BULLET_SPEED } from '../utils/constants.js';

export class Bullet {
    constructor(x, y) {
        this.width = 4;
        this.height = 20;
        this.x = x - this.width / 2;
        this.y = y;
        this.color = '#00ffff';
    }

    draw(ctx) {
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

export class SpreadBullet {
    constructor(x, y, angle) {
        this.width = 4;
        this.height = 20;
        this.x = x - this.width / 2;
        this.y = y;
        this.color = '#ff00ff';
        this.angle = angle;
        this.vx = Math.sin(angle) * BULLET_SPEED;
        this.vy = -Math.cos(angle) * BULLET_SPEED;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}

export class LaserBullet {
    constructor(x, y, power) {
        this.width = 8 + power * 3;
        this.height = 40;
        this.x = x - this.width / 2;
        this.y = y;
        this.color = '#00ff00';
        this.power = power;
    }

    draw(ctx) {
        ctx.save();
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.5, '#88ff88');
        gradient.addColorStop(1, '#00ff00');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    update() {
        this.y -= BULLET_SPEED * 1.2;
    }
}

export class EnemyBullet {
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

    draw(ctx) {
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
    }
}

export class BossBullet {
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(Math.atan2(this.vy, this.vx) - Math.PI / 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}
