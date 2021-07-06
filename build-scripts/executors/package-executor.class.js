import tar from 'tar';
import { SITE_OUTPUT_FILE } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractExecutor from './abstract-executor.class.js';
import BuildExecutor from './build-executor.class.js';

/**
 * Executor responsible for building and packaging the site.
 */
export default class PackageExecutor extends AbstractExecutor {
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
    return this.context.packageMode;
  }

  /**
   * Returns the executors, upon which this executor is dependant.
   * @return {string[]} a list of names of the required executors
   */
  requires() {
    return [BuildExecutor.name];
  }

  /**
   * Runs the executor.
   * @return {Promise} a promise that resolves on successful execution or gets rejected on error
   */
  execute() {
    const { buildDir, outputDir } = this.context;
    const outputFile = `${buildDir}/${SITE_OUTPUT_FILE}`;
    return tar
      .create(
        {
          gzip: {
            level: 9,
          },
          file: outputFile,
          cwd: outputDir,
        },
        ['.']
      )
      .then((_) => console.log(`Package created at ${outputFile}`));
  }
}
