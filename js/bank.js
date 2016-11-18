var PIXI_BANK = function(x,y,engine,stage){
	x = x || 0,y = y || 0;
	this.x = x,this.y = y;
	this.world = engine.world;
	this.engine = engine;
	this.sprite = PIXI.Sprite.fromImage("images/bank.png");
	this.sprite.anchor.x = .5;
	this.sprite.anchor.y = .5;
	this.sprite.width = 140*2.5;
	this.sprite.height = 90*2.5;
	this.sprite.x = x;
	this.sprite.y = y - 40;
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


	var group = Matter.Body.nextGroup(true);
	var ropeA = Matter.Composites.stack(rimx+27, rimy, 3, 1, 10, 10, function(x, y) {
        return Bodies.rectangle(x, y, 25, 10, { collisionFilter: { group: group } });
    });
    this.ropeA = ropeA;
    
    Matter.Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });

    Matter.Composite.add(ropeA, Matter.Constraint.create({ 
        bodyB: ropeA.bodies[0],
        pointB: { x: -10, y: 0 },
        pointA: { x: rimx+10, y: rimy+16 },
        stiffness: 0.5
    }));

    var group = Matter.Body.nextGroup(true);
	var ropeB = Matter.Composites.stack(rim1x-27, rimy, 3, 1, 10, 10, function(x, y) {
        return Bodies.rectangle(x, y, 25, 10, { collisionFilter: { group: group } });
    });
    this.ropeB = ropeB;


    Matter.Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });

    Matter.Composite.add(ropeB, Matter.Constraint.create({ 
        bodyB: ropeB.bodies[0],
        pointB: { x: -10, y: 0 },
        pointA: { x: rim1x-10, y: rimy+16 },
        stiffness: 0.5
    }));

    this.line1 = Constraint.create({ pointA: { x: 0, y: 0 },bodyA: ropeA.bodies[2],bodyB: ropeB.bodies[2],pointB: { x: 0, y: 0 }, stiffness:1 });
    World.add(this.world,[
    	ropeA,
    	ropeB,
    	this.line1
    	]);


    this.chainL = [];
    this.chainR = [];

    // 篮框
    var bank = PIXI.Sprite.fromImage("images/2.png");
    bank.x = x;
	bank.y = y + 60;
	bank.width = 150;
	bank.height = 40;
	bank.anchor.x = .5;
	bank.anchor.y = .5;
	bank.displayGroup = layer1;
	this.bank = bank;
    stage.addChild(bank);


    // 验证是否入球
	var collider = Bodies.rectangle(x, y + 60, 80, 10, {
        isSensor: true,
        isStatic: true,
        render: {
            strokeStyle: '#FFF',
            fillStyle: 'transparent'
        }
    });

    this.collider = collider;

    World.add(this.world, collider);

    var tempY,isNeed;
    Matter.Events.on(this.engine, 'collisionStart', function(event) {
        var pairs = event.pairs;
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];
            if (pair.bodyA === collider && pair.bodyB.label === 'basketball') {
            	isNeed = y + 60 > pair.bodyB.position.y;
            	tempY = pair.bodyB.position.y;
            } else if (pair.bodyB === collider && pair.bodyA.label === 'basketball') {
            	isNeed = y + 60 > pair.bodyA.position.y;
            	tempY = pair.bodyA.position.y;
            }
        }
    });

    Matter.Events.on(this.engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;
        
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];
            if (pair.bodyA === collider && pair.bodyB.label === 'basketball') {
            	if(isNeed && pair.bodyB.position.y > tempY){
	            	console.log(tempY+'1'+pair.bodyB.position.y)
            	}
            } else if (pair.bodyB === collider && pair.bodyA.label === 'basketball') {
            	if(isNeed && pair.bodyA.position.y > tempY){
	            	console.log(tempY)
            	}
            }
        }
    });

    //篮网
    for(var a in ropeA.bodies){
    	var one = ropeA.bodies[a];
    	var b = PIXI.Sprite.fromImage("images/1.png");
    	b.displayGroup = layer1;
    	b.x = one.position.x;
    	b.y = one.position.y;
    	b.width = 25;
    	b.height = 10;
    	b.anchor.x = .5;
		b.anchor.y = .5;

		var b1 = PIXI.Sprite.fromImage("images/1.png");
    	b1.displayGroup = layer1;
    	b1.x = one.position.x + 30;
    	b1.y = one.position.y;
    	b1.width = 25;
    	b1.height = 10;
    	b1.anchor.x = .5;
		b1.anchor.y = .5;

		this.chainL.push({matter:one,pixi:b,pixi1:b1});
		stage.addChild(b);
		stage.addChild(b1);
    }

    for(var a in ropeB.bodies){
    	var one = ropeB.bodies[a];
    	var b = PIXI.Sprite.fromImage("images/1.png");
    	b.displayGroup = layer1;
    	b.x = one.position.x;
    	b.y = one.position.y;
    	b.anchor.x = .5;
		b.anchor.y = .5;

		var b1 = PIXI.Sprite.fromImage("images/1.png");
    	b1.displayGroup = layer1;
    	b1.x = one.position.x - 30;
    	b1.y = one.position.y;
    	b1.width = 25;
    	b1.height = 10;
    	b1.anchor.x = .5;
		b1.anchor.y = .5;

		this.chainR.push({matter:one,pixi:b,pixi1:b1});
		stage.addChild(b);
		stage.addChild(b1);
    }

    // 固定篮板
    this.addWorldList = [
    	this.rim,
    	this.rim1,
    	Constraint.create({ pointA: { x: rimx, y: rimy-this.radius-this.lineLength}, bodyB: this.rim,pointB: { x: 0, y: -this.radius }, stiffness:1}),
		Constraint.create({ pointA: { x: rimx-this.radius-this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: -this.radius, y: 0 }, stiffness:1 }),
		Constraint.create({ pointA: { x: rimx+this.radius+this.lineLength, y: rimy }, bodyB: this.rim,pointB: { x: this.radius, y: 0 }, stiffness:1 }),
		Constraint.create({ pointA: { x: rim1x, y: rim1y-this.radius-this.lineLength}, bodyB: this.rim1,pointB: { x: 0, y: -this.radius }, stiffness:1}),
		Constraint.create({ pointA: { x: rim1x-this.radius-this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: -this.radius, y: 0 }, stiffness:1}),
		Constraint.create({ pointA: { x: rim1x+this.radius+this.lineLength, y: rim1y }, bodyB: this.rim1,pointB: { x: this.radius, y: 0 }, stiffness:1 })
    ];

	World.add(this.world, this.addWorldList);

	this.animate();

}

