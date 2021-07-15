import Metalsmith from 'metalsmith';
import { BUILD_IMAGES_OUTPUT_DIRECTORY } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import createImagesSVGMinifyPlugin from '../plugins/images-svg-minify-plugin.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site images copying and optimization.
 */
export default class ImagesBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super('Images', context, [context.imagesDir]);
  }

  /**
   * Prepare the images building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { sourcesDir, imagesDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(sourcesDir)
      .source(imagesDir)
      .destination(`${outputDir}/${BUILD_IMAGES_OUTPUT_DIRECTORY}`)
      .clean(false)
      .use(createImagesSVGMinifyPlugin(this.context));

    return instance;
  }
}
