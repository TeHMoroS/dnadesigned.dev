import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import Metalsmith from 'metalsmith';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import tailwind from 'tailwindcss';
import { executeBuild } from './common.js';

/**
 * Build step name.
 */
const STEP_NAME = 'Styles';

/**
 * The name of the main style file.
 */
const MAIN_INPUT_FILE = 'index.css';

/**
 * Output styles file name.
 */
const OUTPUT_FILE = 'styles.css';

/**
 * Output styles source map file name.
 */
const OUTPUT_MAP_FILE = `${OUTPUT_FILE}.map`;

/**
 * Removes all files from the files object.
 *
 * @param {metalsmith.Files} files the object containing all files as properties
 */
function removeAllFiles(files) {
  for (const fileName in files) {
    if (!Object.prototype.hasOwnProperty.call(files, fileName)) {
      continue;
    }
    delete files[fileName];
  }
}

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
      if (!files[MAIN_INPUT_FILE]) {
        done(new Error('No main CSS file found'), files, metalsmith);
      }

      const mainStyle = files[MAIN_INPUT_FILE];
      removeAllFiles(files);

      const plugins = [postcssImport, tailwind, autoprefixer];
      if (context.production) {
        plugins.push(cssnano());
      }

      postcss(plugins)
        .process(mainStyle.contents, {
          from: `${context.stylesDir}/${MAIN_INPUT_FILE}`,
          to: `${context.outputDir}/${OUTPUT_FILE}`,
          map: { inline: false },
        })
        .then((result) => {
          files[OUTPUT_FILE] = {
            contents: Buffer.from(result.css),
          };

          if (result.map) {
            files[OUTPUT_MAP_FILE] = {
              contents: Buffer.from(result.map.toString()),
            };
          }

          done(null, files, metalsmith);
        })
        .catch((error) => {
          done(error, files, metalsmith);
        });
    });

  return executeBuild(instance, STEP_NAME);
}
