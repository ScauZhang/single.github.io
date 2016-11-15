//require PIXI Matter

var PIXI_BALL = function(x,y,world){
	x = x || 0,y = y || 0;
	this.world = world;
	this.sprite = PIXI.Sprite.fromImage("images/ball.png");
	this.sprite.anchor.x = .5;
	this.sprite.anchor.y = .5;
	this.sprite.width = 80;
	this.sprite.height = 80;
	this.sprite.x = x;
	this.sprite.y = y;
	this.box = Matter.Bodies.circle(x, y, 40);
	this.box.restitution = 1;
	Matter.Body.setDensity(this.box,0.0001);
	this.maxSpeedX = 22.0;
	this.minSpeedX = 2.0;
	this.maxSpeedY = 60.0; //最大速度Y
	this.minSpeedY = 13.0; //最小速度Y
	this.handle = null;
	var that = this;
	World.add(this.world, [this.box]);
	this.animate();
	setTimeout(function(){
		that.destroy();
	},10000);
}


PIXI_BALL.prototype = {
	animate:function(){
		var that = this;
		that.handle = requestAnimationFrame(function(){that.animate && that.animate()});
		if(that.box.position.y < wheight - 81){
			that.sprite.rotation += (that.sprite.x - that.box.position.x)/50;
		}else{
			that.sprite.rotation -= (that.sprite.x - that.box.position.x)/50;
		}
		that.sprite.x = that.box.position.x;
		that.sprite.y = that.box.position.y;
	},
	destroy:function(){
		this.animate = null;
		this.sprite.destroy();
		this.handle = null;
		Matter.Composite.remove(this.world, this.box);
		delete this.world;
		delete this.box;
		delete this.maxSpeedX;
		delete this.maxSpeedY;
		delete this.minSpeedX;
		delete this.minSpeedY;
	},
	// 比例wx,wy
	setBallVelocity:function(x,y,wx,wy){
		var vx = this.minSpeedX + (this.maxSpeedX - this.minSpeedX) * x / wx;
		var vy = this.minSpeedY + (this.maxSpeedY - this.minSpeedY) * y / wy;
		Matter.Body.setVelocity(this.box,Matter.Vector.create(vx, -vy));
	}
}