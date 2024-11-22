import pkg from 'gulp';

import browserSync from 'browser-sync';
import { hideBin } from 'yargs/helpers';
import { deleteAsync } from 'del';
import gulpIf from 'gulp-if';
import newer from 'gulp-newer';
import rename from 'gulp-rename';

import fileinclude from 'gulp-file-include';

import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import purgecss from '@fullhuman/postcss-purgecss';
import sortMediaQueries from 'postcss-sort-media-queries';
import mergeRules from 'postcss-merge-rules';
import discardComments from 'postcss-discard-comments';
import discardDuplicates from 'postcss-discard-duplicates';
import discardUnused from 'postcss-discard-unused';

import webpackStream from 'webpack-stream';
import TerserPlugin from 'terser-webpack-plugin';

import webp from 'gulp-webp';
import ttf2woff2 from 'gulp-ttf2woff2';

const { dest, parallel, series, src, watch } = pkg;
const sass = gulpSass( dartSass );
const isDevelopment = hideBin( process.argv ).includes( '--dev' );

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

function server() {
  browserSync.init( {
    server: { baseDir: 'dist/' },
    notify: false,
    open: false
  } );
}

function watcher() {
  watch( paths.html.watch, parallel( html, styles ) );
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
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( postcss( [
      purgecss( { content: [ paths.html.watch ], safelist: [] } ),
      discardUnused(),
      discardDuplicates(),
      discardComments( { removeAll: true } ),
      mergeRules(),
      autoprefixer(),
      sortMediaQueries(),
      cssnano()
    ] ) )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( dest( paths.styles.dest ) )
    .pipe( browserSync.stream() );
}

function scripts() {
  const babelOptions = {
    targets: 'defaults',
    presets: [ '@babel/preset-env' ]
  };

  const babelLoader = {
    loader: 'babel-loader',
    options: babelOptions
  };

  return src( paths.scripts.src )
    .pipe( webpackStream( {
      mode: isDevelopment ? 'development' : 'production',
      output: { filename: 'main.min.js' },
      optimization: {
        splitChunks: { chunks: 'all' },
        minimizer: isDevelopment ? [] : [ new TerserPlugin() ]
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: babelLoader
          }
        ]
      }
    } ) )
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

const build = series( clean, fonts, images, parallel( html, styles, scripts ), isDevelopment ? parallel( server, watcher ) : () => Promise.resolve() );
const preview = server;

export { build as default, preview };
