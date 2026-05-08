import { SKINS } from './ShipTypes.js';

export class Player {
    constructor(canvasWidth, canvasHeight, skinId = 'striker') {
        const skin = SKINS[skinId] || SKINS['striker'];
        
        this.skinId = skinId;
        this.width = 50;
        this.height = 50;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 60;
        this.visible = true;
        this.color = skin.color;
        this.engineColor = skin.engineColor;

        this.image = new Image();
        this.image.src = skin.image;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw(ctx) {
        if (!this.visible) return;
        // エンジン噴射エフェクト
        ctx.save();
        ctx.fillStyle = this.engineColor;
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 - 5, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2 + 5, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height + 20 + Math.random() * 10);
        ctx.fill();
        ctx.restore();

        if (this.imageLoaded) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.PI);
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            // フォールバック：スキン色の三角形
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }

    update(keys, playerSpeed, canvasWidth, canvasHeight, isPlayerDead) {
        if (isPlayerDead) return;
        if (keys['ArrowLeft'] || keys['a']) this.x -= playerSpeed;
        if (keys['ArrowRight'] || keys['d']) this.x += playerSpeed;
        if (keys['ArrowUp'] || keys['w']) this.y -= playerSpeed;
        if (keys['ArrowDown'] || keys['s']) this.y += playerSpeed;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvasHeight) this.y = canvasHeight - this.height;
    }
}
