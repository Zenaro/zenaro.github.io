## 经典游戏Pac-man
![pacman](http://7xstax.com1.z0.glb.clouddn.com/pacman.jpg)

在w3c官网上学习canvas的时候看到如何绘制pacman里面的怪兽，想着既然画出来了就顺便做出来玩一玩吧（神带入）。

代码放上了github，想玩的可以戳这里[在线测试->](http://zenaro.github.io/pacman/index.html)

可能用到的知识点：
有名的贝塞尔曲线：

![贝塞尔曲线](http://7xstax.com1.z0.glb.clouddn.com/Canvas_bezier.png)

使用三次贝塞尔曲线来绘制pacman中的小怪兽
``` bash
	var ctx = document.getElementById('canvas').getContext('2d');
	ctx.beginPath();

    // 从最左最下边的尖角开始画起
    ctx.moveTo(83,116);
    ctx.lineTo(83,102);

    // 三次贝塞尔曲线，对应小怪兽左边的圆弧
    ctx.bezierCurveTo(83,94,89,88,97,88);

    // 对应右边的圆弧  
    ctx.bezierCurveTo(105,88,111,94,111,102);

    // 底下的几个尖角
    ctx.lineTo(111,116);
    ctx.lineTo(106.333,111.333);
    ctx.lineTo(101.666,116);
    ctx.lineTo(97,111.333);
    ctx.lineTo(92.333,116);
    ctx.lineTo(87.666,111.333);
    ctx.lineTo(83,116);
    ctx.fill();
    // 小怪兽整体轮廓完成，填充颜色

    // 接下来开始画眼白
    ctx.fillStyle = "white";
    ctx.beginPath();

    // 画左眼白
    ctx.moveTo(91,96);
    ctx.bezierCurveTo(88,96,87,99,87,101);
    ctx.bezierCurveTo(87,103,88,106,91,106);
    ctx.bezierCurveTo(94,106,95,103,95,101);
    ctx.bezierCurveTo(95,99,94,96,91,96);

    // 画右眼白
    ctx.moveTo(103,96);
    ctx.bezierCurveTo(100,96,99,99,99,101);
    ctx.bezierCurveTo(99,103,100,106,103,106);
    ctx.bezierCurveTo(106,106,107,103,107,101);
    ctx.bezierCurveTo(107,99,106,96,103,96);
    ctx.fill();

    // 最后画眼睛
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(101,102,2,0,Math.PI*2,true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(89,102,2,0,Math.PI*2,true);
    ctx.fill();
```