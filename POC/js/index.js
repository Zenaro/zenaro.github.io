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
			 * 当完成字符串的运算后，
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
				var originString = this.inputString;
				var resultString = "";
				try {
					resultString = this.bnf.init(originString);
					prevList.push({
						originString: originString,
						resultString: resultString,
						type: 'success'
					});

				} catch (error) {
					resultString = error.message;
					prevList.push({
						originString: originString,
						resultString: resultString,
						type: 'error'
					});
				}
				// 指令数++
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
			 * 进至下一条命令
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
		}
	});

})();