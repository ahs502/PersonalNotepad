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
