import Metalsmith from 'metalsmith';
import { FONTS_BUILD_OUTPUT_DIRECTORY, FONTS_BUILD_STEP_NAME } from '../../build-config.js';
import { executeBuild } from './common.js';

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
    .destination(`${context.outputDir}/${FONTS_BUILD_OUTPUT_DIRECTORY}`)
    .clean(false);
  return executeBuild(instance, FONTS_BUILD_STEP_NAME);
}
