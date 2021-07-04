import CleanBuilder from '../builders/clean-builder.class.js';
import ContentBuilder from '../builders/content-builder.class.js';
import FontsBuilder from '../builders/fonts-builder.class.js';
import ImagesBuilder from '../builders/images-builder.class.js';
import ScriptsBuilder from '../builders/scripts-builder.class.js';
import StylesBuilder from '../builders/styles-builder.class.js';

/**
 * Execute the full building pipeline.
 *
 * @param {import('../context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function buildAll(context) {
  return new CleanBuilder(context)
    .execute()
    .then(() =>
      Promise.all(
        [
          new ContentBuilder(context),
          new StylesBuilder(context),
          new ScriptsBuilder(context),
          new ImagesBuilder(context),
          new FontsBuilder(context),
        ].map((builder) => builder.execute())
      )
    )
    .catch((error) => {
      throw error;
    });
}
