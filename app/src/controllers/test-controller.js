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
