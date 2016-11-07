var gulp = require('gulp');
var tsc = require('gulp-typescript');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');
var tslint = require('gulp-tslint');

gulp.task('clean', function() {
	return del('dist/*');
})

var codeFiles = 'src/**/*.ts';
var sourceFiles = ['typings/index.d.ts', codeFiles];

gulp.task('tslint', function() {
	return gulp.src(codeFiles).pipe(tslint({
			formatter: "verbose"
		}))
		.pipe(tslint.report());
});

gulp.task('assemble', ['clean', 'tslint'], function() {
	return gulp.src(sourceFiles)
		.pipe(sourcemaps.init())
		.pipe(tsc('tsconfig.json'))
		.pipe(sourcemaps.write('./', {
			includeContent: false
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['assemble'], function() {
	return gulp.watch(sourceFiles, ['assemble'])
});

gulp.task('test', ['assemble'], function() {
	return gulp.src('dist/**/*.js', {
			read: false
		})
		.pipe(mocha());
});
