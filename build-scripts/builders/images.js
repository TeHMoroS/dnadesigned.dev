import Metalsmith from 'metalsmith';
import { optimize } from 'svgo';
import { BUILD_IMAGES_OUTPUT_DIRECTORY, BUILD_IMAGES_STEP_NAME } from '../../build-config.js';
import { executeBuild } from './common.js';

/**
 * Add a plugin for Metalsmith that will run SVG minification when running a production build.
 *
 * @param {import('../context.js').Context} context site build context
 * @param {Metalsmith} instance Metalsmith instance
 */
function minifySvgIfForProduction(context, instance) {
  if (!context.production) {
    return;
  }

  instance.use((files, metalsmith, done) => {
    try {
      for (const fileName in files) {
        if (!Object.prototype.hasOwnProperty.call(files, fileName)) {
          continue;
        }
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
  });
}

/**
 * Execute the images building pipeline.
 *
 * @param {import('../context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function buildImages(context) {
  // eslint-disable-next-line new-cap
  const instance = Metalsmith(context.projectDir)
    .source(context.imagesDir)
    .destination(`${context.outputDir}/${BUILD_IMAGES_OUTPUT_DIRECTORY}`)
    .clean(false);

  minifySvgIfForProduction(context, instance);

  return executeBuild(context, instance, BUILD_IMAGES_STEP_NAME);
}
