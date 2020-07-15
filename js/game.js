class Game {
    constructor(ctx, canvas, world) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.world = world;
        this.controller = new Controller();
        this.player = new Character(this.canvas, this.ctx, 72, 200, 100, 114);
        this.playerTopLeft;
        this.playerTopRight;
        this.playerBottomLeft;
        this.playerBottomRight;
        this.tileX;
        this.tileY;
        this.tileType;
        // this.viewPortWidth = 40 * 70;
        // this.viewPortHeight = 22 * 70; 
        this.cameraPosX = 0;
        this.cameraPosY = 0;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        //static background image
        this.background = new Image();
        this.background.src = './images/Big Room.bmp'
        //static floor image
        this.ground = new Image();
        this.ground.src = './images/MegaManSheet5.gif';
        //flashing health canister
        this.health = new Image();
        this.health.src = './images/MegaManSheet5.gif';
        this.healthSprite = {
            'motion': {
                'value': [[0, 0], [1, 0]],
                'x': 134, 'y': 598, 
                'w': 18, 'h':13
            }
        }
        this.healthAnimation = new Animation(this.healthSprite.motion, 20)

        this.door = new Image();
        this.door.src = './images/door_closedMid.png'
        this.currentMap = 'map1';
        this.direction = 'right';
        this.bullets = [];
        this.bulletImg = new Image();
        this.bulletImg.src = './images/MegaManSheet5.gif';
        this.gameOver = false;
        this.enemies = {
            'map1':[],
            'map2':[new Enemy(this.ctx, 70 * 16 + 35, 70 * 9, 100, 100, 'vertical')],
            'map3':[new Enemy(this.ctx, 70 * 20, 70 * 18 + 70, 100, 100, 'horizontal'),
                    new Enemy(this.ctx, 70 * 10, 70 * 7 + 50, 100, 100, 'vertical')],
            'map4':[new Enemy(this.ctx, 70 * 22, 70 * 7 + 50, 100, 100, 'vertical')],
        }
        //game Audio
        this.blaster = new Audio("./sounds/05 - MegaBuster.wav");
        this.blaster.volume = 0.2;
        this.healthCanister = new Audio("../sounds/24 - EnergyFill.wav");
        this.healthCanister.volume = 0.2;
        this.playerDamage = new Audio("../sounds/07 - MegamanDamage.wav");
        this.playerDamage.volume = 0.2;

    }

    drawGameScreen(){
        //number of tiles to display to the game canvas      
        let screenTilesX = this.canvas.width / this.world.tileSize;
        let screenTilesY = this.canvas.height / this.world.tileSize;

        //offset camera to center the player
        // this.cameraOffsetX = Math.floor(this.cameraPosX / this.world.tileSize) - (screenTilesX - 2) / 2;
        // this.cameraOffsetY = Math.floor(this.cameraPosY / this.world.tileSize) - screenTilesY / 2;
        

        // if(this.cameraOffsetX < 0) this.cameraOffsetX = 0;
        // if(this.cameraOffsetY < 0) this.cameraOffsetY = 0;
        // if(this.cameraOffsetX > this.world.columns - screenTilesX) this.cameraOffsetX = this.world.columns - screenTilesX;
        // if(this.cameraOffsetY > this.world.rows - screenTilesY) this.cameraOffsetY = this.world.rows - screenTilesY;

        //draws the visible map
        for (let y = 0; y < screenTilesY; y++){
            for (let x = 0; x < screenTilesX; x++){
                this.tileType = this.world.getTile(this.currentMap,(x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize);
                switch (this.tileType){
                    case 'B':
                        this.ctx.fillStyle = "black";
                        this.ctx.fillRect((x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize, this.world.tileSize, this.world.tileSize);
                        break;
                    case 'H':
                        this.ctx.fillStyle = "red";
                        this.ctx.fillRect((x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize, this.world.tileSize, this.world.tileSize);
                        break;
                    case 'T':
                        // this.ctx.fillStyle = "white";
                        // this.ctx.fillRect((x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize, this.world.tileSize, this.world.tileSize);
                        this.ctx.drawImage(this.ground, 98, 663, 17, 16, (x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize, this.world.tileSize, this.world.tileSize);
                        break;
                    case 'g':
                        this.ctx.drawImage(this.ground, 73, 445, 34, 34, (x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize, this.world.tileSize, this.world.tileSize);
                        break;
                    case 'c':                        
                        this.ctx.drawImage(this.health, this.healthAnimation.sprite.x + this.healthAnimation.frame[0] * this.healthAnimation.sprite.w, this.healthAnimation.sprite.y + this.healthAnimation.frame[1] * this.healthAnimation.sprite.h, this.healthAnimation.sprite.w, this.healthAnimation.sprite.h, (x + this.cameraOffsetX) * this.world.tileSize, (y + this.cameraOffsetY) * this.world.tileSize, this.world.tileSize, this.world.tileSize * 0.75);
                        break;
                }
            }
        }




    }

    init() {

        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        this.drawGameScreen();
        this.healthAnimation.update();

        this.ctx.fillStyle = "white";
        this.ctx.font = '50px Verdana';
        this.ctx.fillText(`HP: ${this.player.hp}`, 70 * 3, 50);
        
        this.player.animation.update();
        this.update();

        // this.playerTopLeft = this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getTop());
        // this.playerTopRight = this.world.getTile(this.currentMap, this.player.getRight(), this.player.getTop());
        // this.playerBottomLeft = this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getBottom() - 5);
        // this.playerBottomRight = this.world.getTile(this.currentMap, this.player.getRight(), this.player.getBottom() - 5);

        this.player.draw(this.direction);

        this.drawEnemies();
        this.drawBullets();
        if (this.enemies.length !== 0){
            for(let j = 0; j < this.enemies[this.currentMap].length; j++){
                for (let i = 0; i < this.bullets.length ; i++){
                    this.enemies[this.currentMap][j].checkBullet(this.bullets[i])
                    if (this.enemies[this.currentMap][j].hp <= 0) {
                        this.enemies[this.currentMap].splice(j, 1);
                    }
                }
            }
        }
        
        this.doors();
        this.healthPickup();
        this.playerHit();
        this.checkCollision();
        if(this.player.hp < 0){
            this.gameOver = true;
        }
        // console.log(this.player.y);
    }

    drawEnemies(){
        this.enemies[this.currentMap].forEach(enemy => {
            enemy.update();
            enemy.draw();
        })
    }

    drawBullets(){

        for (let i = 0; i < this.bullets.length; i++){
            this.bullets[i].update();
            this.bullets[i].draw();
            if(this.bullets[i].x < -20 || this.bullets[i].x > this.canvas.width) this.bullets.splice(i, 1);
        }
    }

    // feature to add later
    // moveCamera(){
    //     //canvas offset to player
    //     let canvasOffsetX = 0;
    //     let canvasOffsetY = 0;

    //     if(this.player.xVel > 0){
    //         this.ctx.translate(canvasOffsetX, 0);
    //     } else if (this.player.xVel < 0){
    //         this.ctx.translate(-canvasOffsetX, 0);
    //     }

    //     if(this.player.yVel > 0){
    //         this.ctx.translate(0, canvasOffsetY);
    //     } else if (this.player.yVel < 0){
    //         this.ctx.translate(0, -canvasOffsetY);
    //     }
    //     this.ctx.translate(0, 0);
    // }

    update() {
        //Left and Right movement
        if (this.controller.left) {
            this.direction = 'left';
            this.player.animation.changeFrameSet(this.player.spriteFramesReverse.walk, 8);
            this.player.xVel = this.player.moveSpeed * -1;
        }
        if (this.controller.right) {
            this.direction = 'right';
            this.player.animation.changeFrameSet(this.player.spriteFrames.walk, 8);
            this.player.xVel = this.player.moveSpeed;
        }

        //Jump movement;               
        if (this.controller.up && !this.player.jumping) {
            if(this.direction === 'right'){
                this.player.animation.changeFrameSet(this.player.spriteFrames.jump, 15);
            } else {
                this.player.animation.changeFrameSet(this.player.spriteFramesReverse.jump, 15);
            }
            this.player.yVel -= this.player.moveSpeed * 1.9;            
            this.player.jumping = true;
        }

        if (this.player.xVel < 1 && this.player.xVel > -1) {
            this.player.xVel = 0;
            if(this.direction === 'right'){
                if(this.player.xVel === 0 && this.player.yVel === 0) this.player.animation.changeFrameSet(this.player.spriteFrames.standing, 30);
            } else {
                if(this.player.xVel === 0 && this.player.yVel === 0) this.player.animation.changeFrameSet(this.player.spriteFramesReverse.standing, 30);
            }
            
        }

        if (this.player.yVel > 5) {
            if(this.direction === 'right'){
            this.player.animation.changeFrameSet(this.player.spriteFrames.falling, 30);
            } else {
                this.player.animation.changeFrameSet(this.player.spriteFramesReverse.falling, 30);
            }
        }

        if(this.controller.shoot){
            this.bullets.push(new Bullet(this.ctx, this.player.x, this.player.y + this.player.height * 0.333, this.direction, 20))
            this.controller.shoot = false;
            this.blaster.play();
        }

        this.player.yVel += this.player.gravity;
        this.player.xVel *= this.player.friction;

        this.player.oldX = this.player.x;
        this.player.oldY = this.player.y;

        this.player.x += this.player.xVel;
        this.player.y += this.player.yVel;

        this.cameraPosX = this.player.x;
        this.cameraPosY = this.player.y;
    }

    doors(){
        if (this.player.getRight() >= this.canvas.width){
            this.player.xVel = 0;
            this.player.x = 130;
            this.player.y = 800;
            this.currentMap = this.currentMap.substr(0, 3) + String(Number(this.currentMap.substr(3, 1)) + 1);
        }
    }

    healthPickup(){
        if(this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getTop()) === 'c') {
            this.world.setTile(this.currentMap, this.player.getLeft(), this.player.getTop(), ".");
            this.player.hp += 5;
            this.healthCanister.play();
        }
        if(this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getBottom() - 5) === 'c') {
            this.world.setTile(this.currentMap, this.player.getLeft(), this.player.getBottom() - 5, ".");
            this.player.hp += 5;
            this.healthCanister.play();
        }
        if(this.world.getTile(this.currentMap, this.player.getRight(), this.player.getTop()) === 'c') {
            this.world.setTile(this.currentMap, this.player.getRight(), this.player.getTop(), ".");
            this.player.hp += 5;
            this.healthCanister.play();
        }
        if(this.world.getTile(this.currentMap, this.player.getRight(), this.player.getBottom() - 5) === 'c') {
            this.world.setTile(this.currentMap, this.player.getRight(), this.player.getBottom() - 5, ".");
            this.player.hp += 5;
            this.healthCanister.play();
        }

        if(this.world.getTile(this.currentMap, this.player.getRight(), this.player.getBottom() - 5) === 'T') {
            for (let i = 0; i < 5; i++){
                setTimeout(() => {this.world.setTile(this.currentMap, 39 * 70, (21 - i) * 70 - 5, ".")}, 200 * (i + 1));
            }
        }
    }

    playerHit(){
        if(this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getTop()) === 'H' ||
        this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getBottom() - 5) === 'H' ||
        this.world.getTile(this.currentMap, this.player.getRight(), this.player.getTop()) === 'H' ||
        this.world.getTile(this.currentMap, this.player.getRight(), this.player.getBottom() - 5) === 'H') {
           this.player.hp -= 1;
           this.playerDamage.play();
        }        
    }

    checkCollision(){
        //left and right collision
        if (this.player.xVel !== 0){ 
            if(this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getTop()) === 'g' || 
            this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getBottom() - 5) === 'g' ||
            this.world.getTile(this.currentMap, this.player.getRight(), this.player.getTop()) === 'g' ||
             this.world.getTile(this.currentMap, this.player.getRight(), this.player.getBottom() - 5) === 'g'){
                this.player.x = this.player.oldX;
                this.player.xVel = 0;
             }
        }
        //up and down collision
        if (this.player.yVel < 0 || this.player.yVel > 0){
            if (this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getTop()) === 'g' ||
            this.world.getTile(this.currentMap, this.player.getRight() - 5, this.player.getTop()) === 'g' ||
            this.world.getTile(this.currentMap, this.player.getLeft(), this.player.getBottom()) === 'g' ||
            this.world.getTile(this.currentMap, this.player.getRight() - 5, this.player.getBottom()) === 'g'){
                this.player.y = this.player.oldY;
                this.player.yVel = 0;
                this.player.jumping = false;
            }
        }
    }
}