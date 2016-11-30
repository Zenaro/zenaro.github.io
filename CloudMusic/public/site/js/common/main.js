/**
 * Created by zenaro on 16-6-16.
 */
define(function(require) {
    var $ = require('jquery');

    var Dialog = require('./dialog');
    var d = new Dialog();
    d.render();

    var Player = require('../../../common/js/player');
    Player.render();

    var MList = require('../../../common/js/mlist');
    MList.render();

});