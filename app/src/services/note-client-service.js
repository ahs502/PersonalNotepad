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