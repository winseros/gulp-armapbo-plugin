import gulp from 'gulp';
import tsc from 'gulp-typescript';
import tslint from 'gulp-tslint';
import sourcemaps from 'gulp-sourcemaps';
import mocha from 'gulp-mocha';
import cached from 'gulp-cached';
import istanbul from 'gulp-istanbul'
import coveralls from 'gulp-coveralls';
import remapIstanbul from 'remap-istanbul/lib/gulpRemapIstanbul';
import del from 'del';
import path from 'path';

const dist = './dist';
const sourceFiles = './src/**/*.ts';
const typingFiles = './typings/**/index.d.ts';
const testSpecs = './dist/**/*.spec.js';
const testSources = ['./dist/**/*.js', `!${testSpecs}`];
const coverageDir = './.coverage'
const lcovFile = path.join(coverageDir, 'lcov.info');

gulp.task('clean', () => {
    return del([`${dist}/*`]);
});

gulp.task('tslint', () => {
    return gulp.src(sourceFiles)
        .pipe(cached('tslint'))
        .pipe(tslint({
            formatter: "verbose"
        })).pipe(tslint.report({
            emitError: false
        }));
});

gulp.task('assemble', ['clean', 'tslint'], () => {
    const tsproject = tsc.createProject('tsconfig.json');

    return gulp.src([typingFiles, sourceFiles])
        .pipe(sourcemaps.init())
        .pipe(tsproject()).js
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot: '../src'
        }))
        .pipe(gulp.dest(dist));
});

gulp.task('test:run', ['assemble'], () => {
    return gulp.src(testSpecs)
        .pipe(mocha());
});

gulp.task('cover:instrument', ['assemble'], () => {
    return gulp.src(testSources)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('cover:run', ['cover:instrument'], () => {
    return gulp.src(testSpecs)
        .pipe(mocha())
        .pipe(istanbul.writeReports({
            dir: coverageDir,
            reporters: ['json']
        }));
});

gulp.task('cover:report', ['cover:run'], () => {
    return gulp.src(path.join(coverageDir, 'coverage-final.json'))
        .pipe(remapIstanbul({
            reports: { html: coverageDir, lcovonly: lcovFile }
        }));
});

gulp.task('cover:coveralls', ['cover:report'], () => {
    return gulp.src(lcovFile)
        .pipe(coveralls());
});

gulp.task('watch', ['assemble'], () => {
    return gulp.watch(sourceFiles, ['assemble']);
});