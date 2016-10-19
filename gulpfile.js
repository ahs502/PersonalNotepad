var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

var fs = require("fs");


gulp.task('clean-js', function () {
    return gulp.src('./public/javascripts/**/*', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('concat-js', ['clean-js'], function (/*done*/) {
    return gulp.src([
        './app/src/main.js',
        './app/src/services/**/*.js',
        './app/src/controllers/**/*.js'
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./public/javascripts'));
    //.on('end',function(){
    //    done();
    //});
});

gulp.task('watch', function (done) {

    gulp.watch('./app/src/**/*.js', ['concat-js']);

    done();
});

gulp.task('default', ['concat-js', 'watch']);




