var socket = io.connect();
socket.on('news', function (data) {
    socket.emit('my other event', { my: 'data' });
});

angular.module('MainCtrl', []).controller('MainController', function($scope, $http) {

    $scope.tagline = 'To the moon and back!';
    var total = [];
    $scope.pages = [];
    $scope.people = [];
    $scope.checked = false;
    $scope.checked2 = false;


    function errHandler(res) {
        alert(res.statusText || "There was an error.");
    }

    function genpages(count){
        for (var i = 0; i < count/20; i ++){

            $scope.pages.push(i+1);
        }

    }

    $scope.paginate = function(index){
        var begin = (index-1)*20;
        var end = begin + 20;
        if (end > total.length){
            end = total.length;
        }
        $scope.people = total.slice(begin, end);
    };

    $scope.processForm = function(index) {
        console.log("INDEX:" + index);
        $scope.people = [];
        $scope.pages = [];
        total = [];
        $scope.checked = false;
        $scope.checked2 = false;

        socket.emit("queryOne", {
            user: "_User$"+$scope.user,
            start: $scope.start,
            end: $scope.end,
            distance: $scope.distance
        }, function successCallback(err, res) {
            if (err) {
                return errHandler(err);
            }

            $scope.$apply(function () {
                genpages(res.length);
                $scope.checked = true;
                total = res;
                $scope.people = total.slice(0, 20);
            });
        });


        //        $http.get('http://localhost:8080/query1', {params: {user: "_User$peyi3uzZdZ", start: "2015-08-07T20:10:47.301Z", end: "2015-08-07T20:50:47.301Z", distance: 10}}).then(function successCallback(res) {
        //
        //            genpages(res.data.length);
        //            console.log("total");
        //            console.log( res.data);
        //            $scope.checked = true;
        //            total = res.data;
        //            $scope.people = total.slice(0, 20);
        //            console.log("people");
        //            console.log($scope.people);
        //        }, function errorCallback(res) {
        //            alert(JSON.stringify(res.data));
        //
        //        });
    };

    $scope.processForm2 = function() {
        $scope.people = [];
        total = [];
        $scope.pages = [];
        $scope.checked = false;
        $scope.checked2 = false;


        socket.emit("queryTwo", {
            start: $scope.start2,
            end: $scope.end2,
            distance: $scope.distance2
        }, function successCallback(err, res) {
            if (err) {
                return errHandler(err);
            }
            $scope.$apply(function () {
                genpages(res.length);
                $scope.checked2 = true;
                total = res;
                $scope.people = total.slice(0, 20);
            });
        });


        //        $http.get('http://localhost:8080/query2', {params: {start: "2015-08-07T20:10:47.301Z", end: "2015-08-07T20:50:47.301Z", distance: 10}}).then(function successCallback(res) {
        //            genpages(res.data.length);
        //            console.log("total");
        //            console.log( res.data);
        //            $scope.checked2 = true;
        //            total = res.data;
        //            $scope.people = total.slice(0, 20);
        //            console.log("people");
        //            console.log($scope.people);
        //        }, function errorCallback(res) {
        //            alert(JSON.stringify(res.data));
        //
        //        });
    };

});
