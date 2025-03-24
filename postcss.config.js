import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import cssnano from 'cssnano';
import sortMediaQueries from 'postcss-sort-media-queries';

export default {
  plugins: [
    purgeCSSPlugin( { content: [ 'src/**/*.html' ], safelist: [ /active/ ] } ),
    cssnano( { preset: 'advanced' } ),
    sortMediaQueries()
  ]
};