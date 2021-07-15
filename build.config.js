/**
 * Content build default layout file name.
 */
export const BUILD_CONTENT_INPUT_DEFAULT_FILE = 'default.hbs';

/**
 * Content build HTMLMinifier properties to use when minifying content.
 * @type {import('html-minifier').Options}
 */
export const BUILD_CONTENT_MINIFIER_PROPERTIES = {
  caseSensitive: false,
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  decodeEntities: true,
  html5: true,
  ignoreCustomFragments: [/<i> +<\/i>/],
  keepClosingSlash: true,
  minifyCSS: true,
  minifyJS: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
};

/**
 * Fonts build output directory.
 */
export const BUILD_FONTS_OUTPUT_DIRECTORY = 'fonts';

/**
 * Images build output directory.
 */
export const BUILD_IMAGES_OUTPUT_DIRECTORY = 'images';

/**
 * Scripts build output directory.
 */
export const BUILD_SCRIPTS_OUTPUT_DIRECTORY = 'scripts';

/**
 * Styles build main styles file.
 */
export const BUILD_STYLES_MAIN_INPUT_FILE = 'index.css';

/**
 * Styles build output file name.
 */
export const BUILD_STYLES_OUTPUT_FILE = 'styles.css';

/**
 * Styles build output map file name.
 */
export const BUILD_STYLES_OUTPUT_MAP_FILE = `${BUILD_STYLES_OUTPUT_FILE}.map`;

/**
 * Server supported MIME types.
 * @type {{[type: string]: string}}
 */
export const SERVER_MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'application/font-woff',
};

/**
 * Output package file name.
 */
export const SITE_OUTPUT_FILE = 'site.tar.gz';

/**
 * Deployment host environment variable name.
 */
export const ENV_NAME_DEPLOY_HOST = 'DEPLOY_HOST';

/**
 * Deployment host's port environment variable name.
 */
export const ENV_NAME_DEPLOY_PORT = 'DEPLOY_PORT';

/**
 * Deployment host user's name environment variable name.
 */
export const ENV_NAME_DEPLOY_USER_NAME = 'DEPLOY_USER';

/**
 * Deployment host user's key path environment variable name.
 */
export const ENV_NAME_DEPLOY_USER_KEY = 'DEPLOY_KEY';

/**
 * Deployment host's target directory environment variable name.
 */
export const ENV_NAME_DEPLOY_DIRECTORY = 'DEPLOY_DIR';
