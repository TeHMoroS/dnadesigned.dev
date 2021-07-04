import Metalsmith from 'metalsmith';
import { BUILD_SCRIPTS_OUTPUT_DIRECTORY } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site scripting.
 */
export default class ScriptsBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super('Scripts', context, ['scripts']);
  }

  /**
   * Prepare the scripts building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { projectDir, scriptsDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(projectDir)
      .source(scriptsDir)
      .destination(`${outputDir}/${BUILD_SCRIPTS_OUTPUT_DIRECTORY}`)
      .clean(false);

    return instance;
  }
}
