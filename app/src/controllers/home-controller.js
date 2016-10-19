app.controller('homeController', ['$scope', '$location', 'userFactory', '$window', 'noteService', function ($scope, $location, userFactory, $window, noteService) {

    $scope.currentUser = userFactory.getCurrentUser();
    noteService.load().then(function (notes) {
        $scope.notes = notes;
    });

    $scope.addNewNote = function () {
        $scope.notes.push('');
        noteService.store($scope.notes).then(function () {
            $location.url("/edit/" + ($scope.notes.length - 1));
        }, function () {
            $location.url("/edit/" + ($scope.notes.length - 1));
        });
    };
    $scope.removeNote = function (index) {
        $scope.notes.splice(index, 1);
        noteService.store($scope.notes);
    };
    $scope.editNote = function (index) {
        $location.url('/edit/' + index);
    };
    $scope.readNote = function (index) {
        $location.url('/read/' + index);
    };
    $scope.login = function () {
        $location.url('/login');
    };
    $scope.logout = function () {
        userFactory.logout();
        $scope.currentUser = null;
    };
    $scope.register = function () {
        $location.url('/register');
    };
    $scope.storeNotes = function () {
        noteService.store($scope.notes);
    };

}]);
