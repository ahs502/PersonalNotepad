app.controller('editController', ['$scope', '$location', '$routeParams', '$window', 'noteClientService', 'noteService', function ($scope, $location, $routeParams, $window, noteClientService, noteService) {

    var noteIndex = $routeParams.id;
    var notes = noteClientService.load();
    $scope.textNote = notes[noteIndex];
    $scope.backToHome = function () {
        if ($routeParams.origin == 'read') {
            $location.url('/read/' + noteIndex);
        } else {
            $location.url('/');
        }
    };
    $scope.save = function () {
        notes[noteIndex] = $scope.textNote;
        noteService.store(notes).then(function () {
            $scope.backToHome();
        }, function () {
            $scope.backToHome();
        });
    };
    $scope.delete = function () {
        notes.splice(noteIndex, 1);
        noteService.store(notes).then(function () {
            $location.url('/');
        }, function () {
            $location.url('/');
        });
    };

}]);
