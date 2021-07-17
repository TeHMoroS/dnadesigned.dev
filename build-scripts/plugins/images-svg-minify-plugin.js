// eslint-disable-next-line no-unused-vars
import Metalsmith from 'metalsmith';
import { optimize } from 'svgo';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';

/**
 * Creates an instance of the SVG minification plugin.
 * @param {Context} context site build context
 * @return {Function} Metalsmith plugin function
 */
export default function createImagesSVGMinifyPlugin(context) {
  /**
   * SVG minification plugin for Metalsmith.
   * @param {Metalsmith.Files} files files to process
   * @param {Metalsmith} metalsmith Metalsmith instance
   * @param {Metalsmith.Callback} done callback function
   */
  return (files, metalsmith, done) => {
    if (!context.production) {
      done(null, files, metalsmith);
    }

    try {
      for (const fileName of Object.getOwnPropertyNames(files)) {
        // skip non-SVG files
        if (!fileName.endsWith('.svg')) {
          continue;
        }

        const file = files[fileName];
        file.contents = Buffer.from(optimize(file.contents.toString()).data);
      }
      done(null, files, metalsmith);
    } catch (e) {
      done(e, files, metalsmith);
    }
  };
}
