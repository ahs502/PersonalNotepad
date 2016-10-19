app.controller('registerController', ['$scope', '$location', 'userFactory', '$window', function ($scope, $location, userFactory, $window) {
    $scope.backToHome = function () {
        $location.url('/');
    };
    $scope.doRegister = function () {
        var fullName = $scope.fullName;
        var userName = $scope.userName;
        var passWord = $scope.passWord;
        var userData = {
            userName: userName,
            passWord: passWord,
            fullName: fullName
        };
        userFactory.register(userData).then(function () {
            $window.alert('Registration Done!');
            $location.url('/login');
        }, function (err) {
            $window.alert(JSON.stringify(err, null, 4));
            $scope.passWord = undefined;
            $scope.rePassWord = undefined;
        });
    }
}]);
