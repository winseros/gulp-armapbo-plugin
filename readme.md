# Gulp Arma Pbo plugin

The plugin's goal is to create Arma2/Arma3 pbo files from sources using [Gulp](http://gulpjs.com).

## The general usage

1. Install the plugin
```
npm install gulp-armapbo-plugin
```

2. Add the plugin to the gulpfile
```
var gulp = require('gulp');
var pbo = require('gulp-armapbo');

gulp.task('pack', function(){
    return gulp.src('pbo-contents/**/*')
        .pipe(new pbo('my-file.pbo', {
            headerExtensions: [{
                name: 'author',
                value: 'Author Name'
            }, {
                name: 'mission',
                value: 'Mission Name'
            }]
        }))
        .pipe(gulp.dest('pbo-packed/'));
});
```

## Plugin API
pbo(filename, [options])

### filename
Type: `string` - name of the pbo file to create, e.g. _someFileName.pbo_

Required: `yes`

### options

#### headerExtensions
Type: `array of {name:<string>, value:<string>} objects`, e.g. _{name: 'author', value: 'Author Name' }_

Required: `no`