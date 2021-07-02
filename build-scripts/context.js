import dotenv from 'dotenv';
import { dirname, join, normalize } from 'path';
import { fileURLToPath } from 'url';
import {
  ENV_NAME_DEPLOY_DIRECTORY,
  ENV_NAME_DEPLOY_HOST,
  ENV_NAME_DEPLOY_PORT,
  ENV_NAME_DEPLOY_USER_KEY,
  ENV_NAME_DEPLOY_USER_NAME,
} from '../build-config.js';
import { BuildListener } from './listeners/build-listener.js';
import { getEnvironmentVariable } from './utils.js';

/**
 * Build modes.
 */
const MODES = Object.freeze({
  BUILD: 0,
  WATCH: 1,
  PACKAGE: 2,
  DEPLOY: 3,
});

/**
 * Class that represents a site build context, containing all needed parameters for the build process.
 */
export class Context {
  /**
   * Build mode.
   * @type {{readonly [key: string]: string}}
   */
  #mode;

  /**
   * Flag signaling to do a production build, regardless of current mode.
   * @type {boolean}
   */
  #forcedProductionBuild;

  /**
   * Absolute path to the project root directory.
   * @type {string}
   */
  #projectDirectory;

  /**
   * Array containing currently running executors.
   * @type {string[]}
   */
  #executions;

  /**
   * Array containing listeners that respond to execution start/stop events.
   * @type {Function[]}
   */
  #executionListeners;

  /**
   * Default constructor - evaluates the site build context.
   */
  constructor() {
    dotenv.config();

    const moduleFilePath = fileURLToPath(import.meta.url);

    this.#mode = this.#evaluateMode();
    this.#forcedProductionBuild = process.argv.includes('--prod');
    this.#projectDirectory = normalize(join(dirname(moduleFilePath), '..'));
    this.#executions = [];
    this.#executionListeners = [BuildListener.create()];
  }

  /**
   * Static function that constructs a new site context.
   * @return {Context} new site building context
   */
  static create() {
    return new Context();
  }

  /**
   * Flag signaling if we're in standard building mode (default).
   * @type {boolean}
   */
  get buildMode() {
    return this.#mode === MODES.BUILD;
  }

  /**
   * Flag signaling if we're in watch mode (continuous build mode).
   * @type {boolean}
   */
  get watchMode() {
    return this.#mode === MODES.WATCH;
  }

  /**
   * Flag signaling if we're in package mode.
   * @type {boolean}
   */
  get packageMode() {
    return this.#mode === MODES.PACKAGE;
  }

  /**
   * Flag signaling if we're in deploy mode.
   * @type {boolean}
   */
  get deployMode() {
    return this.#mode === MODES.DEPLOY;
  }

  /**
   * Flag signaling if this is a production build (with minification, etc.).
   * @type {boolean}
   */
  get production() {
    return this.#forcedProductionBuild || this.packageMode || this.deployMode;
  }

  /**
   * Returns the base project directory absolute path.
   * @type {string}
   */
  get projectDir() {
    return this.#projectDirectory;
  }

  /**
   * Returns the content directory absolute path.
   * @type {string}
   */
  get contentDir() {
    return `${this.#projectDirectory}/src`;
  }

  /**
   * Returns the layouts directory absolute path.
   * @type {string}
   */
  get layoutsDir() {
    return `${this.#projectDirectory}/layouts`;
  }

  /**
   * Returns the styles directory absolute path.
   * @type {string}
   */
  get stylesDir() {
    return `${this.#projectDirectory}/styles`;
  }

  /**
   * Returns the fonts directory absolute path.
   * @type {string}
   */
  get fontsDir() {
    return `${this.#projectDirectory}/fonts`;
  }

  /**
   * Returns the images directory absolute path.
   * @type {string}
   */
  get imagesDir() {
    return `${this.#projectDirectory}/images`;
  }

  /**
   * Returns the build directory absolute path.
   * @type {string}
   */
  get buildDir() {
    return `${this.#projectDirectory}/dist`;
  }

  /**
   * Returns the file output directory absolute path.
   * @type {string}
   */
  get outputDir() {
    return `${this.buildDir}/site`;
  }

  /**
   * Returns the watch mode server port.
   * @type {number}
   */
  get serverPort() {
    return 8080;
  }

  /**
   * Returns the watch mode LiveReload server port.
   * @type {number}
   */
  get liveReloadPort() {
    return 35729;
  }

  /**
   * Returns the deployment target host's name.
   * @type {string}
   */
  get deployHost() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_HOST);
  }

  /**
   * Returns the deployment target host's port.
   * @type {number}
   */
  get deployPort() {
    return Number(getEnvironmentVariable(ENV_NAME_DEPLOY_PORT));
  }

  /**
   * Returns the deployment target host's user name.
   * @type {string}
   */
  get deployUserName() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_USER_NAME);
  }

  /**
   * Returns the deployment target host user's private key path.
   * @type {string}
   */
  get deployUserKeyPath() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_USER_KEY);
  }

  /**
   * Returns the deployment target host's target directory.
   * @type {string}
   */
  get deployDirectory() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_DIRECTORY);
  }

  /**
   * Signals that an executor if about to begin execution.
   * @param {string} executorName executor name
   * @return {boolean} true, if execution was successfully registered
   */
  signalExecution(executorName) {
    if (this.#executions.includes(executorName)) {
      return false;
    }
    if (this.#executions.length === 0) {
      this.#executionListeners.forEach((listener) => listener.onBuildStart());
    }
    this.#executions.push(executorName);
    this.#executionListeners.forEach((listener) => listener.onStart(executorName));
    return true;
  }

  /**
   * Signals that an executor has finished execution.
   * @param {string} executorName executor name
   */
  signalDone(executorName) {
    if (!this.#executions.includes(executorName)) {
      return;
    }
    this.#executionListeners.forEach((listener) => listener.onStop(executorName));
    this.#executions.splice(this.#executions.indexOf(executorName), 1);
    if (this.#executions.length === 0) {
      this.#executionListeners.forEach((listener) => listener.onBuildStop());
    }
  }

  /**
   * Evaluates the site build mode.
   * @return {number} build mode
   */
  #evaluateMode() {
    const params = process.argv;

    if (params.includes('deploy')) {
      return MODES.DEPLOY;
    }
    if (params.includes('package')) {
      return MODES.PACKAGE;
    }
    if (params.includes('watch')) {
      return MODES.WATCH;
    }

    return MODES.BUILD;
  }
}
