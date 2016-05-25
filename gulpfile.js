var gulp = require('gulp');
var tsc = require('gulp-typescript');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', function () {
    return del('dist/*');
})

var sourceFiles = ['typings/index.d.ts', 'src/**/*.ts'];

gulp.task('assemble', ['clean'], function () {
    return gulp.src(sourceFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc('tsconfig.json'))
        .pipe(sourcemaps.write('./', { includeContent: false }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['assemble'], function () {
    return gulp.watch(sourceFiles, ['assemble'])
});