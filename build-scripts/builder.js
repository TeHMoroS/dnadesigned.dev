import { buildContent } from './builders/content.js';
import { buildFonts } from './builders/fonts.js';
import { buildImages } from './builders/images.js';
import { buildStyles } from './builders/styles.js';

// re-export the builders
export { buildContent } from './builders/content.js';
export { buildFonts } from './builders/fonts.js';
export { buildImages } from './builders/images.js';
export { buildStyles } from './builders/styles.js';

/**
 * Execute the full building pipeline.
 *
 * @param {import('./context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function buildAll(context) {
  return buildContent(context)
    .then(() => buildStyles(context))
    .then(() => buildFonts(context))
    .then(() => buildImages(context))
    .catch((error) => {
      throw error;
    });
}
