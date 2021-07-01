import { minify } from 'html-minifier';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import {
  BUILD_CONTENT_INPUT_DEFAULT_FILE,
  BUILD_CONTENT_MINIFIER_PROPERTIES,
  BUILD_CONTENT_STEP_NAME,
} from '../../build-config.js';
import { executeBuild } from './common.js';

/**
 * Add a plugin for Metalsmith that will embed the LiveReload script code when running in watch mode.
 *
 * @param {import('../context.js').Context} context site build context
 * @param {Metalsmith} instance Metalsmith instance
 */
function embedLiveReloadIfWatchMode(context, instance) {
  if (!context.watchMode) {
    return;
  }

  instance.use((files, metalsmith, done) => {
    for (const fileName in files) {
      if (!Object.prototype.hasOwnProperty.call(files, fileName)) {
        continue;
      }
      const file = files[fileName];
      file.contents = Buffer.from(
        file.contents.toString().replace(
          '</body>',
          `  <script>
    document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + \
':${context.liveReloadPort}/livereload.js?snipver=1"></' + 'script>');
  </script>\n</body>`
        )
      );
    }
    done(null, files, metalsmith);
  });
}

/**
 * Add a plugin for Metalsmith that will run HTML minification when running a production build.
 *
 * @param {import('../context.js').Context} context site build context
 * @param {Metalsmith} instance Metalsmith instance
 */
function minifyIfForProduction(context, instance) {
  if (!context.production) {
    return;
  }

  instance.use((files, metalsmith, done) => {
    try {
      for (const fileName in files) {
        if (!Object.prototype.hasOwnProperty.call(files, fileName)) {
          continue;
        }

        const file = files[fileName];
        file.contents = Buffer.from(minify(file.contents.toString(), BUILD_CONTENT_MINIFIER_PROPERTIES));
      }
      done(null, files, metalsmith);
    } catch (e) {
      done(e, files, metalsmith);
    }
  });
}

/**
 * Execute the content (HTML) building pipeline.
 *
 * @param {import('../context.js').Context} context site build context
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function buildContent(context) {
  // eslint-disable-next-line new-cap
  const instance = Metalsmith(context.projectDir)
    .source(context.contentDir)
    .destination(context.outputDir)
    // clean only in build, package or deploy mode
    .clean(context.buildMode || context.packageMode || context.deployMode)
    .use(markdown())
    .use(
      layouts({
        default: BUILD_CONTENT_INPUT_DEFAULT_FILE,
        directory: context.layoutsDir,
      })
    );

  embedLiveReloadIfWatchMode(context, instance);
  minifyIfForProduction(context, instance);

  return executeBuild(instance, BUILD_CONTENT_STEP_NAME);
}
