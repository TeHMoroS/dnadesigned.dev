import chokidar from 'chokidar';
import * as builder from './builder.js';

/**
 * A class representing a watch builder - a builder that's launched when specific files are changed. It reacts to file
 * changes only when not already running a build process.
 */
export class WatchBuilder {
  /**
   * Watch builder name.
   * @type {string}
   */
  #name;

  /**
   * Site building context.
   * @type {import('../context.js').Context}
   */
  #context;

  /**
   * Assigned building function.
   * @type {Function}
   */
  #builder;

  /**
   * Paths to watch for changes.
   * @type {string[]}
   */
  #paths;

  /**
   * Default class constructor.
   *
   * @param {import('../context.js').Context} context site building context
   * @param {{name: string, params: string[], build:string}} params pipeline building parameters
   * @param {string[]} paths watcher paths
   */
  constructor(context, params, paths) {
    if (!Object.prototype.hasOwnProperty.call(builder, params.build)) {
      throw new Error(`No builder function named "${params.build}" is defined`);
    }

    this.#name = params.name;
    this.#context = context;
    this.#builder = builder[params.build];
    this.#paths = paths;
  }

  /**
   * Starts the watching and building process.
   */
  start() {
    chokidar
      .watch(this.#paths, {
        persistent: false,
        awaitWriteFinish: true,
      })
      .on('all', () => this.#builder(this.#context));
  }
}
