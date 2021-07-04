import chokidar from 'chokidar';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';

/**
 * An abstract builder class. It supports a single execution or watching a collection of paths for changes before
 * executing.
 */
export default class AbstractBuilder {
  #name;
  #context;
  #paths;

  /**
   * Default builder constructor.
   * @param {string} name build name (Content, Styles, Fonts, etc.)
   * @param {Context} context site build context
   * @param {string[]} paths paths to watch for changes in watch mode
   */
  constructor(name, context, paths) {
    if (!name) {
      throw new Error('Builder needs to be named');
    }
    if (!context) {
      throw new Error('No context given while creating the builder');
    }
    this.#name = name;
    this.#context = context;
    this.#paths = paths;
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
   * Watch the paths associated with this builder for changes and execute the builder when necessary.
   * @return {Promise} a promise that resolves on a successful initial build or gets rejected on build error
   */
  watch() {
    if (!this.#paths) {
      throw new Error('No location paths to watch!');
    }
    return new Promise((resolve, reject) => {
      chokidar
        .watch(this.#paths, {
          persistent: false,
          awaitWriteFinish: true,
        })
        .on('all', () => this.execute().then(resolve).catch(reject));
    });
  }

  /**
   * Prepare the build process.
   */
  _prepareBuild() {
    throw new Error('Not implemented!');
  }
}
