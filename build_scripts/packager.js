import tar from 'tar';
import { buildAll } from './builder.js';

/**
 * Output package file name.
 */
export const SITE_OUTPUT_FILE = 'site.tar.gz';

/**
 * Execute the building pipeline and package the results.
 *
 * @param {import('./context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful package creation or gets rejected on error
 */
export function packageSite(context) {
  const outputFile = `${context.buildDir}/${SITE_OUTPUT_FILE}`;
  return buildAll(context)
    .then(() =>
      tar.create(
        {
          gzip: {
            level: 9,
          },
          file: outputFile,
          cwd: context.outputDir,
        },
        ['.']
      )
    )
    .then((_) => console.log(`Package created at ${outputFile}`));
}
