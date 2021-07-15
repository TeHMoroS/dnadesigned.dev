import Metalsmith from 'metalsmith';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import createStylesPostCSSPlugin from '../plugins/styles-postcss-plugin.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site CSS styles building.
 */
export default class StylesBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super('Styles', context, [context.stylesDir, context.layoutsDir, context.contentDir]);
  }

  /**
   * Prepare the styles building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { sourcesDir, stylesDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(sourcesDir)
      .source(stylesDir)
      .destination(outputDir)
      .clean(false)
      .use(createStylesPostCSSPlugin(this.context));

    return instance;
  }
}
