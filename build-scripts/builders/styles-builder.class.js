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
} from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import { emptyMetalsmithFiles } from '../utils.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site CSS styles building.
 */
export default class StylesBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super('Styles', context, ['styles', 'layouts', 'content']);
  }

  /**
   * Prepare the styles building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { projectDir, stylesDir, outputDir, production } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(projectDir)
      .source(stylesDir)
      .destination(outputDir)
      .clean(false)
      .use((files, metalsmith, done) => {
        if (!files[BUILD_STYLES_MAIN_INPUT_FILE]) {
          done(new Error('No main CSS file found'), files, metalsmith);
        }

        const mainStyle = files[BUILD_STYLES_MAIN_INPUT_FILE];
        emptyMetalsmithFiles(files);

        const plugins = [postcssImport, tailwind, autoprefixer];
        if (production) {
          plugins.push(cssnano());
        }

        // suppress Tailwind JIT warnings
        process.env.JEST_WORKER_ID = undefined;

        postcss(plugins)
          .process(mainStyle.contents, {
            from: `${stylesDir}/${BUILD_STYLES_MAIN_INPUT_FILE}`,
            to: `${outputDir}/${BUILD_STYLES_OUTPUT_FILE}`,
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

    return instance;
  }
}
