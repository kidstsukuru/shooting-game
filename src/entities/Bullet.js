import { BULLET_SPEED, ENEMY_BULLET_SPEED, BOSS_BULLET_SPEED } from '../utils/constants.js';

export class Bullet {
    constructor(x, y, color = '#00ffff', skinId = 'striker') {
        this.width = 4;
        this.height = 20;
        this.x = x - this.width / 2;
        this.y = y;
        // 機体の色に合わせて弾の色を変えるよ！
        this.color = color;
        this.skinId = skinId;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 10;
        
        if (this.skinId === 'inferno') {
            // 丸じゃなくて、ギザギザした本物の炎（🔥）みたいな形を描くよ！
            const time = Date.now();
            ctx.shadowColor = '#ff3300';
            
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height * 0.2;
            const w = this.width * 1.5; // 細長くするために少し細くするよ
            const h = this.height * 1.8; // 細長くするために長さを足すよ
            
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.2, '#ffff00');
            gradient.addColorStop(0.6, '#ff6600');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            // 炎の先頭（上）は少し丸みを持たせる
            ctx.arc(cx, this.y, w * 0.5, Math.PI, 0);
            
            // 右側のギザギザ
            ctx.quadraticCurveTo(cx + w, this.y + h * 0.3, cx + w * 0.4, this.y + h * 0.5); // へこみ
            ctx.quadraticCurveTo(cx + w * 0.8, this.y + h * 0.7, cx + w * 0.2, this.y + h * 0.8); // ギザギザ
            
            // 一番長いしっぽ（一番下）を揺らすよ
            const tailX = cx + Math.sin(time / 40 + this.y * 0.1) * 6;
            ctx.lineTo(tailX, this.y + h + 5);
            
            // 左側のギザギザ
            ctx.quadraticCurveTo(cx - w * 0.8, this.y + h * 0.7, cx - w * 0.4, this.y + h * 0.5); // ギザギザ
            ctx.quadraticCurveTo(cx - w, this.y + h * 0.3, cx - w * 0.5, this.y); // へこんで先頭に戻る
            
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    update() {
        this.y -= BULLET_SPEED;
    }
}

export class SpreadBullet {
    constructor(x, y, angle, color = '#ff00ff', skinId = 'striker') {
        this.width = 4;
        this.height = 20;
        this.x = x - this.width / 2;
        this.y = y;
        // 機体の色に合わせて弾の色を変えるよ！
        this.color = color;
        this.skinId = skinId;
        this.angle = angle;
        this.vx = Math.sin(angle) * BULLET_SPEED;
        this.vy = -Math.cos(angle) * BULLET_SPEED;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.shadowBlur = 10;
        
        if (this.skinId === 'inferno') {
            // スプレッド弾もギザギザの炎にするよ！
            const time = Date.now();
            ctx.shadowColor = '#ff3300';
            
            const cx = 0;
            const cy = -this.height / 2 + 4;
            const w = this.width * 1.5; // 細長くするために少し細くするよ
            const h = this.height * 1.8; // 細長くするために長さを足すよ
            
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.2, '#ffff00');
            gradient.addColorStop(0.6, '#ff6600');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.arc(cx, -this.height / 2, w * 0.5, Math.PI, 0);
            
            ctx.quadraticCurveTo(cx + w, -this.height / 2 + h * 0.3, cx + w * 0.4, -this.height / 2 + h * 0.5);
            ctx.quadraticCurveTo(cx + w * 0.8, -this.height / 2 + h * 0.7, cx + w * 0.2, -this.height / 2 + h * 0.8);
            
            const tailX = cx + Math.sin(time / 40 + this.y * 0.1) * 6;
            ctx.lineTo(tailX, -this.height / 2 + h + 5);
            
            ctx.quadraticCurveTo(cx - w * 0.8, -this.height / 2 + h * 0.7, cx - w * 0.4, -this.height / 2 + h * 0.5);
            ctx.quadraticCurveTo(cx - w, -this.height / 2 + h * 0.3, cx - w * 0.5, -this.height / 2);
            
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
}

export class LaserBullet {
    constructor(x, y, power, color = '#00ff00', skinId = 'striker') {
        this.width = 8 + power * 3;
        this.height = 40;
        this.x = x - this.width / 2;
        this.y = y;
        // 機体の色に合わせてレーザーの色を変えるよ！
        this.color = color;
        this.skinId = skinId;
        this.power = power;
    }

    draw(ctx) {
        ctx.save();
        if (this.skinId === 'inferno') {
            // レーザーを激しい火柱にするよ！
            const time = Date.now();
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 0, 1)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0.8)');
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff6600';
            
            ctx.beginPath();
            // ゆらゆら燃え上がるように波打つ形にするよ
            ctx.moveTo(this.x + this.width / 2, this.y);
            
            // 右側の波
            for (let i = 0; i <= 5; i++) {
                const py = this.y + (this.height * i) / 5;
                const px = this.x + this.width + Math.sin(time / 50 + i) * 5;
                ctx.lineTo(px, py);
            }
            // 左側の波（下から上へ）
            for (let i = 5; i >= 0; i--) {
                const py = this.y + (this.height * i) / 5;
                const px = this.x - Math.sin(time / 40 + i) * 5;
                ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, '#ffffff'); // 真ん中は白く光らせるよ！
            gradient.addColorStop(1, this.color);
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
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
