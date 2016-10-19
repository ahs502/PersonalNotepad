app.controller('readController', ['$scope', '$window', '$location', '$routeParams', 'noteClientService', function ($scope, $window, $location, $routeParams, noteClientService) {

    var noteIndex = $routeParams.id;
    var notes = noteClientService.load();
    $scope.textNote = notes[noteIndex];

    $scope.backToHome = function () {
        $location.url('/');
    };
    $scope.goToEdit = function () {
        $location.url("/edit/" + noteIndex + '?origin=read');
    }

}]);
