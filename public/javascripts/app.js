var app = angular.module("PersonalNotepad", ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html",
            controller: "homeController"
        })
        .when("/edit/:id", {
            templateUrl: "edit.html",
            controller: "editController"
        })
        .when("/read/:id", {
            templateUrl: "read.html",
            controller: "readController"
        })
        .when("/login/", {
            templateUrl: 'login.html',
            controller: 'loginController'
        })
        .when("/register/", {
            templateUrl: 'register.html',
            controller: 'registerController'
        })
        .otherwise({
            redirectTo: "/"
        });

}]);

app.service('noteClientService', ['$window', 'userFactory', function ($window, userFactory) {

    this.load = load;
    this.store = store;

    function load() {
        var currentUser = userFactory.getCurrentUser();
        if (!currentUser) throw('logged in User Not found');
        var userName = currentUser.userName;
        stringifiedNotes = $window.localStorage[userName + '_notes'];
        if (!stringifiedNotes)
            return [];
        return JSON.parse($window.localStorage[userName + '_notes']);
    }

    function store(notes) {
        var currentUser = userFactory.getCurrentUser();
        if (!currentUser) throw('logged in User Not found');
        var userName = currentUser.userName;
        $window.localStorage[userName + '_notes'] = JSON.stringify(notes);
    }
}]);
app.service('noteServerService', ['$http', '$q', 'userFactory', function ($http, $q, userFactory) {

    this.load = load;
    this.store = store;

    function load() {
        var currentUser = userFactory.getCurrentUser();
        if (!currentUser) return $q.reject('logged in User Not found');
        var userName = currentUser.userName;
        return $http.post('/note/getAll', {userName: userName}).then(function (response) {
            if (response.status != '200')
                return $q.reject(response.data);
            var data = response.data;
            if (data.status !== 'success')
                return $q.reject(new Error(data.errorMessage));
            return data.notes;
        });
    }

    function store(notes) {
        var currentUser = userFactory.getCurrentUser();
        if (!currentUser) return $q.reject('logged in User Not found');
        var userName = currentUser.userName;
        return $http.post('/note/storeAll', {userName: userName, notes: notes}).then(function (response) {
            if (response.status != '200')
                return $q.reject(response.data);
            var data = response.data;
            if (data.status !== 'success')
                return $q.reject(new Error(data.errorMessage));
        });
    }


}]);
app.service('noteService', ['noteServerService', 'noteClientService', function (noteServerService, noteClientService) {

    this.load = load;
    this.store = store;

    function load() {
        return noteServerService.load().then(function (notes) {
            noteClientService.store(notes);
            return notes;
        }, function () {
            return noteClientService.load();
        });
    }

    function store(notes) {
        return noteServerService.store(notes).then(function () {
            noteClientService.store(notes);
        }, function () {
            noteClientService.store(notes);
        });
    }
}]);
app.factory('userFactory', ['$http', '$q', '$window', function ($http, $q, $window) {

    return {
        login: login,
        logout: logout,
        register: register,
        getCurrentUser: getCurrentUser
    };

    function login(userName, passWord) {
        return $http.post('/user/login', {userName: userName, passWord: passWord})
            .then(function (response) {
                if (response.status != '200')
                    return $q.reject(response.data);
                var data = response.data;
                if (data.status !== 'success')
                    return $q.reject(data.errorMessage);
                $window.sessionStorage.userData = JSON.stringify(data.userData);
            });
    }

    function logout() {
        delete $window.sessionStorage.userData;
    }

    function register(userInfo) {
        return $http.post('/user/register', userInfo).then(function (response) {
            if (response.status != '200')
                return $q.reject(response.data);
            var data = response.data;
            if (data.status !== 'success')
                return $q.reject(new Error(data.errorMessage));
        });
    }

    function getCurrentUser() {
        var userData = $window.sessionStorage.userData;
        return userData ? JSON.parse(userData) : null;
    }

}]);

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
