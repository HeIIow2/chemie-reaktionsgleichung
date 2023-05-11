const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
  const tsResult = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
  return gulp.src(['src/**/*.html', 'src/**/*.css', 'src/*.html', 'src/**/*.woff2', 'src/**/*.woff', 'src/**/**/*.png', 'src/**/*.js'])
    .pipe(gulp.dest('dist'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    debounceDelay: 1000 // increase delay to 1000ms
  });
});

gulp.task('default', gulp.series('build', 'copy', 'serve'));
