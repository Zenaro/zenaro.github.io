var Game = {
	canvas: null,
	canvasCtx: null,
	cell: 30, // 地图以30为一个单元格
	width: 0, // 容器宽度
	height: 0, // 容器高度
	origin: 10, // 除去外边框, 地图从点(10, 10) 开始
	count: 0, // 总果实数
	fruits: [], // 果实2维数组，0表示该地点无果实，全部被主人公吃光时游戏胜利
	forbiddenArea: [], // 禁区 - 2维数组
	timer: null, // 定时器
	heroInfo: { // 主人公位置，方向等相关信息
		x: 0,
		y: 0,
		dir: 'stop' // left, top, right, bottom, stop
	},

	// 初始化参数
	init: function() {
		this.width = this.cell * 23 + 2 * this.origin;
		this.height = this.cell * 7 + 2 * this.origin;
		this.canvas = document.getElementById('myCanvas');
		this.canvasCtx = this.canvas.getContext('2d');

		// 初始化 fruits 2维数组
		var start = this.cell / 2 + this.origin,
			length = this.width,
			cell = this.cell;
		for (var i = start; i < length; i += cell) {
			this.fruits[i] = [];
		}

		this.render();
		this.bind();
	},

	// 渲染
	render: function() {
		// 画容器外边框
		this.drawRect(this.canvasCtx, this.origin - 8, this.origin - 8, this.width, this.height, 15);

		// 画容器内边框
		this.drawRect(this.canvasCtx, this.origin - 1, this.origin - 1, this.width - 14, this.height - 14, 9);

		// 画小怪兽
		this.drawMonster(this.canvasCtx, 25, 25, 'left');

		// 定位主人公，并画出
		this.heroInfo.x = this.width / 2;
		this.heroInfo.y = this.height / 2;
		this.drawHero(this.canvasCtx, this.heroInfo.x, this.heroInfo.y);

		var start = this.cell / 2 + this.origin,
			xLength = this.width - 10,
			yLength = this.height - 10,
			cell = this.cell;
		// for (var i = start; i < xLength; i += cell) {
		for (var i = start; i < xLength; i += cell) {
			for (var j = start + cell * 5; j < yLength; j += cell) {
				this.fruits[i][j] = true;
				this.count++;
				this.drawDot(this.canvasCtx, i, j);
			}
		}
	},

	// 键盘事件绑定
	bind: function() {
		var self = this;
		document.body.onkeydown = function(event) {
			var e = event || window.event;
			var dir = 'left';
			switch (e.keyCode) {
				case 37: // 左
					dir = 'left';
					break;
				case 38: // 上
					dir = 'top';
					break;
				case 39: // 右
					dir = 'right';
					break;
				case 40: // 下
					dir = 'bottom';
					break;
				default:
					dir = self.heroInfo.dir;
			}
			if (self.heroInfo.dir !== dir) {
				self.oneStep(dir);
			}
		}
		document.body.onkeyup = function() {
			// setTimeout(function() {
			// 	self.heroInfo.dir = 'stop';
			// 	self.timer && clearInterval(self.timer);
			// }, 0);
		}
	},

	// 走一步相应的连帧动画 及相关操作
	motion: function(ctx, dir) {
		var x = this.heroInfo.x,
			y = this.heroInfo.y;
		if (this.overstep(x, y, dir) === true) { // 已越界
			this.timer && clearInterval(this.timer);
			return;
		}

		if (dir === 'left') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawHeroFull(ctx, x - this.cell / 2, y);
				setTimeout(() => {
					ctx.clearRect(x - this.cell, y - this.cell / 2, this.cell, this.cell);
					this.drawHero(ctx, x - this.cell, y, 'left');
					this.heroInfo.x = x - this.cell;
					this.heroInfo.dir = 'left';
				}, 100);
			}, 100);

		} else if (dir === 'right') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawHeroFull(ctx, x + this.cell / 2, y);
				setTimeout(() => {
					ctx.clearRect(x, y - this.cell / 2, this.cell, this.cell);
					this.drawHero(ctx, x + this.cell, y, 'right');
					this.heroInfo.x = x + this.cell;
					this.heroInfo.dir = 'right';
				}, 100);
			}, 100);

		} else if (dir === 'top') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawHeroFull(ctx, x, y - this.cell / 2);
				setTimeout(() => {
					ctx.clearRect(x - this.cell / 2, y - this.cell, this.cell, this.cell);
					this.drawHero(ctx, x, y - this.cell, 'top');
					this.heroInfo.y = y - this.cell;
					this.heroInfo.dir = 'top';
				}, 100);
			}, 100);

		} else if (dir === 'bottom') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawHeroFull(ctx, x, y + this.cell / 2);
				setTimeout(() => {
					ctx.clearRect(x - this.cell / 2, y, this.cell, this.cell);
					this.drawHero(ctx, x, y + this.cell, 'bottom');
					this.heroInfo.y = y + this.cell;
					this.heroInfo.dir = 'bottom';
				}, 100);
			}, 100);
		}

	},

	// 动作 “吃”的相关逻辑
	// 若点(x, y)上有果实，则吃掉，并判断是否结束游戏
	eat: function(x, y) {
		// 吃掉本位置的果实
		if (this.fruits[x][y] === true) {
			this.fruits[x][y] = false;
			this.count--;
			if (this.count <= 0) {
				window.alert('胜利!');
				this.timer && clearInterval(this.timer);
				// this.init();
			}
		}
	},

	// 越界检查
	overstep: function(fromX, fromY, dir) {
		if ((dir === 'left' && fromX - this.cell > this.origin) ||
			(dir === 'right' && fromX + this.cell < this.width - this.origin) ||
			(dir === 'top' && fromY - this.cell > this.origin) ||
			(dir === 'bottom' && fromY + this.cell < this.height - this.origin)) {

			return false; // 未越界

		} else {
			return true;
		}
	},

	// 转移方向, 是否走一步的越界检查
	oneStep: function(dir) {
		this.heroInfo.dir = dir;
		this.timer && clearInterval(this.timer);

		var fromX = this.heroInfo.x,
			fromY = this.heroInfo.y;

		if (this.overstep(fromX, fromY, dir) === false) { // 未越界

			// 先执行一步，以消解延时
			// this.timer = setInterval(this.motion.bind(this, this.canvasCtx, dir), 1000);
			this.timer = setInterval(() => {
				this.motion(this.canvasCtx, dir);
			}, 300);

		} else { // 越界则只修改方向
			this.timer && clearInterval(this.timer);
			this.drawHero(this.canvasCtx, fromX, fromY, dir);
		}
		// this.timer = setInterval(this.motion, 1000);
	},

	/*
	 * 绘制圆角矩形的函数
	 * @ctx: canvas上下文对象
	 * @x: 起点x坐标
	 * @y: 起点y坐标
	 * @width: 矩形宽
	 * @height: 矩形高
	 * @radius: border-radius
	 */
	drawRect: function(ctx, x, y, width, height, radius) {
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
		ctx.closePath();
	},

	/*
	 * 描点的函数
	 * @ctx: canvas上下文对象
	 * @x: 点中心x坐标
	 * @y: 点中心y坐标
	 */
	drawDot: function(ctx, x, y) {
		ctx.fillRect(x - 2, y - 2, 4, 4);
	},

	/*
	 * 绘制主人公的函数
	 * @ctx: canvas上下文对象
	 * @x: 中心点x坐标
	 * @y: 中心点y坐标
	 * @direction: 主人公的嘴巴方向
	 */
	drawHero: function(ctx, x, y, direction) {
		var radius = this.cell / 2;
		ctx.clearRect(x - radius, y - radius, 2 * radius, 2 * radius); // 先擦除内部
		ctx.beginPath();

		//从1/7半圆弧开始, 画到-1/7半圆弧 ==> 相当于去掉1/7圆周
		// @ false => 顺时针
		if (direction == 'bottom') {
			ctx.arc(x, y, radius, 9 * Math.PI / 14, 5 * Math.PI / 14, false);

		} else if (direction == 'left') {
			ctx.arc(x, y, radius, 8 * Math.PI / 7, 6 * Math.PI / 7, false);

		} else if (direction == 'top') {
			ctx.arc(x, y, radius, 23 * Math.PI / 14, 19 * Math.PI / 14, false);

		} else {
			ctx.arc(x, y, radius, Math.PI / 7, -Math.PI / 7, false);
		}
		ctx.lineTo(x, y); // 回到中心点 以形成闭合路径
		ctx.fill(); // color填充

		ctx.closePath();
		this.eat(x, y);
	},

	/*
	 * 绘制主人公闭上嘴巴的函数，动画用
	 * @ctx: canvas上下文对象
	 * @x: 中心点x坐标
	 * @y: 中心点y坐标
	 */
	drawHeroFull: function(ctx, x, y) {
		var radius = this.cell / 2;
		ctx.clearRect(x - radius, y - radius, 2 * radius, 2 * radius); // 先擦除内部
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, false);
		// ctx.lineTo(x, y); // 回到中心点 以形成闭合路径
		ctx.fill(); // color填充

		ctx.closePath();
	},

	/*
	 * 绘制小怪兽的函数
	 * 小怪兽的半径为 15
	 * @ctx: canvas上下文对象
	 * @x: 中心点x坐标
	 * @y: 中心点y坐标
	 * @direction: 主人公的眼睛方向
	 */
	drawMonster: function(ctx, x, y, direction) {
		ctx.beginPath();

		x ? x = x - 15 : x = 50;
		y ? y = y + 15 : y = 50;
		// 从最左最下边的尖角开始画起
		ctx.moveTo(x, y);

		ctx.lineTo(x, y - 14);

		// 三次贝塞尔曲线，对应小怪兽左边的圆弧
		ctx.bezierCurveTo(x, y - 22, x + 6, y - 28, x + 14, y - 28);

		// 对应右边的圆弧	
		ctx.bezierCurveTo(x + 22, y - 28, x + 28, y - 22, x + 28, y - 14);

		// 最右下边的尖角
		ctx.lineTo(x + 28, y);

		// 底下的几个尖角
		ctx.lineTo(x + 23.333, y - 4.667);
		ctx.lineTo(x + 18.666, y);
		ctx.lineTo(x + 14, y - 4.667);
		ctx.lineTo(x + 9.333, y);
		ctx.lineTo(x + 4.666, y - 4.667);
		ctx.lineTo(x, y);
		ctx.fill(); // 小怪兽整体轮廓完成，填充颜色
		ctx.closePath();

		// 接下来开始画眼白
		ctx.fillStyle = "white";
		ctx.beginPath();
		// 画左眼白
		ctx.moveTo(x + 8, y - 20);

		ctx.bezierCurveTo(x + 5, y - 20, x + 4, y - 17, x + 4, y - 15);

		ctx.bezierCurveTo(x + 4, y - 13, x + 5, y - 10, x + 8, y - 10);

		ctx.bezierCurveTo(x + 11, y - 10, x + 12, y - 13, x + 12, y - 15);

		ctx.bezierCurveTo(x + 12, y - 17, x + 11, y - 20, x + 8, y - 20);

		// 画右眼白
		ctx.moveTo(x + 20, y - 20);

		ctx.bezierCurveTo(x + 17, y - 20, x + 16, y - 17, x + 16, y - 15);

		ctx.bezierCurveTo(x + 16, y - 13, x + 17, y - 10, x + 20, y - 10);

		ctx.bezierCurveTo(x + 23, y - 10, x + 24, y - 13, x + 24, y - 15);

		ctx.bezierCurveTo(x + 24, y - 17, x + 23, y - 20, x + 20, y - 20);
		ctx.fill();
		ctx.closePath();

		// 最后画眼睛
		ctx.fillStyle = "black";
		// 眼球 向左看还是向右看  false, true
		if (!direction) { // 左
			ctx.beginPath();
			ctx.arc(x + 18, y - 14, 2, 0, Math.PI * 2, true);
			ctx.fill();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(x + 6, y - 14, 2, 0, Math.PI * 2, true);
			ctx.fill();
			ctx.closePath();

		} else { // 右
			ctx.beginPath();
			ctx.arc(x + 22, y - 14, 2, 0, Math.PI * 2, true);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.arc(x + 10, y - 14, 2, 0, Math.PI * 2, true);
			ctx.fill();
			ctx.closePath();
		}
	}
};