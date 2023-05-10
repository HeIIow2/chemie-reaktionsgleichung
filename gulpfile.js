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
  return gulp.src(['src/**/*.html', 'src/**/*.css', 'src/*.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.ts', gulp.series('build'));
  gulp.watch(['src/**/*.html', 'src/**/*.css', 'src/*'], gulp.series('copy', browserSync.reload));
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    debounceDelay: 1000 // increase delay to 1000ms
  });
});

gulp.task('dev', gulp.series(['build', 'copy', gulp.parallel('watch', 'serve')]));
