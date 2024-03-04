let gulp = require('gulp');
let sass = require('gulp-sass')(require('sass'));
let autoprefixer = require('gulp-autoprefixer');
let ejs = require('gulp-ejs');
let rename = require('gulp-rename');
let browserSync = require('browser-sync').create();

// Sass
gulp.task('sass', function() {
  return gulp
    .src('renderer/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

// EJS
gulp.task('ejs', function() {
  return gulp
    .src(['renderer/ejs/**/*.ejs', '!' + 'renderer/ejs/**/_*.ejs'])
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest('./public/'));
});

// Javascript & Images
gulp.task('assets', function() {
  return gulp.src(['renderer/assets/**/*']).pipe(gulp.dest('./public/assets'));
});

gulp.task('browser-reload', function(done) {
  browserSync.reload();
  done();
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: 'public/',
      index: 'index.html',
    },
    port: 9998,
  });
});

gulp.task(
  'default',
  gulp.parallel(gulp.task('browser-sync'), function() {
    gulp.watch(
      'renderer/sass/**/*.scss',
      gulp.series('sass', 'browser-reload')
    );
    gulp.watch('renderer/ejs/**/*.ejs', gulp.series('ejs', 'browser-reload'));
    gulp.watch('renderer/assets/**/*', gulp.series('assets', 'browser-reload'));
  })
);
