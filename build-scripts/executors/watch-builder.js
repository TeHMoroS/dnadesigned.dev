import chokidar from 'chokidar';

/**
 * A class representing a watch builder - a builder that's launched when specific files are changed. It reacts to file
 * changes only when not already running a build process.
 */
export class WatchBuilder {
  /**
   * Assigned building function.
   * @type {import('../builders/abstract-builder.class')}
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
   * @param {{params: string[], Builder: string}} watcherConfig watcher configuration parameters
   * @param {string[]} paths watcher paths
   */
  constructor(context, watcherConfig, paths) {
    if (!Object.prototype.hasOwnProperty.call(watcherConfig, 'Builder')) {
      throw new Error(`No builder defined for params ${watcherConfig.params}`);
    }

    this.#builder = new watcherConfig.Builder(context);
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
      .on('all', () => this.#builder.execute());
  }
}
