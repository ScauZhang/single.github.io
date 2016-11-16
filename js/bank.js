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
	this.rim = Matter.Bodies.polygon(rimx, rimy,20, this.radius);//篮框1
	this.rim1 = Matter.Bodies.polygon(rim1x, rim1y,20,this.radius);//篮框2
	Matter.Body.setDensity(this.rim1,0.1);
	Matter.Body.setDensity(this.rim,0.1);
	this.rim.restitution = 0.6;
	this.rim1.restitution = 0.6;

	var graphics = new PIXI.Graphics();
	graphics.beginFill(0xFF3300);
	graphics.drawCircle(rimx, rimy, this.radius);
	graphics.drawCircle(rim1x, rim1y, this.radius);
	graphics.endFill();

	stage.addChild(graphics);

	var group = Matter.Body.nextGroup(true);
	var ropeA = Matter.Composites.stack(rimx+30, rimy, 3, 1, 10, 10, function(x, y) {
        return Bodies.rectangle(x, y, 25, 10, { collisionFilter: { group: group } });
    });
    
    Matter.Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });

    Matter.Composite.add(ropeA, Matter.Constraint.create({ 
        bodyB: ropeA.bodies[0],
        pointB: { x: -10, y: 0 },
        pointA: { x: rimx+10, y: rimy+16 },
        stiffness: 0.5
    }));

    var group = Matter.Body.nextGroup(true);
	var ropeB = Matter.Composites.stack(rim1x-30, rimy, 3, 1, 10, 10, function(x, y) {
        return Bodies.rectangle(x, y, 25, 10, { collisionFilter: { group: group } });
    });
    
    Matter.Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });

    Matter.Composite.add(ropeB, Matter.Constraint.create({ 
        bodyB: ropeB.bodies[0],
        pointB: { x: -10, y: 0 },
        pointA: { x: rim1x-10, y: rimy+16 },
        stiffness: 0.5
    }));
    World.add(engine.world,[
    	ropeA,
    	ropeB,
    	Constraint.create({ pointA: { x: 0, y: 0 },bodyA: ropeA.bodies[2],bodyB: ropeB.bodies[2],pointB: { x: 0, y: 0 }, stiffness:1 })
    	]);

    this.chainL = [];
    this.chainR = [];

    for(var a in ropeA.bodies){
    	var one = ropeA.bodies[a];
    	var b = PIXI.Sprite.fromImage("images/1.png");
    	b.x = one.position.x;
    	b.y = one.position.y;
    	b.width = 25;
    	b.height = 10;
    	b.anchor.x = .5;
		b.anchor.y = .5;
		this.chainL.push({matter:one,pixi:b});
		stage.addChild(b);
    }

    for(var a in ropeB.bodies){
    	var one = ropeB.bodies[a];
    	var b = PIXI.Sprite.fromImage("images/1.png");
    	b.x = one.position.x;
    	b.y = one.position.y;
    	b.anchor.x = .5;
		b.anchor.y = .5;
		this.chainR.push({matter:one,pixi:b});
		stage.addChild(b);
    }


	World.add(engine.world, [
		this.rim,
		this.rim1,
		Constraint.create({ pointA: { x: rimx, y: rimy-this.radius-this.lineLength}, bodyB: this.rim,pointB: { x: 0, y: -this.radius }, stiffness:1}),
		Constraint.create({ pointA: { x: rimx-this.radius-this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: -this.radius, y: 0 }, stiffness:1 }),
		Constraint.create({ pointA: { x: rimx+this.radius+this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: this.radius, y: 0 }, stiffness:1 }),
		Constraint.create({ pointA: { x: rim1x, y: rim1y-this.radius-this.lineLength}, bodyB: this.rim1,pointB: { x: 0, y: -this.radius }, stiffness:1}),
		Constraint.create({ pointA: { x: rim1x-this.radius-this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: -this.radius, y: 0 }, stiffness:1}),
		Constraint.create({ pointA: { x: rim1x+this.radius+this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: this.radius, y: 0 }, stiffness:1 })
		// Constraint.create({ pointA: { x: rimx-this.radius-this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: -this.radius, y: 0 }, stiffness:1 }),
		// Constraint.create({ pointA: { x: rim1x+this.radius+this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: this.radius, y: 0 }, stiffness:1 }),
		// Constraint.create({ pointA: { x: this.radius, y: 0 },bodyA:this.rim, bodyB: this.rim1,pointB: { x: -this.radius, y: 0 }, stiffness:1}),
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
		for(var i in that.chainL){
			var one = that.chainL[i];
			one.pixi.x = one.matter.position.x;
			one.pixi.y = one.matter.position.y;
			one.pixi.rotation = one.matter.angle;
		}
		for(var i in that.chainR){
			var one = that.chainR[i];
			one.pixi.x = one.matter.position.x;
			one.pixi.y = one.matter.position.y;
			one.pixi.rotation = one.matter.angle;
		}
	},
	destroy:function(){
		Matter.Composite.remove(this.world, this.rim);
	}
};