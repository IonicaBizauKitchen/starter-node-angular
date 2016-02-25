angular.module('MainCtrl', []).controller('MainController', function($scope, $http) {

	$scope.tagline = 'To the moon and back!';
    $scope.people = [];
    $scope.checked = false;
    $scope.processForm = function() {
        $scope.people = [];
        $scope.checked = false;
//        $http.get('http://localhost:8080/query1', {params: {user: $scope.user, start: $scope.start, end: $scope.end, distance: $scope.distance}}).then(function successCallback(res) {
//            alert(JSON.stringify(res.data));
//        }, function errorCallback(res) {
//            alert(JSON.stringify(res.data));
//
//        });


        $http.get('http://localhost:8080/query1', {params: {user: "_User$peyi3uzZdZ", start: "2015-08-07T20:10:47.301Z", end: "2015-08-07T20:50:47.301Z", distance: 10}}).then(function successCallback(res) {
            console.log(JSON.stringify(res.data));
            console.log(res.data);
            $scope.checked = true;
            $scope.people = res.data;
        }, function errorCallback(res) {
            alert(JSON.stringify(res.data));

        });
    };

});