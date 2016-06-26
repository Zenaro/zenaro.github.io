/**
 * Created by zenaro on 16-6-16.
 */
//设置configuration
seajs.config({
    base: "../../Lib",
    alias: {
        "jquery" : "jquery/jquery.js",
        "jcanvas" : "JCanvas/jcanvas.min.js"
    }
});

seajs.use('../../public/site/js/common/main');   //引入main.js

angular.module('routingApp', ['ngRoute'])
    .controller('indexCtrl', function ($scope) {
        seajs.use('../../public/site/js/index/main');
    })
    .controller('result', function () {
        seajs.use('../../public/site/js/result/main');
    })
    .config(function ($logProvider, $routeProvider) {
        $logProvider.debugEnabled(true);
        $routeProvider
            .when('/home', {
                templateUrl: 'index.html',
                controller: 'indexCtrl'
            })
            .when('/result', {
                templateUrl: 'result.html',
                controller: 'result'
            })
            .otherwise({redirectTo: '/home'});
});
