const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

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
  return gulp.src(['src/**/*.html', 'src/**/*.css', 'src/*'])
    .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series(['build', 'copy']));
