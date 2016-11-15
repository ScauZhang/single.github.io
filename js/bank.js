var PIXI_BANK = function(x,y,world,stage){
	x = x || 0,y = y || 0;
	this.x = x,this.y = y;
	this.world = world;
	this.sprite = PIXI.Sprite.fromImage("images/bank.png");
	this.sprite.anchor.x = .5;
	this.sprite.anchor.y = .5;
	this.sprite.width = 140*2;
	this.sprite.height = 90*2;
	this.sprite.x = x;
	this.sprite.y = y;
	this.radius = 15;
	this.handle = null;
	this.lineLength = 50;

	stage.addChild(this.sprite);

	var rimx = x - 70,rim1x = x + 70,rimy = rim1y = y + 55;
	this.rim = Matter.Bodies.polygon(rimx, rimy,12, this.radius);//篮框1
	this.rim1 = Matter.Bodies.polygon(rim1x, rim1y,12,this.radius);//篮框2
	Matter.Body.setDensity(this.rim1,0.1);
	Matter.Body.setDensity(this.rim,0.1);
	this.rim.restitution = 0.5;
	this.rim1.restitution = 0.5;

	var graphics = new PIXI.Graphics();
	graphics.beginFill(0xFF3300);
	graphics.drawCircle(rimx, rimy, this.radius);
	graphics.drawCircle(rim1x, rim1y, this.radius);
	graphics.endFill();

	stage.addChild(graphics);


	World.add(engine.world, [
		this.rim,
		this.rim1,
		Constraint.create({ pointA: { x: rimx, y: rimy-this.radius-this.lineLength}, bodyB: this.rim,pointB: { x: 0, y: -this.radius }, stiffness:1}),
		Constraint.create({ pointA: { x: rimx-this.radius-this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: -this.radius, y: 0 }, stiffness:1 }),
		Constraint.create({ pointA: { x: rimx+this.radius+this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: this.radius, y: 0 }, stiffness:1 }),
		Constraint.create({ pointA: { x: rim1x, y: rim1y-this.radius-this.lineLength}, bodyB: this.rim1,pointB: { x: 0, y: -this.radius }, stiffness:1}),
		Constraint.create({ pointA: { x: rim1x-this.radius-this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: -this.radius, y: 0 }, stiffness:1}),
		Constraint.create({ pointA: { x: rim1x+this.radius+this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: this.radius, y: 0 }, stiffness:1 })
	]);

	this.animate();

}

PIXI_BANK.prototype ={
	animate:function(){
		var that = this;
		that.handle = requestAnimationFrame(function(){that.animate && that.animate()});
		var a = Math.atan(((that.rim.position.y-that.rim1.position.y)/(that.rim.position.x-that.rim1.position.x)));
		// console.log(a);
		that.sprite.rotation = a*5;
	}
};