import Metalsmith from 'metalsmith';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling other content.
 */
export default class OtherContentBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super('Other', context, [context.scriptsDir]);
  }

  /**
   * Prepare the scripts building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { sourcesDir, otherDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(sourcesDir).source(otherDir).destination(`${outputDir}`).clean(false);

    return instance;
  }
}
