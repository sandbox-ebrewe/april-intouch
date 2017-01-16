import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';

const reload = browserSync.reload;
const $ = gulpLoadPlugins();

// ENVIRONMENTS
//---------------------------------------|
const development = $.environments.development;
const production = $.environments.production;

// AUTOPREFIXER OPTIONS
// --------------------------------------|
let optsAutoprefixer = {
    browsers: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'Explorer >= 9',
        'Safari >= 6',
        'ExplorerMobile >= 10'
    ]
};

// POSTCSS OPTIONS
// --------------------------------------|
let optsPostCSS = [
    require('autoprefixer')(optsAutoprefixer),
    require('css-mqpacker')
];

gulp.task('styles', ()=>{
  gulp.src('src/styles/compiled/**/*.css')
  .pipe($.concat('unionGas.css'))
  .pipe(gulp.dest('.tmp/styles'));

  return gulp.src('src/styles/**/*.scss')
  .pipe($.sassBulkImport())
  .pipe($.sass())
  .pipe($.postcss(optsPostCSS))
  .pipe($.concat('main.min.css'))
  .pipe(development(gulp.dest('.tmp/styles')))
  .pipe(production(gulp.dest('dist/styles')))
  .pipe(reload({stream:true}))
});

// "JADE" OPTIONS
// --------------------------------------|
let devLocals = require('./src/views/_locals.json');
let optsPugDev = {
    pretty: true,
    basedir: 'src/views',
    locals: devLocals,
    env: 'dev'
};
let optsPugProd = {
    pretty: true,
    basedir: 'src/views',
    locals: devLocals,
    env: 'prod'
};

// HTML PRETTIFY OPTIONS
// --------------------------------------|
let optsPretty = {
    indent_with_tabs: true,
    indent_inner_html: false,
    preserve_newlines: true,
    indent_scripts: 'normal',
    unformatted: ['sub', 'sup', 'b', 'em', 'u', 'script']
};

// VIEWS
// --------------------------------------|
gulp.task('views', () => {
    return gulp.src('src/views/**/*.pug')
        .pipe($.changed('.tmp', {extension: '.html'}))
        //.pipe($.pugInheritance({basedir: 'src/views'}))
        .pipe($.filter(["**/*", "!src/views/**/_*.pug"]))
        .pipe(development($.pug(optsPugDev)))
        .pipe(production($.pug(optsPugProd)))
        .pipe($.prettify(optsPretty))
        .pipe(development(gulp.dest('.tmp')))
        .pipe(production(gulp.dest('.dist')))
        .pipe(reload({stream: true}))
});
gulp.task('views:watch', () => {
   global.isWatching = true;
});

// DEVELOPMENT SERVE
 // --------------------------------------|
 gulp.task('serve', ['styles', 'views:watch', 'views'], () => {
     browserSync({
         notify: false,
         port: 9000,
         server: {
             baseDir: ['.tmp', 'src']
         }
     });

     // Watch files
     gulp.watch([
         'src/images/**/*'
     ]).on('change', reload);

     // Watch scss
     gulp.watch([
         'src/styles/**/*.scss'
     ], ['styles']);


     // Watch pug + locals
     gulp.watch([
         'src/views/**/*.pug',
         'src/views/_locals.json'
     ], ['views']);
 });

 // PRODUCTION SERVE
 // --------------------------------------|
 gulp.task('serve:prod', ['set:prod', 'clean', 'styles', 'views', 'webpack', 'copy', 'images'], () => {
     browserSync({
         notify: false,
         port: 9000,
         server: {
             baseDir: ['dist']
         }
     });
 });
