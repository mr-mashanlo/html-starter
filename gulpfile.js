import pkg from 'gulp';

import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import gulpIf from 'gulp-if';
import newer from 'gulp-newer';
import rename from 'gulp-rename';

import autoprefixer from 'gulp-autoprefixer';
import csso from 'gulp-csso';
import fileinclude from 'gulp-file-include';
import groupMediaQueries from 'gulp-group-css-media-queries';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
import sassglob from 'gulp-sass-glob';

import webpackStream from 'webpack-stream';
import terser from 'gulp-terser';

import webp from 'gulp-webp';
import ttf2woff2 from 'gulp-ttf2woff2';

const { dest, parallel, series, src, watch } = pkg;
const sass = gulpSass( dartSass );

const paths = {
  html: {
    src: 'src/*.html',
    dest: 'dist/',
    watch: 'src/**/*.html'
  },
  styles: {
    src: 'src/styles/main.sass',
    dest: 'dist/styles/',
    watch: 'src/styles/**/*.sass'
  },
  scripts: {
    src: 'src/scripts/main.js',
    dest: 'dist/scripts/',
    watch: 'src/scripts/**/*.js'
  },
  images: {
    src: 'src/images/**/*.{png,jpg,jpeg,gif,svg,webp}',
    dest: 'dist/images/',
    watch: 'src/images/**/*.{png,jpg,jpeg,gif,svg,webp}'
  },
  fonts: {
    src: 'src/fonts/**/*.{ttf,woff2}',
    dest: 'dist/fonts/',
    watch: 'src/fonts/**/*.{ttf,woff2}'
  }
};

function serve() {
  browserSync.init( {
    server: { baseDir: 'dist/' },
    notify: false
  } );
  
  watch( paths.html.watch, html );
  watch( paths.styles.watch, styles );
  watch( paths.scripts.watch, scripts );
  watch( paths.images.watch, images );
  watch( paths.fonts.watch, fonts );
}

async function clean() {
  return await deleteAsync( [ 'dist/' ] );
}

function html() {
  return src( paths.html.src )
    .pipe( fileinclude() )
    .pipe( dest( paths.html.dest ) )
    .pipe( browserSync.stream() );
}

function styles() {
  return src( paths.styles.src )
    .pipe( sassglob() )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( autoprefixer() )
    .pipe( groupMediaQueries() )
    .pipe( csso() )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( dest( paths.styles.dest ) )
    .pipe( browserSync.stream() );
}

function scripts() {
  return src( paths.scripts.src )
    .pipe( webpackStream( {
      mode: 'production',
      performance: { hints: false },
      module: { rules: [ { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: [ '@babel/preset-env' ] } } } ] },
      output: { filename: 'main.min.js' }
    } ) )
    .pipe( terser() )
    .pipe( dest( paths.scripts.dest ) )
    .pipe( browserSync.stream() );
}

function images() {
  return src( paths.images.src )
    .pipe( newer( paths.images.dest ) )
    .pipe( gulpIf( file => [ '.png', '.jpg', '.jpeg' ].includes( file.extname ), webp( { quality: 90 } ) ) )
    .pipe( dest( paths.images.dest ) )
    .pipe( browserSync.stream() );
}

function fonts() {
  return src( paths.fonts.src, { encoding: false } )
    .pipe( newer( paths.fonts.dest ) )
    .pipe( gulpIf( file => [ '.ttf' ].includes( file.extname ), ttf2woff2() ) )
    .pipe( dest( paths.fonts.dest ) )
    .pipe( browserSync.stream() );
}

const dev = series( clean, parallel( html, styles, scripts, images, fonts ), serve );
const build = series( clean, parallel( html, styles, scripts, images, fonts ) );

export { dev as default, build };
