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