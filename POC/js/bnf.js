(function(window) {
	function BNF(string) {
		this.string = string; // 原生的string
		this.clearString = string; // 对原生string清除过括号中字符后产生的string
		this.varHash = {}
	}

	BNF.prototype = {
		// ###----------public 公开方法----------###
		/*
		 * 类分析入口方法
		 */
		init: function(string) {
			if (typeof string !== 'string') {
				throw new Error("参数错误：init()的参数必须为string类型");
			}
			var string = UT.trim(string);
			if (!string) {
				return "";
			}
			string = this.preProcess(string);
			return this.command(string);
		},
		// ###---------- END----------###

		//  #####--------private-------#### 
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
				} while (key in this.varHash);
				this.varHash[key] = target;
				return key;

			}.bind(this));
		},
		/*
		 * Command  ->  Sentence;  |  Sentence 
		 */
		command: function(string) {
			var string = UT.trim(string);
			var length = string.length;
			if (string[length - 1] == ";") { // Sentence; 不输出结果
				this.sentence(string.substring(0, length - 1));
				return null;

			} else { // Sentence
				return this.sentence(string);
			}
		},

		/*
		 * Sentence  ->  Variable = Expr  |  Variable = []  
		 *							|  Expr  |  IfSentence 
		 */
		sentence: function(string) {
			var string = UT.trim(string); // ####

			// 处理if else 语句
			var ifElseReg = /^if\s*\((.*)\)\s*(.*)else\s*(.*)\s*end\s*/;
			var array = [];
			if (array = string.match(ifElseReg)) {
				// ifSenternce  ==>   if  (boolExpr)   Sentence  else  Sentence  end 
				var $1 = array[1];
				var $2 = array[2];
				var $3 = array[3];
				if (this.boolExpr($1)) {
					return this.sentence($2);
				} else {
					return this.sentence($3);
				}
			}

			// 优先处理括号内运算符和","所引起的问题
			// 匹配 sin() | cos() | max() | min() | ()  ##不匹配if ()
			var parenReg = /([^\w]*)(sin|cos|max|min)*\s*\(([^()]*)\)/;
			while (parenReg.test(string)) {
				string = string.replace(parenReg, function(target, $1, $2, $3) {
					if ($2 == 'sin') {
						return $1 + Math.sin(this.arithExpr($3));
					}
					if ($2 == 'cos') {
						return $1 + Math.cos(this.arithExpr($3));
					}

					// 分割","
					var arithExprList = $3.split(",").map(function(value) {
						return this.arithExpr(value);
					}.bind(this));
					switch ($2) {
						case 'max':
							return $1 + UT.max(arithExprList);
						case 'min':
							return $1 + UT.min(arithExprList);
						default:
							return $1 + this.arithExpr($3);
					}
				}.bind(this));
				console.log(string);
			}
			// 处理二元运算符的配对问题
			var binReg = /([^\?\:]*)\?([^\?\:]*)\:(.*)/;
			while (binReg.test(string)) {
				string = string.replace(binReg, function(target, $1, $2, $3) {
					if (this.boolExpr($1)) {
						return this.sentence($2);

					} else {
						return this.sentence($3);
					}

				}.bind(this));
				console.log(string);
			}

			var indexEqual = string.indexOf("=");
			if (indexEqual > 0) { // 包含"="号
				var leftString = UT.trim(string.substring(0, indexEqual));
				var rightString = UT.trim(string.substring(indexEqual + 1));

				if (!UT.isVariable(leftString)) {
					throw new Error("Uncaught SyntaxError: Invalid or unexpected token");
				}

				if (UT.isDel(rightString)) { // 删除语句  ==>  Variable = [] 
					this.varHash[leftString] = null;

					// 待定
					// return null;
					return "Prompt: variable '" + leftString + "' is deleted";

				} else { // 赋值语句  ==>  Variable = Expr
					var rightResult = this.expr(rightString);
					this.varHash[leftString] = rightResult;

					// 待定
					// return rightResult;
					return leftString + " = " + rightResult;
				}

			} else { // 纯运算  =>  Expr 
				return "ans = " + this.expr(string);
			}
		},

		/*
		 *  expr -> ArithExpr
		 */
		expr: function(string) {

			// 括号问题处理完成，进入arithExpr
			return this.arithExpr(string);
		},

		/*
		 * ArithExpr -> Number  |  Variable |  (  ArithExpr  )   
		 *					|  ArithExpr  +  ArithExpr  |  ArithExpr  –  ArithExpr  
		 *					|  ArithExpr  *  ArithExpr  |  ArithExpr  –  ArithExpr  
		 *					|  ArithExpr  ^  ArithExpr  |  ArithExpr  /  ArithExpr  
		 *					|  – ArithExpr 
		 *					|  BoolExpr  ?  ArithExpr  :  ArithExpr
		 *					|  SingleFunc  |  MultipleFunc 
		 */
		arithExpr: function(string) {
			string = UT.trim(string);
			if (UT.isNumber(string)) { // Number
				return parseFloat(string);

			} else if (UT.isBool(string)) { // Boolean
				return string == "true";

			} else if (UT.isVariable(string)) { // Variable
				// 查询存储变量的哈希表，若不存在则报错
				if (this.varHash.hasOwnProperty(string) && this.varHash[string] != null) {
					return this.varHash[string];

				} else { // 错误:未知变量
					throw new Error("Uncaught ReferenceError: " + string + " is not defined");
				}
			}
			var addSubReg = /(.*\w+)\s*([\+\-])(.+)/; // 匹配加减法，减号前面不能跟+-*/，否则就是取负操作
			var mulDivReg = /(.*\w+)\s*([\*\/\%])(.+)/; // 匹配乘除法
			var powReg = /([^/^]*\w+)\s*([\^])(.+)/; // 匹配^，n次方
			var $1 = ""; // 左方字符串
			var $2 = ""; // 运算符
			var $3 = ""; // 右方字符串
			var array = "";
			if (array = string.match(addSubReg)) { // 加减法
				$1 = array[1];
				$2 = array[2];
				$3 = array[3];
				/* javascript 语言的浮点运算存在精度问题，
				 * 如 2.5 - 2.4 其结果为 0.10000000000000009
				 * 为解决该问题，在UT工具类中自定义封装了add方法
				 */
				return UT.calculate(this.arithExpr($1), this.arithExpr($3), $2);

			} else if (array = string.match(mulDivReg)) { // 乘除法
				$1 = array[1];
				$2 = array[2];
				$3 = array[3];
				return UT.calculate(this.arithExpr($1), this.arithExpr($3), $2);

			} else if (array = string.match(powReg)) { // n次方
				$1 = array[1];
				$3 = array[3];
				return Math.pow(this.arithExpr($1), this.arithExpr($3));

			} else {
				throw new Error("Uncaught SyntaxError: Invalid or unexpected token");
			}
		},

		/*
		 *BoolExpr  ->  true  |  false  |  (  BoolExpr  ) 
		 *					|  ArithExpr  ==  ArithExpr  |  ArithExpr  !=  ArithExpr 
		 *					|  ArithExpr  <  ArithExpr  |  ArithExpr  >  ArithExpr 
		 *					|  ArithExpr  <=  ArithExpr  |  ArithExpr  >=  ArithExpr 
		 *					|  BoolExpr  &&  BoolExpr  |  BoolExpr  ||  BoolExpr 
		 *					|  !  BoolExpr 
		 */
		boolExpr: function(string) {
			string = UT.trim(string);
			var symReg = /(.*)(==|!=|<=|>=|>|<|&&|\|\||!)(.+)/; // 匹配运算符
			if (UT.isBool(string)) {
				return string == 'true';
			}
			var array = string.match(symReg);
			if (!array) {
				throw new Error("Uncaught SyntaxError: Invalid or unexpected token");
			}
			var $1 = array[1];
			var $2 = array[2];
			var $3 = array[3];
			switch ($2) {
				case '==':
					return this.arithExpr($1) == this.arithExpr($3);
				case '!=':
					return this.arithExpr($1) != this.arithExpr($3);
				case '<=':
					return this.arithExpr($1) <= this.arithExpr($3);
				case '>=':
					return this.arithExpr($1) >= this.arithExpr($3);
				case '<':
					return this.arithExpr($1) < this.arithExpr($3);
				case '>':
					return this.arithExpr($1) > this.arithExpr($3);
				case '&&':
					return this.arithExpr($1) && this.arithExpr($3);
				case '||':
					return this.arithExpr($1) || this.arithExpr($3);
				case '!':
					return !this.arithExpr($3);
				default:
					throw new Error("Uncaught SyntaxError: Invalid or unexpected token")
			}
		},
		// ###---------- END----------###

	};

	// 将BNF注册进全局对象window中
	window.BNF = BNF;

})(window);