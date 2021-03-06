/**
 * Created by zenaro on 16-6-17.
 */
define(function (require, exports, module) {
    module.exports = {
        _lrc: null,
        _mid: 0,
        render: function () {
            this.init();
            this.bind();
        },
        init: function () {
            var self = this,
                url = location.href;
            if (url.indexOf("?") !== -1) {
                var subStr1 = url.indexOf("="),
                    data_id = url.substring(subStr1 + 1, url.length);
                this._mid = data_id;
                var json = getMInfo(data_id);
                $('.main .main-title h3').html(json.name);
                $('.main .main-title span').html(json.master);
                if ($('audio')[0].src == '') {
                    $('.play-ing .ptitle a.title').html(json.name);
                    $('.play-ing .ptitle a.singer').html(json.master);
                    $('audio')[0].src = json.src;
                }

                var html = '',
                    res = json.lyric;
                if (res.length > 6) {
                    self._lrc = parseLrc(res);
                    for (var i = 0, length = self._lrc.length; i < length; i++) {
                        html += '<li>' + self._lrc[i][1] + '</li>';
                    }
                } else {
                    self._lrc = res;
                    html = '<li>' + self._lrc + '</li>';
                }
                $('.content ul').append(html);
            }
        },
        bind: function () {
            var self = this,
                lrc_i = 0;      // 第i行歌词

            $('body').on('click', '.main a.toggle', function() {

                if ($('.main .content').hasClass('txtOF')) {
                    $(this).html('收起');
                    $('.main .content').removeClass('txtOF');

                } else {
                    $(this).html('展开');
                    $('.main .content').addClass('txtOF');
                }

            });

            $('audio').on('timeupdate', function () {            // 歌词滚动
                if (self._lrc && self._lrc.length > 0) {
                    var length = self._lrc.length;
                    if (this.currentTime &&
                        self._lrc[lrc_i] &&
                        this.currentTime >= self._lrc[lrc_i][0]) {

                        $('.main .content ul li').removeClass('active').eq(lrc_i).addClass('active');
                        lrc_i++;
                        if (lrc_i > 10) {
                            var temp = (10 - lrc_i) * 25 + 'px';
                            $('.main .content ul').animate({top: temp});
                        }
                    }
                }

            }).on('seeked', function () {
                var temp = 0;

                while (this.currentTime > self._lrc[temp][0]) {
                    temp++;
                }
                lrc_i = temp - 1;
                $('.main .content li').removeClass('active').eq(lrc_i).addClass('active');
                if (lrc_i > 10) {
                    temp = (lrc_i - 10) * -25 + 'px';
                    $('.main .content ul').animate({top: temp});
                }
            }).on('durationchange', function () {
                var url = location.href,
                    subStr = url.indexOf("?"),
                    dataID = $('audio').attr('data-id');
                if (subStr !== -1 && !!dataID) {
                    window.location.href = url.substring(0, subStr + 1) + 'id=' + dataID;
                    self.init();
                }
            });
        }
    };

    // helper
    function parseLrc(text) {         // lrc字符串的处理函数
        //将文本分隔成一行一行，存入数组
        var lines = text.split('\n'),
        //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
            pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
        //保存最终结果的数组
            result = [];
        //去掉不含时间的行
        while (!pattern.test(lines[0])) {
            lines = lines.slice(1);
        }
        //上面用'\n'生成生成数组时，结果中最后一个为空元素，这里将去掉
        lines[lines.length - 1].length === 0 && lines.pop();
        lines.forEach(function (v /*数组元素值*/, i /*元素索引*/, a /*数组本身*/) {
            //提取出时间[xx:xx.xx]
            var time = v.match(pattern),
            //提取歌词
                value = v.replace(pattern, '');
            //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
            time.forEach(function (v1, i1, a1) {
                //去掉时间里的中括号得到xx:xx.xx
                var t = v1.slice(1, -1).split(':');
                //将结果压入最终数组
                result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
            });
        });
        //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
        result.sort(function (a, b) {
            return a[0] - b[0];
        });
        return result;
    }

    function getMInfo (data_id) {
        var json = require('../../../common/js/list');
        for (key in json) {
            if (json[key].id == data_id) {
                return json[key];
            }
        }
    }
});