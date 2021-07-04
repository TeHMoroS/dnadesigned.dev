import Metalsmith from 'metalsmith';
import { optimize } from 'svgo';
import { BUILD_IMAGES_OUTPUT_DIRECTORY } from '../../build.config.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site images copying and optimization.
 */
export default class ImagesBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {import('../context.js').Context} context site build context
   */
  constructor(context) {
    super('Images', context, ['images']);
  }

  /**
   * Prepare the images building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { projectDir, imagesDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(projectDir)
      .source(imagesDir)
      .destination(`${outputDir}/${BUILD_IMAGES_OUTPUT_DIRECTORY}`)
      .clean(false);

    this.#minifySvgIfForProduction(instance);

    return instance;
  }

  /**
   * Add a plugin for Metalsmith that will run SVG minification when running a production build.
   * @param {Metalsmith} instance Metalsmith instance
   */
  #minifySvgIfForProduction(instance) {
    if (!this.context.production) {
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
}
