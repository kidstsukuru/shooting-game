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
        this.invincibleTimer = 0;
        this.color = skin.color;
        this.engineColor = skin.engineColor;

        this.image = new Image();
        this.image.src = skin.image;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };

        this.optionImage = new Image();
        this.optionImage.src = 'assets/images/option_ship.png';
        this.optionImageLoaded = false;
        this.optionImage.onload = () => {
            this.optionImageLoaded = true;
        };
    }

    draw(ctx, playerLevel = 1) {
        if (!this.visible) return;
        ctx.save();
        if (this.invincibleTimer > 0) {
            ctx.globalAlpha = 0.4; // ファントムの必殺技中は半透明！
        }
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

        // Draw option ships if level >= 10
        if (playerLevel >= 10) {
            this.drawOptionShip(ctx, this.x - 20, this.y + 20);
            this.drawOptionShip(ctx, this.x + this.width + 20, this.y + 20);
        }
        ctx.restore();
    }

    drawOptionShip(ctx, centerX, centerY) {
        const width = 20;
        const height = 20;
        
        ctx.save();
        if (this.optionImageLoaded) {
            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI);
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.drawImage(this.optionImage, -width / 2, -height / 2, width, height);
        } else if (this.imageLoaded) {
            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI);
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - height / 2);
            ctx.lineTo(centerX - width / 2, centerY + height / 2);
            ctx.lineTo(centerX + width / 2, centerY + height / 2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Option engine effect
        ctx.save();
        ctx.fillStyle = this.engineColor;
        ctx.globalAlpha = 0.6 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.moveTo(centerX - 3, centerY + height / 2);
        ctx.lineTo(centerX + 3, centerY + height / 2);
        ctx.lineTo(centerX, centerY + height / 2 + 10 + Math.random() * 5);
        ctx.fill();
        ctx.restore();
    }

    update(keys, playerSpeed, canvasWidth, canvasHeight, isPlayerDead) {
        if (isPlayerDead) return;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        
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
