import CleanBuilder from '../builders/clean-builder.class.js';
import ContentBuilder from '../builders/content-builder.class.js';
import FontsBuilder from '../builders/fonts-builder.class.js';
import ImagesBuilder from '../builders/images-builder.class.js';
import OtherContentBuilder from '../builders/other-builder.class.js';
import ScriptsBuilder from '../builders/scripts-builder.class.js';
import StylesBuilder from '../builders/styles-builder.class.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractExecutor from './abstract-executor.class.js';

/**
 * Executor responsible for building the site.
 */
export default class BuildExecutor extends AbstractExecutor {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super(context);
  }

  /**
   * Checks to see if the executor should run.
   * @return {boolean} true, if the executor can run
   */
  supports() {
    // always supports
    return true;
  }

  /**
   * Runs the executor.
   * @return {Promise} a promise that resolves on successful execution or gets rejected on error
   */
  execute() {
    return new CleanBuilder(this.context)
      .execute()
      .then(() =>
        Promise.all(
          [
            new ContentBuilder(this.context),
            new StylesBuilder(this.context),
            new ScriptsBuilder(this.context),
            new ImagesBuilder(this.context),
            new FontsBuilder(this.context),
            new OtherContentBuilder(this.context),
          ].map((builder) => (this.context.serveMode ? builder.watch() : builder.execute()))
        )
      );
  }
}
