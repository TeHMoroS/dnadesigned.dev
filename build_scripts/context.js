import { dirname, join, normalize } from 'path';
import { fileURLToPath } from 'url';
import { createPrivateProperty } from './utils.js';
import dotenv from 'dotenv';

/**
 * Deployment host environment variable name.
 */
const ENV_NAME_DEPLOY_HOST = 'DEPLOY_HOST';

/**
 * Deployment host's port environment variable name.
 */
const ENV_NAME_DEPLOY_PORT = 'DEPLOY_PORT';

/**
 * Deployment host user's name environment variable name.
 */
const ENV_NAME_DEPLOY_USER_NAME = 'DEPLOY_USER';

/**
 * Deployment host user's key path environment variable name.
 */
const ENV_NAME_DEPLOY_USER_KEY = 'DEPLOY_KEY';

/**
 * Deployment host's target directory environment variable name.
 */
const ENV_NAME_DEPLOY_DIRECTORY = 'DEPLOY_DIR';

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
 * Evaluates the site build mode.
 *
 * @return {number} build mode
 */
function evaluateMode() {
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

/**
 * Returns a value of the specified environment variable.
 *
 * @param {string} name environment variable name
 * @return {string} environment variable value
 * @throws Will throw an error when the environment variable was not found
 */
function getEnvironmentVariable(name) {
  const value = process.env[name?.toUpperCase()];
  if (!value) {
    throw new Error(`${name} environment variable not specified`);
  }
  return value;
}

/**
 * Class that represents a site build context, containing all needed parameters for the build process.
 */
export class Context {
  /**
   * Default constructor - evaluates the site build context.
   */
  constructor() {
    dotenv.config();

    // TODO make native JavaScript private class properties when they stabilize (an ESLint stops nagging about them)
    createPrivateProperty(this, 'mode', evaluateMode());
    createPrivateProperty(this, 'forcedProductionBuild', process.argv.includes('--prod'));

    const moduleFilePath = fileURLToPath(import.meta.url);
    createPrivateProperty(this, 'projectDir', normalize(join(dirname(moduleFilePath), '..')));
  }

  /**
   * Static function that constructs a new site context.
   *
   * @return {Context} new site building context
   */
  static create() {
    return new Context();
  }

  /**
   * Flag signaling if we're in standard building mode (default).
   *
   * @type {boolean}
   */
  get buildMode() {
    return this.mode === MODES.BUILD;
  }

  /**
   * Flag signaling if we're in watch mode (continuous build mode).
   *
   * @type {boolean}
   */
  get watchMode() {
    return this.mode === MODES.WATCH;
  }

  /**
   * Flag signaling if we're in package mode.
   *
   * @type {boolean}
   */
  get packageMode() {
    return this.mode === MODES.PACKAGE;
  }

  /**
   * Flag signaling if we're in deploy mode.
   *
   * @type {boolean}
   */
  get deployMode() {
    return this.mode === MODES.DEPLOY;
  }

  /**
   * Flag signaling if this is a production build (with minification, etc.).
   *
   * @type {boolean}
   */
  get production() {
    return this.forcedProductionBuild || this.packageMode || this.deployMode;
  }

  /**
   * Returns the base project directory absolute path.
   *
   * @type {string}
   */
  get projectDir() {
    return this.projectDir;
  }

  /**
   * Returns the content directory absolute path.
   *
   * @type {string}
   */
  get contentDir() {
    return `${this.projectDir}/src`;
  }

  /**
   * Returns the layouts directory absolute path.
   *
   * @type {string}
   */
  get layoutsDir() {
    return `${this.projectDir}/layouts`;
  }

  /**
   * Returns the styles directory absolute path.
   *
   * @type {string}
   */
  get stylesDir() {
    return `${this.projectDir}/styles`;
  }

  /**
   * Returns the fonts directory absolute path.
   *
   * @type {string}
   */
  get fontsDir() {
    return `${this.projectDir}/fonts`;
  }

  /**
   * Returns the images directory absolute path.
   *
   * @type {string}
   */
  get imagesDir() {
    return `${this.projectDir}/images`;
  }

  /**
   * Returns the build directory absolute path.
   *
   * @type {string}
   */
  get buildDir() {
    return `${this.projectDir}/dist`;
  }

  /**
   * Returns the file output directory absolute path.
   *
   * @type {string}
   */
  get outputDir() {
    return `${this.buildDir}/site`;
  }

  /**
   * Returns the watch mode server port.
   *
   * @type {number}
   */
  get serverPort() {
    return 8080;
  }

  /**
   * Returns the watch mode LiveReload server port.
   *
   * @type {number}
   */
  get liveReloadPort() {
    return 35729;
  }

  /**
   * Returns the deployment target host's name.
   *
   * @type {string}
   */
  get deployHost() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_HOST);
  }

  /**
   * Returns the deployment target host's port.
   *
   * @type {number}
   */
  get deployPort() {
    return Number(getEnvironmentVariable(ENV_NAME_DEPLOY_PORT));
  }

  /**
   * Returns the deployment target host's user name.
   *
   * @type {string}
   */
  get deployUserName() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_USER_NAME);
  }

  /**
   * Returns the deployment target host user's private key path.
   *
   * @type {string}
   */
  get deployUserKeyPath() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_USER_KEY);
  }

  /**
   * Returns the deployment target host's target directory.
   *
   * @type {string}
   */
  get deployDirectory() {
    return getEnvironmentVariable(ENV_NAME_DEPLOY_DIRECTORY);
  }
}
