
function Game() {
	this.cellX = 17;			// 横向单位
	this.cellY = 35;			// 纵向单位
	this.containerW = 408;
	this.containerH = 304;
	this.hero = {
		x: 37,
		y: 37,
		originX: 37,
		originY: 37,
		direction: '',
		timer: null
	};
	this.monster = {
		x: 83,
		y: 116,
		originX: 37,
		originY: 37,
		direction: '',
		timer: null
	};
}
Game.prototype = {
	constructor: Game,
	init: function() {
		this.render();
		this.bind();
	},
	render: function() {
		var ctx = document.getElementById('myCanvas').getContext('2d');

	    ctx.clearRect(12, 12, 400, 300);

	    // 绘制容器
	    roundedRect(ctx, 12, 12, this.containerW, this.containerH, 15);
	    roundedRect(ctx, 19, 19, this.containerW - 14, this.containerH - 14, 9);

	    // 描点
	    for(var i = 0; i < (this.containerW - this.hero.originX) / this.cellX; i++) {
	    	for (var j = 1; j < this.containerH / this.cellY; j++) {
	      		ctx.fillRect(this.hero.originX - 2 + i * this.cellX, this.cellY * j, 4, 4);
	    	}
	    }

	    // 绘制四个矩形障碍物 == 未完成随机
	    roundedRect(ctx, 53, 53, 49, 33, 10, true);
	    roundedRect(ctx, 53, 119, 49, 16, 6, true);
	    roundedRect(ctx, 135, 53, 49, 33, 10, true);
	    roundedRect(ctx, 135, 119, 25, 49, 10, true);

	    ctx.save();
	    ctx.translate(this.hero.x, this.hero.y);
	    paintHero(ctx, 0, 0, this.hero.direction);				// 玩家
	    ctx.restore();

	    // 小怪物 == 未完成随机
	    paintMonster(ctx, 83, 116, 'left');			// x随意，y = 37*j
	    paintMonster(ctx, 200, 296, 'right');
	},
	bind: function() {
		var self = this;
		function step (direction) {
			var tik = 0;
			self.hero.direction = direction;
			self.hero.timer && clearInterval(self.hero.timer);
			self.hero.timer = setInterval(function() {
				if (direction == 'left') {
					tik += 2;
					self.hero.x -= self.cellX / 5;

				} else if (direction == 'top') {
					tik += 1;
					self.hero.y -= self.cellY / 10;

				} else if (direction == 'right') {
					tik += 2;
					if (self.hero.x < self.containerW) self.hero.x += self.cellX / 5;
					else clearInterval(self.hero.timer);

				} else if (direction == 'bottom') {
					tik += 1;
					if (self.hero.y < self.containerH) self.hero.y += self.cellY / 10;
					else clearInterval(self.hero.timer);
				}

				self.render();
				if (tik >= 10) clearInterval(self.hero.timer);
			}, 100);
		}
		document.onkeydown = function(event) {
			switch (event.keyCode) {
				case 37: 		// 左
					step('left');
					break;
				case 38: 		// 上
					step('top');
					break;
				case 39: 		// 右
					step('right');
					break;
				case 40:
					step('bottom');
					break;
				default: self.hero.timer && clearInterval(self.hero.timer);
			}
		}
		document.onkeyup = function() {
			// self.hero.timer && clearInterval(self.hero.timer);
		}
	}
};

// 封装的一个用于绘制圆角矩形的函数.
function roundedRect(ctx, x, y, width, height, radius, isClear) {
	isClear && ctx.clearRect(x - 8, y, width + 2 * 8, height);	// 是否檫除内部图像
	ctx.beginPath();
	ctx.moveTo(x, y + radius);
	ctx.lineTo(x, y + height - radius);
	ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
	ctx.lineTo(x + width - radius, y + height);
	ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
	ctx.lineTo(x + width, y + radius);
	ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
	ctx.lineTo(x + radius, y);
	ctx.quadraticCurveTo(x, y, x, y + radius);
	ctx.stroke();
}

