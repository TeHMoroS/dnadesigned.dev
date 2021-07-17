import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
// eslint-disable-next-line no-unused-vars
import Metalsmith from 'metalsmith';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import tailwind from 'tailwindcss';
import {
  BUILD_STYLES_MAIN_INPUT_FILE,
  BUILD_STYLES_OUTPUT_FILE,
  BUILD_STYLES_OUTPUT_MAP_FILE,
} from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import { emptyMetalsmithFiles } from '../utils/metalsmith-utils.js';

/**
 * Creates an instance of the PostCSS styles processing plugin.
 * @param {Context} context site build context
 * @return {Function} Metalsmith plugin function
 */
export default function createStylesPostCSSPlugin(context) {
  /**
   * PostCSS styles processing plugin for Metalsmith.
   * @param {Metalsmith.Files} files files to process
   * @param {Metalsmith} metalsmith Metalsmith instance
   * @param {Metalsmith.Callback} done callback function
   */
  return (files, metalsmith, done) => {
    if (!files[BUILD_STYLES_MAIN_INPUT_FILE]) {
      done(new Error('No main CSS file found'), files, metalsmith);
    }

    const mainStyle = files[BUILD_STYLES_MAIN_INPUT_FILE];
    emptyMetalsmithFiles(files);

    const plugins = [postcssImport, tailwind, autoprefixer];
    if (context.production) {
      plugins.push(cssnano());
    }

    // suppress Tailwind JIT warnings
    process.env.JEST_WORKER_ID = undefined;

    postcss(plugins)
      .process(mainStyle.contents, {
        from: `${context.stylesDir}/${BUILD_STYLES_MAIN_INPUT_FILE}`,
        to: `${context.outputDir}/${BUILD_STYLES_OUTPUT_FILE}`,
        map: { inline: false },
      })
      .then((result) => {
        files[BUILD_STYLES_OUTPUT_FILE] = {
          contents: Buffer.from(result.css),
        };

        if (result.map) {
          files[BUILD_STYLES_OUTPUT_MAP_FILE] = {
            contents: Buffer.from(result.map.toString()),
          };
        }

        done(null, files, metalsmith);
      })
      .catch((error) => {
        done(error, files, metalsmith);
      });
  };
}
