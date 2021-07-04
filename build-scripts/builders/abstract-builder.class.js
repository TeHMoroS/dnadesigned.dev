import { Context } from '../context.js';

/**
 * An abstract builder class.
 */
export default class AbstractBuilder {
  #name;
  #context;

  /**
   * Default builder constructor.
   * @param {string} name build name (Content, Styles, Fonts, etc.)
   * @param {Context} context site build context
   */
  constructor(name, context) {
    if (!name) {
      throw new Error('Builder needs to be named');
    }
    if (!context) {
      context = Context.create();
    }
    this.#name = name;
    this.#context = context;
  }

  /**
   * Site build context (read only).
   * @type {Context}
   */
  get context() {
    return this.#context;
  }

  /**
   * Execute a build on a pre-configured Metalsmith instance.
   * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
   */
  execute() {
    return new Promise((resolve, reject) => {
      const instance = this._prepareBuild();
      if (!instance) {
        reject(new Error('No Metalsmith instance supplied!'));
      }

      this.context.signalExecution(this.#name);
      instance.build((error) => {
        this.context.signalDone(this.#name);
        error ? reject(error) : resolve();
      });
    });
  }

  /**
   * Prepare the build process.
   * @return {import('metalsmith').Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    throw new Error('Not implemented!');
  }
}
