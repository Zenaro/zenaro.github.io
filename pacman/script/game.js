var Game = {
	canvas: null,
	canvasCtx: null,
	cell: 30, // 地图以30为一个单元格
	width: 0, // 容器宽度
	height: 0, // 容器高度
	origin: 10, // 除去外边框, 地图从点(10, 10) 开始
	count: 0, // 果实总数
	score: 0, // 当前分数
	overall: 0, // 通关门槛分数
	fruits: [], // 果实2维数组，0表示该地点无果实，全部被主人公吃光时游戏胜利
	forbiddenArea: [], // 禁区 - 2维数组
	timer: null, // 定时器
	monsterTimer: null, // 怪兽定时器
	overFlag: false, // 游戏结束
	heroInfo: { // 主人公位置，方向等相关信息
		x: 0,
		y: 0,
		dir: 'stop', // left, top, right, bottom, stop
		finish: true
	},
	monsterInfo: { // 怪兽位置方向等信息
		x: 0,
		y: 0,
		dir: 'stop',
		discover: false
	},

	// 初始化参数
	init: function() {
		this.count = 0;
		this.score = 0;
		this.overFlag = false;
		this.width = this.cell * 23 + 2 * this.origin;
		this.height = this.cell * 7 + 2 * this.origin;
		this.canvas = document.getElementById('myCanvas');
		this.canvasCtx = this.canvas.getContext('2d');
		this.monsterInfo.x = 145;
		this.monsterInfo.y = 115;
		this.modalUp();
		// 初始化 fruits 2维数组 和 禁区 2维数组
		var start = this.cell / 2 + this.origin,
			length = this.width,
			cell = this.cell;
		for (var i = start; i < length; i += cell) {
			this.fruits[i] = [];
			this.forbiddenArea[i] = [];
		}

		this.render();
		this.bind();
	},

	// 渲染
	render: function() {
		// 清理画布
		this.canvasCtx.clearRect(0, 0, this.width, this.height);

		// 画容器外边框
		this.drawRect(this.origin - 8, this.origin - 8, this.width, this.height, 15);

		// 画容器内边框
		this.drawRect(this.origin - 1, this.origin - 1, this.width - 14, this.height - 14, 9);

		// 画果实
		var start = this.cell / 2 + this.origin,
			xLength = this.width - this.origin,
			yLength = this.height - this.origin,
			cell = this.cell;
		for (var i = start; i < xLength; i += cell) {
			for (var j = start; j < yLength; j += cell) {
				this.fruits[i][j] = true;
				this.forbiddenArea[i][j] = false;
				this.count++;
				this.drawDot(i, j);
			}
		}

		// 画小怪兽
		this.drawMonster(this.monsterInfo.x, this.monsterInfo.y, 'right');

		// 开启小怪兽跑步定时器
		this.monsterTimer = setInterval(() => {
			this.monsterRun();
		}, 300);

		// 定位主人公，并画出
		this.heroInfo.x = this.width / 2;
		this.heroInfo.y = this.height / 2;
		this.drawHero(this.heroInfo.x, this.heroInfo.y);
		// 画随机禁区
		for (var i = start; i < xLength; i += cell) {
			for (var j = start; j < yLength; j += cell) {
				if (Math.random() > 0.85 && // 随机产生矩形，但不能与人物位置冲突
					(i !== this.heroInfo.x || j !== this.heroInfo.y) &&
					(i !== this.monsterInfo.x || j !== this.monsterInfo.y)) {
					this.forbiddenArea[i][j] = true;
					this.fruits[i][j] = false;
					this.count--;
					this.drawRect(i - this.cell / 2 + 2, j - this.cell / 2 + 2, this.cell - 4, this.cell - 4, 3);
				}
			}
		}

		// 设置通关门槛
		this.overall = ~~(this.count * 0.4);
		document.getElementById('overall').innerHTML = this.overall;
	},

	// 键盘事件绑定
	bind: function() {
		var self = this;
		// 由于只有此处用到事件，故直接使用onkeydown而不封装事件Util效果更好
		document.getElementById('btn-restart').onclick = function() {
			self.init();
		}
		document.body.onkeydown = function(event) {
			if (self.overFlag) {
				return;
			}
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
			// if (self.heroInfo.dir !== dir) {
			self.oneStep(dir);
			// }
		}
	},

	// 越界检查
	overstep: function(fromX, fromY, dir) {
		if ((dir === 'left' && fromX - this.cell > this.origin && !this.forbiddenArea[fromX - this.cell][fromY]) ||
			(dir === 'right' && fromX + this.cell < this.width - this.origin && !this.forbiddenArea[fromX + this.cell][fromY]) ||
			(dir === 'top' && fromY - this.cell > this.origin && !this.forbiddenArea[fromX][fromY - this.cell]) ||
			(dir === 'bottom' && fromY + this.cell < this.height - this.origin && !this.forbiddenArea[fromX][fromY + this.cell])) {

			return false; // 未越界

		} else {
			return true;
		}
	},

	// 小怪兽跑步
	monsterRun: function() {
		var x = this.monsterInfo.x,
			y = this.monsterInfo.y,
			ctx = this.canvasCtx,
			dir = this.monsterInfo.dir;

		// 发现猎物
		if (this.monsterInfo.discover && (x === this.heroInfo.x || y === this.heroInfo.y)) {

		} else if (x === this.heroInfo.x) {
			var i = y,
				cell = this.cell,
				length = this.heroInfo.y;

			if (y < this.heroInfo.y) {
				for (; i < length; i += cell) {
					if (this.forbiddenArea[x][i]) {
						this.monsterInfo.discover = false;
						break;
					} else if (i === length - this.cell) {
						this.monsterInfo.dir = 'bottom';
						this.monsterInfo.discover = true;
					}
				}
			} else {
				for (; i > length; i -= cell) {
					if (this.forbiddenArea[x][i]) {
						this.monsterInfo.discover = false;
						break;
					} else if (i === length + this.cell) {
						this.monsterInfo.dir = 'top';
						this.monsterInfo.discover = true;
					}
				}
			}

		} else if (y === this.heroInfo.y) {
			var i = x,
				cell = this.cell,
				length = this.heroInfo.x;
			if (x < this.heroInfo.x) {
				for (; i < length; i += cell) {
					if (!!this.forbiddenArea[i][y]) {
						this.monsterInfo.discover = false;
						break;
					} else if (i === length - this.cell) {
						this.monsterInfo.dir = 'right';
						this.monsterInfo.discover = true;
					}
				}
			} else {
				for (; i > length; i -= cell) {
					if (!!this.forbiddenArea[i][y]) {
						this.monsterInfo.discover = false;
						break;
					} else if (i === length + this.cell) {
						this.monsterInfo.dir = 'left';
						this.monsterInfo.discover = true;
					}
				}
			}

		} else {
			this.monsterInfo.discover = false;
		}

		if (!this.monsterInfo.discover) { // 未发现猎物则随机走位
			var rand = Math.random();
			if (rand < 0.25) {
				dir = 'left';

			} else if (rand < 0.5) {
				dir = 'right';

			} else if (rand < 0.75) {
				dir = 'top';

			} else {
				dir = 'bottom';
			}
			this.monsterInfo.dir = dir;
		}

		this.monsterEat(this.monsterInfo.dir);

		if (this.overstep(x, y, this.monsterInfo.dir)) { // 越界则直接修改方向
			this.monsterInfo.dir = dir;

		} else {
			this.monsterMotion(this.monsterInfo.dir);
		}
	},

	// 怪兽移动一步相应的连帧动画
	monsterMotion: function(dir) {
		var x = this.monsterInfo.x,
			y = this.monsterInfo.y,
			ctx = this.canvasCtx;
		if (this.overstep(x, y, dir) === true) { //已越界
			return;
		}

		if (dir === 'left') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawMonster(x - this.cell / 2, y);
				this.fruits[x][y] && this.drawDot(x, y);
				setTimeout(() => {
					ctx.clearRect(x - this.cell, y - this.cell / 2, this.cell, this.cell);
					this.drawMonster(x - this.cell, y, 'left');
					this.fruits[x][y] && this.drawDot(x, y);
					this.monsterInfo.x = x - this.cell;
					this.monsterInfo.dir = 'left';
				}, 100);
			}, 100);

		} else if (dir === 'right') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawMonster(x + this.cell / 2, y);
				this.fruits[x][y] && this.drawDot(x, y);
				setTimeout(() => {
					ctx.clearRect(x, y - this.cell / 2, this.cell, this.cell);
					this.drawMonster(x + this.cell, y, 'right');
					this.fruits[x][y] && this.drawDot(x, y);
					this.monsterInfo.x = x + this.cell;
					this.monsterInfo.dir = 'right';
				}, 100);
			}, 100);

		} else if (dir === 'top') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawMonster(x, y - this.cell / 2);
				this.fruits[x][y] && this.drawDot(x, y);
				setTimeout(() => {
					ctx.clearRect(x - this.cell / 2, y - this.cell, this.cell, this.cell);
					this.drawMonster(x, y - this.cell, 'top');
					this.fruits[x][y] && this.drawDot(x, y);
					this.monsterInfo.y = y - this.cell;
					this.monsterInfo.dir = 'top';
				}, 100);
			}, 100);

		} else if (dir === 'bottom') {
			setTimeout(() => {
				ctx.clearRect(x - this.cell / 2, y - this.cell / 2, this.cell, this.cell);
				this.drawMonster(x, y + this.cell / 2);
				this.fruits[x][y] && this.drawDot(x, y);
				setTimeout(() => {
					ctx.clearRect(x - this.cell / 2, y, this.cell, this.cell);
					this.drawMonster(x, y + this.cell, 'bottom');
					this.fruits[x][y] && this.drawDot(x, y);
					this.monsterInfo.y = y + this.cell;
					this.monsterInfo.dir = 'bottom';
				}, 100);
			}, 100);
		}
	},

	// 怪兽吃人
	monsterEat: function(dir) {
		var cell = this.cell,
			monsX = this.monsterInfo.x,
			monsY = this.monsterInfo.y,
			heroX = this.heroInfo.x,
			heroY = this.heroInfo.y;

		if (
			(dir === 'left' && (monsX === heroX ||
				monsX - cell === heroX) && monsY === heroY) ||

			(dir === 'right' && (monsX === heroX ||
				monsX + cell === heroX) && monsY === heroY) ||

			(dir === 'top' && (monsY === heroY ||
				monsY - cell === heroY) && monsX === heroX) ||

			(dir === 'bottom' && (monsY === heroY ||
				monsY + cell === heroY) && monsX === heroX)
		) {

			this.gameOver('啊被吃掉了!~');
		}
	},

	gameOver: function(context) {
		this.overFlag = true;
		this.modalDown(context);
		this.monsterTimer && clearInterval(this.monsterTimer);
		this.timer && clearInterval(this.timer);
	},

	/*
	 * @con: 弹窗内容
	 */
	modalDown: function(con) {
		var content = typeof con === 'string' ? con : '游戏结束了';
		document.getElementById('modal-content').innerHTML = content;
		document.getElementById('dialog').style.display = 'block';
	},

	modalUp: function() {
		document.getElementById('dialog').style.display = 'none';
	},

	// 主人公走一步相应的连帧动画 及相关操作
	heroMotion: function(dir) {
		var fromX = this.heroInfo.x, // 从(fromX, fromY)出发，到(toX, toY)
			fromY = this.heroInfo.y,
			toX = fromX,
			toY = fromY, // 
			cell = this.cell, // 单位
			interval = 100, // 动画的时间差 100ms
			ctx = this.canvasCtx;
		if (this.overstep(fromX, fromY, dir) === true) { // 已越界
			this.timer && clearInterval(this.timer);
			this.drawHero(fromX, fromY, dir);
			this.heroInfo.finish = true;
			return;
		}
		this.heroInfo.finish = false;
		if (dir === 'left') {
			toX = fromX - cell;
		} else if (dir === 'right') {
			toX = fromX + cell;
		} else if (dir === 'top') {
			toY = fromY - cell;
		} else if (dir === 'bottom') {
			toY = fromY + cell;
		}

		setTimeout(() => {
			ctx.clearRect(fromX - this.cell / 2, fromY - this.cell / 2, this.cell, this.cell);
			this.drawHeroFull((fromX + toX) / 2, (fromY + toY) / 2);
			setTimeout(() => {
				ctx.clearRect((fromX + toX) / 2 - cell / 2, (fromY + toY) / 2 - cell / 2, cell, cell);
				this.drawHero(toX, toY, dir);
				this.heroInfo.x = toX;
				this.heroInfo.y = toY;
				this.heroInfo.dir = dir;
				this.heroInfo.finish = true;
			}, interval);
		}, interval);
	},

	// 主人公动作 “吃”的相关逻辑
	// 若点(x, y)上有果实，则吃掉，同时判断是否结束游戏，若点上是怪兽则失败
	heroEat: function(x, y) {
		// 吃掉本位置的果实
		if (this.monsterInfo.x === x && this.monsterInfo.y === y) {
			this.gameOver('啊被吃掉了!~');

		} else if (this.fruits[x][y] === true) {
			this.fruits[x][y] = false;
			this.count--;
			this.score += 1;
			document.getElementById('score').innerHTML = this.score;
			if (this.count <= 0 || (this.overall > 0 && this.score > this.overall - 1)) {
				this.gameOver('胜利！')
			}
		}
	},

	// 转移方向, 是否走一步的越界检查
	oneStep: function(dir) {
		this.heroInfo.dir = dir;
		this.timer && clearInterval(this.timer);

		var fromX = this.heroInfo.x,
			fromY = this.heroInfo.y;
		// if (!this.heroInfo.finish) return;

		if (this.overstep(fromX, fromY, dir) === false || !this.heroInfo.finish) { // 未越界或动作未完成

			// 先执行一步，以消解延时
			this.timer && clearInterval(this.timer);
			// this.heroMotion(dir);
			this.timer = setInterval(() => {
				this.heroInfo.finish && this.heroMotion(dir);
			}, 60);


		} else { // 越界则只修改方向
			this.timer && clearInterval(this.timer);
			this.drawHero(fromX, fromY, dir);
		}
	},

	/*
	 * 绘制圆角矩形的函数
	 * @x: 起点x坐标
	 * @y: 起点y坐标
	 * @width: 矩形宽
	 * @height: 矩形高
	 * @radius: border-radius
	 */
	drawRect: function(x, y, width, height, radius) {
		var ctx = this.canvasCtx;
		ctx.clearRect(x, y, width, height);
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
	 * @x: 点中心x坐标
	 * @y: 点中心y坐标
	 */
	drawDot: function(x, y) {
		this.canvasCtx.fillRect(x - 2, y - 2, 4, 4);
	},

	/*
	 * 绘制主人公的函数
	 * @x: 中心点x坐标
	 * @y: 中心点y坐标
	 * @direction: 主人公的嘴巴方向
	 */
	drawHero: function(x, y, direction) {
		var radius = this.cell / 2,
			ctx = this.canvasCtx;

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
		this.heroEat(x, y);
	},

	/*
	 * 绘制主人公闭上嘴巴的函数，动画用
	 * @x: 中心点x坐标
	 * @y: 中心点y坐标
	 */
	drawHeroFull: function(x, y) {
		var radius = this.cell / 2,
			ctx = this.canvasCtx;

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
	 * @x: 中心点x坐标
	 * @y: 中心点y坐标
	 * @direction: 主人公的眼睛方向
	 */
	drawMonster: function(x, y, direction) {
		var ctx = this.canvasCtx;
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
		if (direction === 'left' || direction === 'top') { // 左
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