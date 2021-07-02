import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import Metalsmith from 'metalsmith';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import tailwind from 'tailwindcss';
import {
  BUILD_STYLES_MAIN_INPUT_FILE,
  BUILD_STYLES_OUTPUT_FILE,
  BUILD_STYLES_OUTPUT_MAP_FILE,
  BUILD_STYLES_STEP_NAME,
} from '../../build-config.js';
import { emptyMetalsmithFiles } from '../utils.js';
import { executeBuild } from './common.js';

/**
 * Execute the styles building pipeline.
 *
 * @param {import('../context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function buildStyles(context) {
  // eslint-disable-next-line new-cap
  const instance = Metalsmith(context.projectDir)
    .source(context.stylesDir)
    .destination(context.outputDir)
    .clean(false)
    .use((files, metalsmith, done) => {
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
    });

  return executeBuild(context, instance, BUILD_STYLES_STEP_NAME);
}
