(function(window, undefined) {

	/*
	 * util 为通用的工具类，
	 * 对一些常用的方法（如去字符串空格的方法trim，判断字符串类型的方法isNumber/isVariable）
	 * 实现了封装
	 * 对外公开的类名为 UT
	 */
	var util = {
		/*
		 * 去除字符串两边的空格
		 * @paran: string: 给定字符串
		 * return string
		 */
		trim: function(string) {
			var blankReg = /(^\s*)|(\s*$)/g; // 匹配首尾空格
			return string.replace(blankReg, "");
		},

		/*
		 * javascript语言的浮点运算存在精度问题，故需要自定义add方法
		 * @paran: $1 被加数，$2 加数， opt 运算符
		 * return number 运算结果
		 */
		calculate: function($1, $2, opt) {
			// 字符串拼接，除去中间引号
			// '123' + '456' = '123456'
			if (typeof $1 == 'string' && typeof $2 == 'string' && opt == '+') {
				arr1 = $1.split("");
				arr2 = $2.split("");
				arr1.pop();
				arr2.shift();
				$1 = arr1.join("");
				$2 = arr2.join("");
				return $1 + $2;
			}
			if (typeof $1 != 'number' || typeof $2 != 'number') {
				throw new Error("类型错误 Type error")
			}

			var index$1, //$1的浮点位
				index$2, // $2的浮点位
				mag; // 量级
			try {
				index$1 = $1.toString().split(".")[1].length;
			} catch (e) {
				index$1 = 0;
			}
			try {
				index$2 = $2.toString().split(".")[1].length;
			} catch (e) {
				index$2 = 0;
			}
			mag = Math.pow(10, Math.max(index$1, index$2));
			switch (opt) {
				case '+':
					return ($1 * mag + $2 * mag) / mag;
				case '-':
					return ($1 * mag - $2 * mag) / mag;
				case '*':
					return $1 * $2;
				case '/':
					return (($1 * mag) / ($2 * mag));
				case '%':
					return parseInt($1) % parseInt($2);
				default:
					throw new Error("Uncaught SyntaxError: Invalid or unexpected token: " + opt);
			}
		},

		/*
		 * 求数组最大值
		 * @paran: array 给定数组
		 * return number
		 */
		max: function(array) {
			if (Object.prototype.toString.call(array) !== '[object Array]' ||
				array.length == 0) {
				throw new Error("参数错误，max(array) 的参数必须为数组且长度大于0");
			}
			var maxNum = array[0];
			for (var i = 1; i < array.length; i++) {
				if (array[i] > maxNum) maxNum = array[i];
			}
			return maxNum;
		},

		/*
		 * 求数组最小值
		 * @paran: array 给定数组
		 * return number
		 */
		min: function(array) {
			if (Object.prototype.toString.call(array) !== '[object Array]' ||
				array.length == 0) {
				throw new Error("参数错误，max(array) 的参数必须为数组且长度大于0");
			}
			var minNum = array[0];
			for (var i = 1; i < array.length; i++) {
				if (array[i] < minNum) minNum = array[i];
			}
			return minNum;
		},

		/*
		 * 判断字符串是否为数字
		 * @paran: string: 给定字符串
		 * return: true | false
		 */
		isBool: function(string) {
			var boolReg = /^true|false$/; // 匹配数字 int和float
			string = this.trim(string);
			return boolReg.test(string);
		},

		/*
		 * 判断字符串是否为数字
		 * return: true | false
		 */
		isNumber: function(string) {
			var numReg = /^\-*\s*(\d+|\-\d+)(\.?)(\d*)$/; // 匹配数字 int和float
			string = this.trim(string);
			return numReg.test(string);
		},

		/*
		 * 判断字符串是否为合法变量名
		 * @paran: string: 给定字符串
		 * return: true | false
		 */
		isVariable: function(string) {
			var varReg = /^[a-zA-Z]\w*$/; // 匹配合法变量名 字母开头，后跟字母数字下划线
			string = this.trim(string);
			return varReg.test(string);
		},

		/*
		 * 判断字符串是否为"[]"
		 * @paran: string: 给定字符串
		 * return: true | false
		 */
		isDel: function(string) {
			var delReg = /^\[\s*\]$/; // 匹配合法变量名 字母开头，后跟字母数字下划线
			string = this.trim(string);
			return delReg.test(string);
		},

		/*
		 * 去除引号内容后，检查整个字符串是否含非法字符@#$等
		 * @paran: string: 给定字符串
		 * return true: 合法
		 *				false: 非法
		 */
		isValid: function(string) {
			var validReg = /^[\w\s\!\%\^\&\|\+\-\*\/\(\)\=\[\]]+$/; // 合法的所有字符
			// 返回字符串是否合法
			return validReg.test(string);
		},

		/*
		 * 生成随机字符串
		 * return 随机string
		 */
		getRandString: function() {
			var string = "" + Math.random();
			string = string.substring(2);
			return "x" + string;
		}
	}

	// 将util注册进全局 window 对象中
	window.UT = util;

})(window);