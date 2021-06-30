import Metalsmith from 'metalsmith';
import { executeBuild } from './common.js';

/**
 * Build step name.
 */
const STEP_NAME = 'Fonts';

/**
 * The name of the main style file.
 */
const OUTPUT_DIRECTORY = 'fonts';

/**
 * Execute the fonts building pipeline.
 *
 * @param {import('../context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function buildFonts(context) {
  // eslint-disable-next-line new-cap
  const instance = Metalsmith(context.projectDir)
    .source(context.fontsDir)
    .destination(`${context.outputDir}/${OUTPUT_DIRECTORY}`)
    .clean(false);
  return executeBuild(instance, STEP_NAME);
}
