import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import pkg from 'gulp';
import fileinclude from 'gulp-file-include';
import gulpIf from 'gulp-if';
import newer from 'gulp-newer';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import ttf2woff2 from 'gulp-ttf2woff2';
import webp from 'gulp-webp';
import { rollup } from 'rollup';
import * as dartSass from 'sass';

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
    dest: 'dist/scripts/main.min.js',
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

const { dest, parallel, series, src, watch } = pkg;
const sass = gulpSass( dartSass );

function html() {
  return src( paths.html.src )
    .pipe( fileinclude() )
    .pipe( dest( paths.html.dest ) )
}

function styles() {
  return src( paths.styles.src )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( postcss() )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( dest( paths.styles.dest ) )
}

async function scripts() {
  const bundle = await rollup({
    input: paths.scripts.src,
    plugins: [ resolve(), babel( { babelHelpers: 'bundled' } ), terser() ]
  });

  await bundle.write({
    file: paths.scripts.dest,
    format: 'iife'
  });
}

function images() {
  return src( paths.images.src )
    .pipe( newer( { dest:paths.images.dest, ext: '.webp' } ) )
    .pipe( newer( { dest:paths.images.dest, ext: '.svg' } ) )
    .pipe( gulpIf( file => [ '.png', '.jpg', '.jpeg' ].includes( file.extname ), webp( { quality: 50 } ) ) )
    .pipe( dest( paths.images.dest ) )
}

function fonts() {
  return src( paths.fonts.src, { encoding: false } )
    .pipe( newer( { dest: paths.fonts.dest, ext: '.woff2' } ) )
    .pipe( gulpIf( file => [ '.ttf' ].includes( file.extname ), ttf2woff2() ) )
    .pipe( dest( paths.fonts.dest ) )
}

async function clean() {
  return await deleteAsync( [ 'dist/' ] );
}

function serve() {
  browserSync.init( {
    server: { baseDir: 'dist/' },
    notify: false,
    open: false
  });

  watch( paths.html.watch, parallel( html, styles ) );
  watch( paths.styles.watch, styles );
  watch( paths.scripts.watch, scripts );
  watch( paths.images.watch, images );
}

const build = series( clean, fonts, images, parallel( html, styles, scripts ) );

const dev = series( build, serve );

export {
  dev as default,
  build
};