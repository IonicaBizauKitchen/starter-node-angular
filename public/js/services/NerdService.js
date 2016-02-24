angular.module('NerdService', []).factory('Nerd', ['$http', function($http) {

        var self = this;

        self.makePayment = function(formData, amount, message){

            $http.post(API + '/payment', formData).then(function successCallback(res) {
                alert(JSON.stringify(res.data));
            }, function errorCallback(res) {
                alert(JSON.stringify(res.data));

            });
                

        };

}]);