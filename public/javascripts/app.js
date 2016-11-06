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


//app.factory('IdGen', function () {
//
//    var id = 0;
//
//    function generateId() {
//        return id++;
//    }
//
//    return {
//        generateId: generateId
//    };
//
//});
//
//app.factory('IdGen', function () {
//
//    var id = 0;
//
//    function generateId() {
//        return id++;
//    }
//
//    return {
//        generateId: generateId
//    };
//
//});

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

app.controller('TestController', ['$scope', '$window', '$timeout', function ($scope, $window, $timeout) {

    $scope.selectFilesDialog = selectFilesDialog;
    $scope.cancelUpload = cancelUpload;
    $scope.removeFile = removeFile;

    $scope.selectedFiles = [];

    var inputFile = $window.document.getElementById('input-file');
    var dropZone = $window.document.getElementById('drop-zone');

    inputFile.addEventListener('change', inputFile_OnChange, false);
    $window.document.addEventListener("dragover", document_OnDragOver, false);
    $window.document.addEventListener("dragleave", document_OnDragLeave, false);
    $window.document.addEventListener("drop", document_OnDrag, false);

    $scope.$on('$destroy', function () {
        inputFile.removeEventListener('change', inputFile_OnChange);
        $window.document.removeEventListener("dragover", document_OnDragOver);
        $window.document.removeEventListener("dragleave", document_OnDragLeave);
        $window.document.removeEventListener("drop", document_OnDrag);
    });

    function selectFilesDialog() {
        inputFile.click();
    }

    function inputFile_OnChange(e) {
        var files = toArray(inputFile.files);
        addNewFiles(files);
    }

    function processDragEvent(e) {
        dropZone.className = (e.type === 'dragover' && e.path.indexOf(dropZone) >= 0) ? 'drag-on' : '';
        e.stopPropagation();
        e.preventDefault();
    }

    function document_OnDragOver(e) {
        processDragEvent(e);
    }

    function document_OnDragLeave(e) {
        processDragEvent(e);
    }

    function document_OnDrag(e) {
        processDragEvent(e);
        if (e.path.indexOf(dropZone) >= 0) {
            var files = toArray(e.target.files || e.dataTransfer.files);
            addNewFiles(files);
        }
    }

    function addNewFiles(files) {

        // filter bad/duplicated/veryLarge files
        files = files.filter(function (file) {
            return file.size > 0 /*&& file.size <= 10 * 1024 * 1024*/ && file.type != '' &&
                $scope.selectedFiles.filter(function (existingFile) {
                    return existingFile.name === file.name &&
                        existingFile.size === file.size &&
                        existingFile.type === file.type &&
                        existingFile.lastModified === file.lastModified;
                }).length === 0;
        });

        // try to make a preview image for the file
        files.forEach(function (file) {
            if (file.type.match('image.*')) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    file.srcPreview = e.target.result;
                    $scope.$$phase || $scope.$apply();
                };
                reader.readAsDataURL(file);
            }
        });

        // start uploading the file
        files.forEach(uploadFile);

        // show all files
        $scope.selectedFiles = $scope.selectedFiles.concat(files);
        $scope.$$phase || $scope.$apply();
    }

    function uploadFile(file) {

        file.status = 'Preparing';

        var formData = new FormData();
        formData.append(file.name, file);

        var xhr = new XMLHttpRequest();
        file.xhr = xhr;
        xhr.open('post', '/upload', true);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                file.progress = Math.floor((e.loaded / e.total) * 100);
                $scope.$$phase || $scope.$apply();
            }
        };
        xhr.onerror = function (e) {
            file.status = 'Error';
            $scope.$$phase || $scope.$apply();
        };
        xhr.onabort = function (e) {
            file.status = 'Aborted';
            $scope.$$phase || $scope.$apply();
        };
        xhr.onload = function () {
            file.status = 'Done!';
            $scope.$$phase || $scope.$apply();
        };

        file.status = 'Uploading';
        file.progress = '0%';
        $scope.$$phase || $scope.$apply();

        xhr.send(formData);
    }

    function cancelUpload(file) {
        //TODO: lock this file interface
        file.xhr.abort();
    }

    function removeFile(file) {
        //TODO: lock this file interface
        cancelUpload(file);
        $timeout(function () {
            $scope.selectedFiles.splice($scope.selectedFiles.indexOf(file), 1);
        });
    }

    /////////////////////////////////////////////////////////////////////

    // convert object to array
    // e.g.: Convert FileList to Array of File
    function toArray(arrayLikeObject) {
        return Array.apply(null, {length: arrayLikeObject.length}).map(Number.call, Number)
            .map(function (i) {
                return arrayLikeObject[i];
            });
        // or:   return Array.prototype.slice.call(arrayLikeObject);
    }

}])
;
