app.controller('loginController', ['$scope', '$location', 'userFactory', '$window', function ($scope, $location, userFactory, $window) {
    $scope.userName = '';
    $scope.passWord = '';
    $scope.doLogin = function () {
        var userName = $scope.userName;
        var passWord = $scope.passWord;
        userFactory.login(userName, passWord).then(function () {
            $location.url('/');
        }, function (err) {
            $window.alert(JSON.stringify(err, null, 4));
            $scope.passWord = undefined;
        });
    }
    $scope.backToHome = function () {
        $location.url('/');
    };
}]);
