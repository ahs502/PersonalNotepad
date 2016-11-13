var app = angular.module("PersonalNotepad", ['ngAnimate', 'ngSanitize', 'ui.bootstrap','ngRoute','toastr']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html",
            controller: "homeController"
        })
        .when("/edit/:id/", {
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
        .when("/upload/", {
            templateUrl: 'upload.html',
            controller: 'uploadController'
        })
        .otherwise({
            redirectTo: "/"
        });

}]);
