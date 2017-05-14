(function() {
	Vue.config.devtools = false;
	var varHash = {}; // 存放变量的哈希表
	new Vue({
		el: 'body',
		data: {
			bnf: null,
			optStack: [], // 运算符栈
			numStack: [], // 数字栈
			// varHash: {},
			stringList: [], // 存储命令和结果列表
			cmdIndex: 0, // 第n条命令
			inputString: "",
			string: ""
		},
		ready: function() {
			this.bnf = new BNF();
		},
		methods: {
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
			pushData: function() {
				this.string = this.preProcess(this.inputString);
				var prevList = this.stringList;
				try {
					var resultString = bnf.init("a = true ? true ? 4 : 5: 3");
					prevList.push({
						originString: originString,
						resultString: resultString,
						type: 'success'
					});

				} catch (error) {
					var resultString = error.message;
					prevList.push({
						originString: originString,
						resultString: resultString,
						type: 'error'
					});
				}
				this.cmdIndex++;
				// 将计算结果添加进视图数组中
				this.$set('stringList', prevList); // 更新数据结构stringList
				this.inputString = ""; // 还原input控件的内容
			},

			/*
			 * 退回上一条命令
			 */
			prevCmd: function() {
				this.cmdIndex > 0 && this.cmdIndex--;
				this.inputString = this.stringList[this.cmdIndex].originString;
			},

			/*
			 * 退回下一条命令
			 */
			nextCmd: function() {
				var length = this.stringList.length;
				if (this.cmdIndex < length - 1) {
					this.cmdIndex++;
					this.inputString = this.stringList[this.cmdIndex].originString;
				} else {
					this.inputString = "";
				}
			},

			/*
			 * 字符串分析入口
			 */
			// analyse: function() {
			// 	var string = UT.trim(this.inputString);
			// 	this.string = this.preProcess(string); // 对字符串进行预处理

			// 	var result = "";

			// 	// 将string切割成多条语句，使用execute函数逐条运行
			// 	this.command();

			// 	// 1. Command  -> Sentence; | Sentence
			// 	if (this.string.split("").pop() == ";") { // 命令后跟有分号时无需输出结果
			// 		this.pushData({
			// 			resultString: "",
			// 			type: 'success'
			// 		});

			// 	} else {
			// 		this.pushData({
			// 			resultString: result,
			// 			type: 'success'
			// 		});
			// 	}
			// },

			/*
			 * 执行单句
			 */
			// execute: function(string) {
			// 	if (!UT.isValid(this.string)) { // 检查字符串是否含非法字符@#$等
			// 		this.pushData({
			// 			resultString: "语法错误 (Uncaught SyntaxError: Invalid or unexpected token)",
			// 			type: 'error'
			// 		});
			// 		return;
			// 	}

			// 	// 2. Sentence -> Variable = Expr | Variable = [] | Expr | ifSentence

			// 	// 判断目标string是否含"="号
			// 	// var index = this.string.lastIndexOf("=");
			// 	// var result = "";
			// 	// var equalReg = /()\;?$/;
			// 	// if (this.string.indexOf("="))
			// 	if (index > 0) {
			// 		var optString = UT.trim(this.string.substring(index + 1));
			// 		var validateString = UT.trim(this.string.substring(0, index));
			// 		var delReg = /^\[\]$/;
			// 		if (delReg.test(optString)) { // ###----### 删除语句
			// 			this.unValidate(validateString);
			// 			return;

			// 		} else { // ###----### 赋值
			// 			this.splitString(optString); // 剪切字符串，分析，并压入对应的栈
			// 			result = this.formatStack();
			// 			if (result) {
			// 				if (this.validate(validateString, result)) {
			// 					result = validateString + " = " + result;
			// 				} else {
			// 					this.pushData({
			// 						resultString: "语法错误 (Uncaught SyntaxError: Invalid or unexpected token)",
			// 						type: 'error'
			// 					});
			// 					return;
			// 				}
			// 			}
			// 		}

			// 	} else { // ###----### 查询或表达式运算
			// 		this.splitString(this.string); // 剪切字符串，分析，并压入对应的栈
			// 		result = this.formatStack(); // 计算栈得到的结果
			// 	}

			// 	if (result) { // 分析结果完成
			// 		this.pushData({
			// 			resultString: result,
			// 			type: 'success'
			// 		});
			// 	}
			// },

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
						key = UT.getRandString();
					} while (key in varHash);
					varHash[key] = target;
					return key;
				}.bind(this));
			},

			/*
			 * @param string 可运算的字符串
			 * 对给定字符串进行切割
			 * 切割的同时分析字符串是否合法
			 * 切割后分析，并压入对应的栈
			 * 变量或数字压入this.numStack，运算符压入this.optStack
			 * return void;
			 */
			// splitString: function(string) {
			// 	var optReg = /(^[\=\+\-\*\/\!\%\^\&\|\(\)\<\>\?\:]+)/; // 匹配运算符=+-*/!%&|()<>?:
			// 	var numReg = /(^\d+|\-\d+)(\.?)(\d*)/; // 匹配数字（包括正负、int、double） 
			// 	var varReg = /(^\w+)/; // 匹配变量名
			// 	var target = ""; // 匹配的字符串
			// 	var nextState = 'identifier'; // 下一个后续合法的字符类型 identifier | opt

			// 	while (string.length > 0) {
			// 		string = UT.trim(string); // 去除空格
			// 		// optReg.test(string[0]);
			// 		// var optSplit = string.match(optReg);
			// 		// var varSplit = string.match(optReg);

			// 		// 下一个合法字符为运算符
			// 		if (optReg.test(string) && nextState == 'opt') {
			// 			if (optReg.test(string)) { // 匹配结果为运算符
			// 				this.optStack.push(string[0]);
			// 				string = string.substring(1);
			// 			}
			// 			nextState = 'identifier';

			// 			// 下一个合法字符为数字或变量
			// 		} else if (!optReg.test(string) && nextState == 'identifier') {
			// 			target = string.match(varReg)[0];
			// 			if (UT.isVariable(target)) { // 变量
			// 				if (varHash.hasOwnProperty(target) && varHash[target]) { // 查变量的hash表
			// 					target = varHash[target];
			// 					string = string.replace(varReg, "");

			// 				} else { // 不存在该变量则报错
			// 					this.pushData({
			// 						resultString: "查询错误 (Uncaught ReferenceError: " +
			// 							target + " is not defined)",
			// 						type: 'error'
			// 					});
			// 					return;
			// 				}

			// 			} else if (UT.isNumber(target)) { // 数字
			// 				target = parseFloat(string.match(numReg)[0]);
			// 				string = string.replace(numReg, "");

			// 			} else {
			// 				this.pushData({
			// 					resultString: "语法错误 (Uncaught SyntaxError: Invalid or unexpected token)",
			// 					type: 'error'
			// 				});
			// 				return;
			// 			}

			// 			this.numStack.push(target);
			// 			nextState = 'opt';

			// 		} else {
			// 			return false;
			// 		}
			// 	}
			// },

			/*
			 * 对optStack和numStack两个栈进行计算
			 */
			// formatStack: function() {
			// 	var optStack = this.optStack;
			// 	var numStack = this.numStack;
			// 	// 循环地弹出栈并进行计算
			// 	while (optStack.length > 0) {
			// 		var temp = UT.calculate(optStack.pop(), numStack.pop(), numStack.pop());
			// 		numStack.push(temp);
			// 	}
			// 	// 当optStack为空时，numStack剩下唯一一个元素，即numStack[0]即为结果
			// 	return numStack.pop();
			// },

			/*
			 * 对等号左方的变量进行赋值操作
			 * 同时检查变量的合法性
			 * 对于 a = b = c = 3
			 * validateString为a = b = c, result为3
			 */
			// validate: function(validateString, result) {
			// 	var flag = true;
			// 	var result = validateString.split("=").map(function(value) {
			// 		if (UT.isVariable(value)) {
			// 			value = UT.trim(value);
			// 			varHash[value] = result;
			// 			return value;

			// 		} else {
			// 			flag = false;
			// 		}
			// 	}.bind(this));
			// 	if (flag) {
			// 		return result;
			// 	} else {
			// 		return null;
			// 	}
			// },

			/*
			 * 对等号左方的变量进行赋值操作
			 * 同时检查变量的合法性
			 * 对于 a = b = c = 3
			 * validateString为a = b = c, result为3
			 */
			// unValidate: function(validateString, result) {
			// 	var flag = true;
			// 	var result = validateString.split("=").map(function(value) {
			// 		if (UT.isVariable(value)) {
			// 			value = UT.trim(value);
			// 			varHash[value] = result;
			// 			return value;

			// 		} else {
			// 			flag = false;
			// 		}
			// 	}.bind(this));
			// 	if (flag) {
			// 		return result;
			// 	} else {
			// 		return null;
			// 	}
			// },
		}
	});
})();