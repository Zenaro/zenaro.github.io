(function() {
	Vue.config.devtools = false;
	new Vue({
		el: 'body',
		data: {
			optStack: [], // 运算符栈
			numStack: [], // 数字栈
			varHash: {}, // 存放变量的哈希表
			stringList: [],
			inputString: "",
			string: ""
		},
		ready: function() {
			// this.splitString("234.324 + 5");
			// this.string = "'123'='444'='888'456";
			// this.preProcess(this.string);
			// console.log(this.string);
			// var reg = /^\w|\s|\!|\%|\^|\&|\*|\(|\)|\-|\=|\+|\/+$/;
			var tereg = /^\d+$/;
			var string = 'asd';
			var index = string.lastIndexOf("=");
			console.log(string.split("="));
			// this.isVariable(string);
		},
		methods: {
			/*
			 * 字符串分析入口
			 */
			analyse: function() {
				var string = this.inputString;
				this.string = this.preProcess(string); // 对字符串进行预处理
				if (!this.preCheck(this.string)) { // 检查字符串是否合法
					this.pushData({
						resultString: "语法错误 (Uncaught SyntaxError: Invalid or unexpected token)",
						type: 'error'
					});

				} else { // 通过 = 号将字符串分为左部分（赋值部分）和右部分（运算部分）
					var index = this.string.lastIndexOf("=");
					var result = "";
					if (index > 0) {
						var validateReg = /^[\w\s\=]+$/;
						var optString = this.string.substring(index + 1);
						var validateString = this.string.substring(0, index);
						if (!validateReg.test(validateString)) {
							this.pushData({
								resultString: "语法错误 (Uncaught SyntaxError: Invalid or unexpected token)",
								type: 'error'
							});
							return;
						}
						this.splitString(optString); // 剪切字符串，分析，并压入对应的栈
						result = this.formatStack();
						if (result) {
							this.validate(validateString, result);
							result = validateString + " = " + result;
						}

					} else {
						this.splitString(this.string); // 剪切字符串，分析，并压入对应的栈
						result = this.formatStack();
					}

					if (result) { // 分析结果顺利
						this.pushData({
							resultString: result,
							type: 'success'
						});
					}
				}
			},

			/*
			 * string 引号的预处理
			 * 将string中的引号部分用变量代替，+=号等的处理未完成
			 * 返回预处理后的字符串
			 * return string
			 */
			preProcess: function(string) {
				var quoteReg = /\'[^']*\'|\"[^"]*\"/g; // 匹配引号中的内容

				// 将string中的引号部分用变量代替
				var key = "";
				return string.replace(quoteReg, function(target) {
					do {
						key = this.getRandString();
					} while (key in this.varHash);
					this.varHash[key] = target;
					return key;
				}.bind(this));
			},

			/*
			 * 预处理 preProcess 后，检查字符串是否含非法字符
			 * @paran string
			 * return true: 合法
			 *				false: 非法
			 */
			preCheck: function(string) {
				var validReg = /^[\w\s\!\%\^\&\*\(\)\-\=\+\/]+$/; // 合法的字所有符
				// 返回字符串是否合法
				return validReg.test(string);
			},

			/*
			 * @param string 可运算的字符串
			 * 对给定字符串进行切割
			 * 切割的同时分析字符串是否合法
			 * 切割后分析，并压入对应的栈
			 * 变量或数字压入this.numStack，运算符压入this.optStack
			 * return void;
			 */
			splitString: function(string) {
				var optReg = /(^[\=\+\-\*\/\!\%\^\&\(\)])/; // 匹配运算符=+-*/!%&左右括号
				var numReg = /(^\d+|\-\d+)(\.?)(\d*)/; // 匹配数字（包括正负、int、double） 
				var varReg = /(^\w+)/; // 匹配变量和=
				var target = ""; // 匹配的字符串
				var nextState = 'identifier'; // 下一个后续合法的字符类型 identifier | opt

				while (string.length > 0) {
					string = this.trim(string); // 去除空格
					if (nextState == 'identifier') { // 下一个合法字符为数字或变量
						target = string.match(varReg)[0];
						if (this.isVariable(target)) { // 变量
							if (target in this.varHash) { // 查变量的hash表
								target = this.varHash[target];
								string = string.replace(numReg, "");

							} else { // 不存在该变量则报错
								this.pushData({
									resultString: "查询错误 (Uncaught ReferenceError: " +
										target + " is not defined)",
									type: 'error'
								});
								return;
							}

						} else if (this.isNumber(target)) { // 数字
							target = parseFloat(string.match(numReg)[0]);
							string = string.replace(numReg, "");

						} else {
							this.pushData({
								resultString: "语法错误 (Uncaught SyntaxError: Invalid or unexpected token)",
								type: 'error'
							});
							return;
						}

						this.numStack.push(target);
						nextState = 'opt';

					} else if (nextState == 'opt') { // 下一个合法字符为运算符
						if (optReg.test(string)) { // 匹配结果为运算符
							this.optStack.push(string[0]);
							string = string.substring(1);
						}
						nextState = 'identifier';
					}

					/*if (optReg.test(string)) { // 匹配结果为运算符
						this.optStack.push(string[0]);
						string = string.substring(1);

					} else if (numReg.test(string)) { // 数字
						var temp = parseFloat(string.match(numReg)[0]);
						this.numStack.push(temp);
						string = string.replace(numReg, "");

					} else if (varReg.test(string)) { // 变量
						var temp = string.match(varReg)[0];
						this.numStack.push(temp);
						string = string.replace(varReg, "");

					} else {
						console.log("ERROR - 无法处理的符号：" + string[0] + "(来自" + string + ")");
						break;
					}*/
				}
			},

			/*
			 * 对optStack和numStack两个栈进行计算
			 */
			formatStack: function() {
				var optStack = this.optStack;
				var numStack = this.numStack;
				// 循环地弹出栈并进行计算
				while (optStack.length > 0) {
					var temp = this.calculate(optStack.pop(), numStack.pop(), numStack.pop());
					numStack.push(temp);
				}
				// 当optStack为空时，numStack剩下唯一一个元素，即numStack[0]即为结果
				return numStack.pop();
			},

			/*
			 * 运算
			 * @param opt 运算符
			 * @param n1
			 * @param n1
			 * @return 
			 */
			calculate: function(opt, n2, n1) {
				switch (opt) {
					case "+":
						return n1 + n2;
					case "-":
						return n1 - n2;
					case "*":
						return n1 * n2;
					case "/":
						return n1 / n2;
					default:
						throw new Error("unexpected operator:" + opt);
				}
			},

			/*
			 * 赋值操作
			 */
			validate: function(validateString, result) {
				validateString.split("=").map(function(value) {
					this.varHash[value] = result;
				}.bind(this));
			},

			/*
			 * 视图更新函数
			 * 当完成字符串分析后，
			 * 对数据结构stringList进行条目的添加
			 * 添加的条目是词法分析和语法分析后的结果
			 * @param: data: {
					resultString: "结果字符串",
					type: "error" | "success" // 结果类型
			 *}
			 */
			pushData: function(data) {
				var prevList = this.stringList;
				var originString = this.inputString;
				var resultString = data.resultString;

				// 将计算结果添加进视图数组中
				prevList.push({
					originString: originString,
					resultString: resultString,
					type: data.type
				});
				this.$set('stringList', prevList); // 更新数据结构stringList
				this.$set('inputString', ''); // 还原input控件的内容
			},

			/*
			 * 去除字符串两边的空格
			 * return string
			 */
			trim: function(string) {
				var blankReg = /(^\s*)|(\s*$)/g; // 匹配首尾空格
				return string.replace(blankReg, "");
			},

			/*
			 * 判断字符串是否为数字
			 * return: true | false
			 */
			isNumber: function(string) {
				var numReg = /^\d+$/; // 匹配数字
				string = this.trim(string);
				return numReg.test(string);
				// return false;
			},

			/*
			 * 判断字符串是否为合法变量名
			 * return: true | false
			 */
			isVariable: function(string) {
				var numReg = /^\d/; // 匹配开头数字
				var varReg = /^\w+$/;
				string = this.trim(string);
				if (numReg.test(string)) return false;
				return varReg.test(string);
				// return false;
			},

			/*
			 * 生成随机字符串
			 * return 随机string
			 */
			getRandString: function() {
				// var date = new Date();
				var string = "" + Math.random();
				string = string.substring(2);
				return "x" + string;
			}
		}
	});
})();