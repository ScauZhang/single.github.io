Main();
function Main(){
	var renderer,stage;//舞台
	var bank;//篮框对象
	var ball;//篮球对象
	var isEnterGame = false;//是否进入了界面
	var isStart = false;//是否开始
	var backgroundSprite; //背景
	var fieldGoalsAttempted = 0,freeGoalMade = 0;//总投数，命中数
	var timeText;  //时间
	var basicText;  //比分
	var textureList = []; //储存背景
	var isTimeout = false;

	// matter模块
	var Engine = Matter.Engine,
	    Render = Matter.RenderPixi,
	    World = Matter.World,
	    Constraint = Matter.Constraint,
	    Runner = Matter.Runner,
	    Bodies = Matter.Bodies;


	// create an engine
	var engine = Engine.create();
	engine.world.gravity.scale = 0.002;
	engine.enableSleeping = true;
	// create an runner
	var runner = Runner.create();

	//层次
	PIXI.layer0 = new PIXI.DisplayGroup(-1, false);
	PIXI.layer = new PIXI.DisplayGroup(0, false);
	PIXI.layer1 = new PIXI.DisplayGroup(2, false);

	//获取屏幕宽高
	window.wwidth = $(window).width();
	window.wheight = $(window).height();

	//图片预加载
	function imgLoading(){
		var imgList = ['images/ball.png',"images/bg_ys.jpg","images/bg_hj.jpg","images/bg_ld.jpg","images/bg_mc.jpg","images/2.png",'images/1.png','images/bank1.png','images/restart.png']
		var loadIndex = 0;
		for(var i in imgList){
			var img = new Image();
			img.src = imgList[i];
			img.onload = function(){
				loadIndex ++;
				// alert(loadIndex/imgList.length);
				$('#text').html((loadIndex/imgList.length * 100).toFixed(0) + '%');
				if(loadIndex/imgList.length >= 1){
					$('#mask').fadeOut(200);
				}
			};
		}
	}

	//背景初始化
	function backgroundInit(){
		var nbaList = ["images/bg_ys.jpg","images/bg_hj.jpg","images/bg_ld.jpg","images/bg_mc.jpg"];
		for(var i in nbaList){
			textureList.push(PIXI.Texture.fromImage(nbaList[i]));
		}
	}
	
	//获取背景
	function getBackgroundTexture(num){
		return textureList[num];		
	}


	//显示数据
	function showData(){
		var style = {
		    fontFamily : 'Arial',
		    fontSize : '250px',
		    fontWeight : 'bold',
		    fill : '#fff'
		};
		if(!basicText){
			basicText = new PIXI.Text('',style);
			basicText.displayGroup = PIXI.layer;
			basicText.zOrder = 10;
			basicText.x = wwidth/2;
			basicText.alpha = .7;
			basicText.anchor.x = .5;
			basicText.y = 10;
			stage.addChild(basicText);
		}
		basicText.text = freeGoalMade + '/' + fieldGoalsAttempted;
	}
	
	//显示时间
	function showTime(timeoutCallvback){
		if(!timeText){
			timeText = new PIXI.Text('60s',{fontFamily:'Arial',fontSize:'50px',fill:'#fff'});
			timeText.x = wwidth - 10;
			timeText.displayGroup = PIXI.layer;
			timeText.y = 10;
			timeText.anchor.x = 1;
			stage.addChild(timeText);
			var i = 0;
			timeText.handle = setInterval(function(){
				i++;
				timeText.text = 60 - i + 's';
				if(10 - i <= 0){
					timeoutCallvback && timeoutCallvback();
					isTimeout = true;
				}
			},1000);
		}
	}

	//重置时间
	function restartTime(){
		if(timeText && timeText.handle){clearInterval(timeText.handle);}
		timeText = null;
		showTime(gameEnd);
	}

	//show 赞赏语
	function showParser(){
		if(freeGoalMade === 0){
			$('#parserText').html('难道你是传说中的<br>庄神');
		}else if(freeGoalMade > 13){
			$('#parserText').html('siga!你已破了史提芬居里的<br>13投三分记录');
		}else if(freeGoalMade > 0 && freeGoalMade <= 5){
			$('#parserText').html('加紧投篮练习，<br>不能嘻嘻哈哈面对事情。');
		}else if(freeGoalMade > 10 && freeGoalMade <= 13){
			$('#parserText').html('兄弟!<br>未来是你的');
		}else if(freeGoalMade > 5 && freeGoalMade <= 10){
			$('#parserText').html('兄弟!<br>你离球星的距离不远了。');
		}
		
	}

	//游戏结束
	function gameEnd(){
		showParser();
		isEnterGame = false;
		isStart = false;
		if(timeText && timeText.handle){clearInterval(timeText.handle);}
		timeText && timeText.destroy();
		timeText = null;
		$('#FGAText').html(fieldGoalsAttempted);
		$('#FGMText').html(freeGoalMade);
		$('#menu').fadeIn(200);
		$('#restart').fadeOut(200);
	}

	var ball1;
	function setballSprite(){
		ball1 = PIXI.Sprite.fromImage('images/ball.png');
		ball1.x = 100;
		ball1.y = wheight - 200;
		ball1.width = 80;
		ball1.height = 80;
		ball1.anchor.y = .5;
		ball1.anchor.x = .5;
		stage.addChild(ball1);
	}

	//设置背景
	function setBackground(stage,num){
		backgroundSprite && backgroundSprite.destroy();
		var texture = getBackgroundTexture(num);
		backgroundSprite = new PIXI.Sprite(texture);
		backgroundSprite.displayGroup = PIXI.layer0;
		backgroundSprite.anchor.x = .5;
		backgroundSprite.anchor.y = .5;
		backgroundSprite.position.x = wwidth/2;
		backgroundSprite.position.y = wheight/2;
		var imgWidht = texture.baseTexture.realWidth;
		var imgHeight = texture.baseTexture.realHeight;
		if(imgWidht / imgHeight > wwidth / wheight){
			backgroundSprite.width = imgWidht * wheight / imgHeight;
			backgroundSprite.height = wheight;
		}else{
			backgroundSprite.width = wwidth;
			backgroundSprite.height = imgHeight * wwidth / imgWidht;
		}
		texture.baseTexture.on('loaded',function(image){
			// console.log(image.realWidth)
			var imgWidht = image.realWidth;
			var imgHeight = image.realHeight;
			if(imgWidht / imgHeight > wwidth / wheight){
				backgroundSprite.width = imgWidht * wheight / imgHeight;
				backgroundSprite.height = wheight;
			}else{
				backgroundSprite.width = wwidth;
				backgroundSprite.height = imgHeight * wwidth / imgWidht;
			}
		});

		showData();
		
		backgroundSprite.interactive = true;
		// backgroundSprite.on('mousedown', onDown);
		// backgroundSprite.on('touchstart', onDown);

		$('#start').on('touchend',function(event){
			event.stopPropagation();
			start();
		});

		$('#restart').on('touchend',function(event){
			event.stopPropagation();
			gameEnd();
		});

		$('#share').on('touchend',function(event){
			event.stopPropagation();
			console.log('1');
		});

		backgroundSprite.on('mouseup',ballStart);
		backgroundSprite.on('touchend',ballStart);

		stage.addChild(backgroundSprite);
	}

	imgLoading();
	backgroundInit();
	init();
	animate();

	//游戏开始
	function start(){
		isTimeout = false;
		$('#ysq').fadeOut(100);
		$('#menu').fadeOut(200,function(){isEnterGame = true;});
		$('#restart').fadeIn(200);
		fieldGoalsAttempted = 0,freeGoalMade = 0;
		showData();
	}

	//重新创建篮板
	function madeBank(){
		var x = Math.random() * wwidth / 2 + wwidth / 2;
		var y = Math.random() * wheight / 3 + wheight / 5;
		bank && bank.destroy();
		bank = new PIXI_BANK(x,y,engine,stage,FGC);
	}

	//命中
	function FGC(){
		freeGoalMade ++;
		showData();
		if(isTimeout){
			showParser();
			$('#ysq').fadeIn(100);
			$('#FGAText').html(fieldGoalsAttempted);
			$('#FGMText').html(freeGoalMade);
		}
		setTimeout(function(){
			madeBank();
		},500)
	}

	function noFGC(){
		// setBackground(stage,Math.round(Math.random()*3));
		// madeBank();
	}

	function init(){
		// 创建pixi的stage
		stage = new PIXI.Container();
		stage.displayList = new PIXI.DisplayList();

		setBackground(stage,Math.round(Math.random()*3));
		// 创建一个渲染
		renderer = PIXI.autoDetectRenderer(wwidth,wheight);
		// 添加到页面
		document.getElementById('canvas').appendChild(renderer.view);

		var ground = Bodies.rectangle(wwidth/2, wheight, wwidth*10, 60, { isStatic: true , label:'ground'});
		var ground1 = Bodies.rectangle(wwidth, wheight/2, 60, wheight, { isStatic: true });
		Matter.Body.setDensity(ground,1);
		World.add(engine.world, [ground]);

		Runner.start(runner,engine);

		madeBank();

		setballSprite();


		// Matter.Events.on(runner,'beforeUpdate',function(){
		// 	console.log(rim.position.x);
		// });

		// Matter.RenderPixi.world(engine);
		// Matter.RenderPixi.body(engine, ground);
		
		
	}
	function ballStart(eventData){

		if(!isEnterGame) return;
		if(!isStart){
			restartTime();
		}
		isStart = true;
		ball1.alpha = 0;
		backgroundSprite.off('mouseup');
		backgroundSprite.off('touchend');

		fieldGoalsAttempted ++;
		showData();

		setTimeout(function(){
			ball1.alpha = 1;
			backgroundSprite.on('mouseup',ballStart);
			backgroundSprite.on('touchend',ballStart);
		},1000);


		// Runner.stop(runner,engine);
		var x = eventData.data.global.x;
		var y = eventData.data.global.y;

		ball = new PIXI_BALL( 100 ,wheight - 200,engine,stage);
		ball.setBallVelocity(x,wheight - y,wwidth,wheight);

		// add all of the bodies to the world
		// Runner.start(runner,engine);

		// Matter.Events.on(runner,'beforeUpdate',function(){
		// 	ball.animate && ball.animate();
		// 	renderer.render(stage);
		// });
	}
	// var render = Render.create({
	//     element: document.body,
	//     engine: engine
	// });

	// Render.run(render);

	function animate() {
		requestAnimationFrame( animate );
		renderer.render(stage);
	}
};