// 绘制主人公
function paintHero(ctx, x, y, direction) {
	var radius = 13;
	ctx.clearRect(x - radius, y - radius, 2 * radius, 2 * radius);	// 先擦除内部
	ctx.beginPath();
	/* 	@param
		@ 位置 (x, y), 
		@ 半径 13, 
		@ 从1/7半圆弧开始, 画到-1/7半圆弧
		@ false=>顺时针
		==> 相当于去掉1/7圆周
	*/
	if (direction == 'bottom') {
		ctx.arc(x, y, radius, 9 * Math.PI / 14, 5 * Math.PI / 14, false);

	} else if (direction == 'left') {
		ctx.arc(x, y, radius, 8 * Math.PI / 7, 6 * Math.PI / 7, false);

	} else if (direction == 'top') {
		ctx.arc(x, y, radius, 23 * Math.PI / 14, 19 * Math.PI / 14, false);

	} else {
    	ctx.arc(x, y, radius, Math.PI / 7, -Math.PI / 7, false);
	}
    ctx.lineTo(x, y);		// 回到中心点 以形成闭合路径
    ctx.fill();				// color填充
}

// 绘制小怪物
function paintMonster(ctx, x, y, spy) {
	ctx.beginPath();

	// 83, 116
    ctx.moveTo(x, y);

    // ctx.lineTo(x, 102);
    ctx.lineTo(x, y - 14);

    // ctx.bezierCurveTo(83,94,89,88,97,88);		// 三次贝塞尔曲线
    ctx.bezierCurveTo(x, y - 22, x + 6, y - 28, x + 14, y - 28);		

    // ctx.bezierCurveTo(105,88,111,94,111,102);	
    ctx.bezierCurveTo(x + 22, y - 28, x + 28, y - 22, x + 28, y - 14);	

    // ctx.lineTo(111,116);
    ctx.lineTo(x + 28, y);

    // ctx.lineTo(106.333,111.333);
    ctx.lineTo(x + 23.333, y - 4.667);

    // ctx.lineTo(101.666,116);
    ctx.lineTo(x + 18.666, y);

    // ctx.lineTo(97,111.333);
    ctx.lineTo(x + 14, y - 4.667);

    // ctx.lineTo(92.333,116);
    ctx.lineTo(x + 9.333, y);

    // ctx.lineTo(87.666,111.333);
    ctx.lineTo(x + 4.666, y - 4.667);

    ctx.lineTo(x, y);
    ctx.fill();			// 形状完成

    // 眼白
    ctx.fillStyle = "white";
    ctx.beginPath();
    /* 左眼白 == */
    // ctx.moveTo(91,96);
    ctx.moveTo(x + 8, y - 20);

    // ctx.bezierCurveTo(88,96,87,99,87,101);
    ctx.bezierCurveTo(x + 5, y - 20, x + 4, y - 17, x + 4, y - 15);

    // ctx.bezierCurveTo(87,103,88,106,91,106);
    ctx.bezierCurveTo(x + 4, y - 13, x + 5, y - 10, x + 8, y - 10);

    // ctx.bezierCurveTo(94,106,95,103,95,101);
    ctx.bezierCurveTo(x + 11, y - 10, x + 12, y - 13, x + 12, y - 15);

    // ctx.bezierCurveTo(95,99,94,96,91,96);
    ctx.bezierCurveTo(x + 12, y - 17, x + 11, y - 20, x + 8, y - 20);

    /* 右眼白 ==  */
    // ctx.moveTo(103,96);
    ctx.moveTo(x + 20, y - 20);

    // ctx.bezierCurveTo(100,96,99,99,99,101);
    ctx.bezierCurveTo(x + 17, y - 20, x + 16, y - 17, x + 16, y - 15);

    // ctx.bezierCurveTo(99,103,100,106,103,106);
    ctx.bezierCurveTo(x + 16, y - 13, x + 17, y - 10, x + 20, y - 10);

    // ctx.bezierCurveTo(106,106,107,103,107,101);
    ctx.bezierCurveTo(x + 23, y - 10, x + 24, y - 13, x + 24, y - 15);

    // ctx.bezierCurveTo(107,99,106,96,103,96);
    ctx.bezierCurveTo(x + 24, y - 17, x + 23, y - 20, x + 20, y - 20);
    ctx.fill();

    // 眼球 向左看还是向右看  false, true
    ctx.fillStyle = "black";

    if (spy && spy == 'left') {
    	ctx.beginPath();
	    ctx.arc(x + 18, y - 14, 2, 0, Math.PI*2, true);
	    ctx.fill();

	    ctx.beginPath();
	    ctx.arc(x + 6, y - 14, 2, 0, Math.PI*2, true);
	    ctx.fill();

    } else {
    	ctx.beginPath();
	    ctx.arc(x + 22, y - 14, 2, 0, Math.PI*2, true);
	    ctx.fill();

	    ctx.beginPath();
	    ctx.arc(x + 10, y - 14, 2, 0, Math.PI*2, true);
	    ctx.fill();
    }
}