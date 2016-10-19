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