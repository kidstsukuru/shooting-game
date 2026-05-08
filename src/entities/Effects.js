export class Star {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 3 + 0.5;
        this.brightness = Math.random();
    }

    update(canvasWidth, canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight) {
            this.y = 0;
            this.x = Math.random() * canvasWidth;
        }
        // キラキラさせる
        this.brightness += (Math.random() - 0.5) * 0.1;
        if (this.brightness > 1) this.brightness = 1;
        if (this.brightness < 0.3) this.brightness = 0.3;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10;
        this.life = 1.0; // 透明度兼寿命
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.95;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
