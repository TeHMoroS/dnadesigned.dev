import Metalsmith from 'metalsmith';
import { BUILD_FONTS_OUTPUT_DIRECTORY } from '../../build.config.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site fonts copying.
 */
export default class FontsBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {import('../context.js').Context} context site build context
   */
  constructor(context) {
    super('Fonts', context, ['fonts']);
  }

  /**
   * Prepare the fonts copying pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { projectDir, fontsDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(projectDir)
      .source(fontsDir)
      .destination(`${outputDir}/${BUILD_FONTS_OUTPUT_DIRECTORY}`)
      .clean(false);

    return instance;
  }
}
