import chokidar from 'chokidar';
import { createPrivateProperty } from './utils.js';

/**
 * A class representing a watch builder - a builder that's launched when specific files are changed. It reacts to file
 * changes only when not already running a build process.
 */
export class WatchBuilder {
  /**
   * Default class constructor.
   *
   * @param {import('./context.js').Context} context site building context
   * @param {Function} buildFunction pipeline building function
   * @param {string[]} paths watcher paths
   */
  constructor(context, buildFunction, paths) {
    createPrivateProperty(this, 'running', false);
    createPrivateProperty(this, 'context', context);
    createPrivateProperty(this, 'builder', buildFunction);
    createPrivateProperty(this, 'paths', paths);
  }

  /**
   * Starts the watching and building process.
   */
  start() {
    chokidar
      .watch(this.paths, {
        persistent: false,
        awaitWriteFinish: true,
      })
      .on('all', () => {
        if (this.running) {
          return;
        }
        this.running = true;
        this.builder(this.context).finally(() => (this.running = false));
      });
  }
}
