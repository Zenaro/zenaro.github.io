(function(window, undefined) {
	var util = {
		/*
		 * 去除字符串两边的空格
		 * return string
		 */
		trim: function(string) {
			var blankReg = /(^\s*)|(\s*$)/g; // 匹配首尾空格
			return string.replace(blankReg, "");
		},

		/*
		 * 求数组最大值
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
		 * return number
		 */
		min: function(array) {
			if (Object.prototype.toString.call(array) !== '[object Array]' ||
				array.length == 0) {
				throw new Error("参数错误，max(array) 的参数必须为数组且长度大于0");
			}
			var minNum = array[0];
			for (var i = 1; i < array.length; i++) {
				if (array[i] < maxNum) maxNum = array[i];
			}
			return minNum;
		},

		/*
		 * 判断字符串是否为数字
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
			var numReg = /^(\d+|\-\d+)(\.?)(\d*)$/; // 匹配数字 int和float
			string = this.trim(string);
			return numReg.test(string);
		},

		/*
		 * 判断字符串是否为合法变量名
		 * return: true | false
		 */
		isVariable: function(string) {
			var varReg = /^[a-zA-Z]\w*$/; // 匹配合法变量名 字母开头，后跟字母数字下划线
			string = this.trim(string);
			return varReg.test(string);
		},

		/*
		 * 判断字符串是否为"[]"
		 * return: true | false
		 */
		isDel: function(string) {
			var delReg = /^\[\s*\]$/; // 匹配合法变量名 字母开头，后跟字母数字下划线
			string = this.trim(string);
			return delReg.test(string);
		},

		/*
		 * 去除引号内容后，检查整个字符串是否含非法字符@#$等
		 * @paran string
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