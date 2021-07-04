import { rm } from 'fs/promises';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for cleaning the build directory.
 */
export default class CleanBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {import('../context.js').Context} context site build context
   */
  constructor(context) {
    super('Clean', context);
  }

  /**
   * Execute a cleaning step.
   * @return {Promise} a promise that resolves on a successful cleaning or gets rejected on error
   */
  execute() {
    return rm(this.context.buildDir, {
      recursive: true,
      force: true,
    });
  }
}