PIXI_BANK.prototype ={
	animate:function(){
		var that = this;
		that.handle = requestAnimationFrame(function(){that.animate && that.animate()});
		var a = Math.atan(((that.rim.position.y-that.rim1.position.y)/(that.rim.position.x-that.rim1.position.x)));
		// console.log(a);
		that.sprite.rotation = a*5 > 0.01?a*5:0;
		for(var i in that.chainL){
			var one = that.chainL[i];
			one.pixi.x = one.matter.position.x;
			one.pixi1.x = one.pixi.x + 30 - i*3 + 9;
			one.pixi1.y = one.pixi.y = one.matter.position.y - 10;
			one.pixi1.rotation = one.pixi.rotation = one.matter.angle;
		}
		for(var i in that.chainR){
			var one = that.chainR[i];
			one.pixi.x = one.matter.position.x;
			one.pixi1.x = one.pixi.x - 30 + i*3 - 7;
			one.pixi1.y = one.pixi.y = one.matter.position.y - 10;
			one.pixi1.rotation = one.pixi.rotation = one.matter.angle;
		}
	},
	destroy:function(){

		// Matter.Composite.remove(this.world, this.rim);
		// Matter.Composite.remove(this.world, this.rim1);
		
		this.animate = null;
		if(this.handle) cancelAnimationFrame(this.handle);
		this.handle = null;
		Matter.Events.off(this.engine,'collisionStart');
		Matter.Events.off(this.engine,'collisionEnd');


		this.bank.destroy();
		delete this.bank;

		this.sprite.destroy();
		delete this.sprite;

		Matter.Composite.remove(this.world,this.collider);
		delete this.collider;

		for(var i in this.chainL){
			var one = this.chainL[i];
			one.pixi.destroy();
			one.pixi1.destroy();
			// Matter.Composite.remove(this.world, one.matter);
		}
		delete this.chainL;

		for(var i in this.chainR){
			var one = this.chainR[i];
			one.pixi.destroy();
			one.pixi1.destroy();
			// Matter.Composite.remove(this.world, one.matter);
		}
		delete this.chainR;

		Matter.Composite.remove(this.world, this.ropeA);
		delete this.ropeA;
		Matter.Composite.remove(this.world, this.ropeB);
		delete this.ropeB;

		for(var i in this.addWorldList){
			Matter.Composite.remove(this.world, this.addWorldList[i]);
		}
		delete this.addWorldList;
		delete this.rim;
		delete this.rim1;

		Matter.Composite.remove(this.world, this.line1);
		delete this.line1;
	}
};