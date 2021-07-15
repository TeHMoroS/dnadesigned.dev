import { minify } from 'html-minifier';
// eslint-disable-next-line no-unused-vars
import Metalsmith from 'metalsmith';
import { BUILD_CONTENT_MINIFIER_PROPERTIES } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';

/**
 * Creates an instance of the HTML minification plugin for Metalsmith.
 * @param {Context} context site build context
 */
export default function createContentMinifyPlugin(context) {
  /**
   * HTML minification plugin for Metalsmith.
   * @param {Metalsmith.Files} files files to process
   * @param {Metalsmith} metalsmith Metalsmith instance
   * @param {Metalsmith.Callback} done callback function
   */
  return (files, metalsmith, done) => {
    if (!context.production) {
      done(null, files, metalsmith);
      return;
    }

    try {
      for (const fileName of Object.getOwnPropertyNames(files)) {
        const file = files[fileName];
        file.contents = Buffer.from(minify(file.contents.toString(), BUILD_CONTENT_MINIFIER_PROPERTIES));
      }
      done(null, files, metalsmith);
    } catch (e) {
      done(e, files, metalsmith);
    }
  };
}
