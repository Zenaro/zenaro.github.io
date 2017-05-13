(function(window) {
	function BNF(string) {
		this.string = string; // 原生的string
		this.clearString = string; // 对原生string清除过括号中字符后产生的string
		this.varHash = {
			a: 123
		}
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
			return this.command(string);
		},
		// ###---------- END----------###

		//  #####--------private-------#### 
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
			var indexEqual = string.indexOf("=");

			// ifSentence
			var indexIf = string.indexOf("if");
			var indexLParen = string.indexOf("(");
			var indexRParen = string.indexOf(")");
			var indexElse = string.lastIndexOf("else");
			var indexEnd = string.lastIndexOf("end");

			if (indexIf == 0 &&
				indexLParen > indexIf &&
				indexRParen > indexLParen &&
				indexElse > indexRParen &&
				indexEnd > indexElse) {
				// ifSenternce  ==>   if  (Expr)   Sentence  else  Sentence  end 

				var exprString = UT.trim(string.substring(indexLParen + 1, indexRParen));
				var xSentence = UT.trim(string.substring(indexRParen + 1, indexElse));
				var ySentence = UT.trim(string.substring(indexElse + 1, indexEnd));
				if (this.expr(exprString)) {
					return this.sentence(xSentence);

				} else {
					return this.sentence(ySentence);
				}

			} else if (indexEqual > 0) { // 包含"="号
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
			// 优先处理括号内运算符和","所引起的问题
			// 匹配 sin() | cos() | max() | min() | ()
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
			var binReg = /([^\?\:]*)\?([^\?\:]*)\:([^\?\:]*)/;
			while (binReg.test(string)) {
				string = string.replace(binReg, function(target, $1, $2, $3) {
					if (this.boolExpr($1)) {
						return this.arithExpr($2);

					} else {
						return this.arithExpr($3);
					}

				}.bind(this));
				console.log(string);
			}

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
			var indexPow = string.indexOf("^"); // 右结合
			var indexBin = string.indexOf("?"); // 右结合，故为indexOf
			var indexCol = string.lastIndexOf(":");

			var indexAdd = string.lastIndexOf("+"); // 左结合，故为lastIndexOf
			var indexSub = string.lastIndexOf("-");
			var indexMul = string.lastIndexOf("*");
			var indexDiv = string.lastIndexOf("/");
			if (UT.isNumber(string)) { // Number
				return parseFloat(string);

			} else if (UT.isBool(string)) { // Boolean
				return string == "true";

			} else if (UT.isVariable(string)) { // Variable
				// 查询存储变量的哈希表，若不存在则报错
				if (this.varHash.hasOwnProperty(string) && this.varHash[string]) {
					return this.varHash[string];

				} else {
					// 错误:未知变量
					throw new Error("Uncaught ReferenceError: " + string + " is not defined");
				}

			} else if (indexBin > 0 && indexCol > indexBin) { // ? : ==> 二元运算符
				// 递归是反向的，故按照运算符优先级从低到高排列
				var boolString = UT.trim(string.substring(0, indexBin));
				var leftString = UT.trim(string.substring(indexBin + 1, indexCol));
				var rightString = UT.trim(string.substring(indexCol + 1));
				var boolResult = this.boolExpr(boolString);
				var leftResult = this.arithExpr(leftResult);
				var rightResult = this.arithExpr(rightResult);
				return boolResult ? leftResult : rightResult;

			} else if (indexAdd > 0) { // 加法 ==> ArithExpr + ArithExpr
				var leftString = UT.trim(string.substring(0, indexAdd));
				var rightString = UT.trim(string.substring(indexAdd + 1));
				var leftResult = this.arithExpr(leftString);
				var rightResult = this.arithExpr(rightString);
				return leftResult + rightResult;

			} else if (indexSub > 0) { // - 减法 ==> ArithExpr - ArithExpr
				var leftString = UT.trim(string.substring(0, indexSub));
				var rightString = UT.trim(string.substring(indexSub + 1));
				var leftResult = this.arithExpr(leftString);
				var rightResult = this.arithExpr(rightString);
				return leftResult - rightResult;

			} else if (indexMul > 0) { // 乘法 ==> ArithExpr * ArithExpr
				var leftString = UT.trim(string.substring(0, indexMul));
				var rightString = UT.trim(string.substring(indexMul + 1));
				var leftResult = this.arithExpr(leftString);
				var rightResult = this.arithExpr(rightString);
				return leftResult * rightResult;

			} else if (indexDiv > 0) { // 除法 ==> ArithExpr / ArithExpr
				var leftString = UT.trim(string.substring(0, indexDiv));
				var rightString = UT.trim(string.substring(indexDiv + 1));
				var leftResult = this.arithExpr(leftString);
				var rightResult = this.arithExpr(rightString);
				return leftResult / rightResult;

			} else if (indexPow > 0) { // n次方 ==> ArithExpr ^ ArithExpr
				var leftString = UT.trim(string.substring(0, indexPow));
				var rightString = UT.trim(string.substring(indexPow + 1));
				var leftResult = this.arithExpr(leftString);
				var rightResult = this.arithExpr(rightString);
				return Math.pow(leftString, rightString);

			} else if (indexSub == 0) { // 取负 ==> -ArithExpr
				var rightString = UT.trim(string.substring(1));
				rightResult = this.arithExpr(rightString);
				return -rightResult;

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
			var symReg = /(.*)(==|!=|<=|>=|>|<|&&|\|\||!)(.+)/;
			if (UT.isBool(string)) {
				return string == 'true';
			}
			string.replace(symReg, function(target, $1, $2, $3) {
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
			});
		},
		// ###---------- END----------###

	};

	// 将BNF注册进全局对象window中
	window.BNF = BNF;

})(window);