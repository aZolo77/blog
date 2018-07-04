// основной файл для Gulp
/* eslint-disable node/no-unpublished-require*/
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const nano = require('gulp-cssnano');
const concat = require('gulp-concat');
// const uglify = require('gulp-uglifyjs');
/* eslint-enable node/no-unpublished-require*/

// задача для компиляции, добавления префиксов и сжатия стилей
gulp.task('scss', () => {
  return gulp
    .src('dev/scss/**/*.scss')
    .pipe(sass()) // компилирует в css
    .pipe(
      // проставляет необходимые префиксы
      autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true
      })
    )
    .pipe(nano()) // сжимает
    .pipe(gulp.dest('public/stylesheets')); // кладёт в необходимую папку
});

// для компиляции javascript
gulp.task('scripts', () => {
  return (
    gulp
      .src(['dev/js/auth.js', 'dev/js/post.js', 'dev/js/comment.js'])
      .pipe(concat('scripts.js')) // берёт все скрипты и конкатеринует в один
      // .pipe(uglify()) // сжимаем скрипты
      .pipe(gulp.dest('public/javascripts'))
  ); // помещаем в необходимую папку
});

// основная задача (последовательность)
gulp.task('default', ['scss', 'scripts'], () => {
  gulp.watch('dev/scss/**/*.scss', ['scss']);
  gulp.watch('dev/js/**/*.js', ['scripts']);
});
