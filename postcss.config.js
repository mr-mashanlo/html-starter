import purgecss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import discardComments from 'postcss-discard-comments';
import discardDuplicates from 'postcss-discard-duplicates';
import discardUnused from 'postcss-discard-unused';
import mergeRules from 'postcss-merge-rules';
import sortMediaQueries from 'postcss-sort-media-queries';

export default {
  plugins: [
    purgecss( { content: [ 'src/**/*.html' ], safelist: [] } ),
    discardUnused(),
    discardDuplicates(),
    discardComments( { removeAll: true } ),
    mergeRules(),
    autoprefixer(),
    sortMediaQueries(),
    cssnano()
  ]
};