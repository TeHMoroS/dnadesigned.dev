import chokidar from 'chokidar';
import { createPrivateProperty } from '../utils.js';
import * as builder from './builder.js';

/**
 * A class representing a watch builder - a builder that's launched when specific files are changed. It reacts to file
 * changes only when not already running a build process.
 */
export class WatchBuilder {
  /**
   * Default class constructor.
   *
   * @param {import('../context.js').Context} context site building context
   * @param {string} buildFunctionName pipeline building function
   * @param {string[]} paths watcher paths
   */
  constructor(context, buildFunctionName, paths) {
    if (!Object.prototype.hasOwnProperty.call(builder, buildFunctionName)) {
      throw new Error(`No builder function named "${buildFunctionName}" is defined`);
    }

    // TODO make native JavaScript private class properties when they stabilize (an ESLint stops nagging about them)
    createPrivateProperty(this, 'running', false);
    createPrivateProperty(this, 'context', context);
    createPrivateProperty(this, 'builder', builder[buildFunctionName]);
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
