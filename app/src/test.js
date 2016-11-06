var app = angular.module("PersonalNotepad", ['ngRoute']);

app.config(['$routeProvider', 'IdGenProvider', function ($routeProvider, IdGenProvider) {
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

    IdGenProvider.setInitialId(12345);

}]);

app.run(['IdGen', function (IdGen) {

    console.log(IdGen.generateId());

}]);

////////////////////////////////////////////////////////////

app.value('IdGenValue', (function () {

    var id = 0;

    function generateId() {
        return id++;
    }

    return {
        generateId: generateId
    };

})());

////////////////////////////////////////////////////////////

app.factory('IdGenFactory', function () {

    var id = 0;

    function generateId() {
        return id++;
    }

    return {
        generateId: generateId
    };

});

////////////////////////////////////////////////////////////

app.service('IdGenService', function () {

    var id = 0;

    function generateId() {
        return id++;
    }

    this.generateId = generateId;

});

////////////////////////////////////////////////////////////

app.provider('IdGen', function () {

    var id = 0;

    function setInitialId(id0) {
        id = id0;
    }

    this.setInitialId = setInitialId;

    // main IdGen body
    this.$get = function () {

        function generateId() {
            return id++;
        }

        return {
            generateId: generateId
        };

    };

});
