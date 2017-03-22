[![node][node-image]][node-url] [![npm][npm-image]][npm-url] [![Travis branch][travis-image]][travis-url] [![Coveralls branch][coveralls-image]][coveralls-url] [![Dependencies][david-image]][david-url]

# Gulp Arma Pbo plugin

The plugin's goal is to create Arma2/Arma3 pbo files from sources using [Gulp](http://gulpjs.com).

## Installation
```
npm install gulp-armapbo
```

## Usage
```
const gulp = require('gulp');
const pbo = require('gulp-armapbo');

gulp.task('pack', () => {
    return gulp.src('pbo-contents/**/*')
        .pipe(pbo({
            fileName: 'my-file.pbo',
            extensions: [{
                name: 'author',
                value: 'Author Name'
            }, {
                name: 'mission',
                value: 'Mission Name'
            }],
            compress: [
                '**/*.sqf',
                'mission.sqm',
                'description.ext'
            ]
        }))
        .pipe(gulp.dest('pbo-packed/'));
});
```

## Plugin API
pbo([options])

### Options
Required: `no`

#### options.fileName

Name of the pbo file to create, e.g. `someFileName.pbo`; if no value specified, the name of the `$cwd` is used

Type: `string`

Default: `process.cwd()`

Required: `no`

#### options.extensions

Adds pbo file header extension fields. You are free to place any arbitrary information here.

Type: array of `{name:<string>, value:<string>}` objects, e.g. `{name: 'author', value: 'Author Name' }`

Default: `undefined`

Required: `no`

#### options.compress

Files to apply data compression to

Type: `string` (glob pattern) or array of `strings` (glob patterns), e.g. `compress: 'mission.sqm'` or `compress: '**/*.sqf'` or `compress: ['**/*.sqf', '**/*.hpp', 'mission.sqm']`

Default: `undefined`

Required: `no`

#### options.verbose

Print compression information to console

Type: `bool`

Default: `true`

Required: `no`

#### options.progress

Print the current file compression progress to console

Type: `bool`

Default: `true`

Required: `no`


[node-url]: https://nodejs.org
[node-image]: https://img.shields.io/node/v/gulp-armapbo.svg

[npm-url]: https://www.npmjs.com/package/gulp-armapbo
[npm-image]: https://img.shields.io/npm/v/gulp-armapbo.svg

[travis-url]: https://travis-ci.org/winseros/gulp-armapbo-plugin
[travis-image]: https://img.shields.io/travis/winseros/gulp-armapbo-plugin/master.svg

[coveralls-url]: https://coveralls.io/github/winseros/gulp-armapbo-plugin
[coveralls-image]: https://img.shields.io/coveralls/winseros/gulp-armapbo-plugin/master.svg

[david-url]: https://david-dm.org/winseros/gulp-armapbo-plugin
[david-image]: https://david-dm.org/winseros/gulp-armapbo-plugin/master.svg