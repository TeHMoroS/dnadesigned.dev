import { minify } from 'html-minifier';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import { BUILD_CONTENT_INPUT_DEFAULT_FILE, BUILD_CONTENT_MINIFIER_PROPERTIES } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractBuilder from './abstract-builder.class.js';

/**
 * Builder class for handling site content (Markdown, HTML) building.
 */
export default class ContentBuilder extends AbstractBuilder {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super('Content', context, ['layouts', 'content']);
  }

  /**
   * Prepare the content building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { projectDir, contentDir, layoutsDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(projectDir)
      .source(contentDir)
      .destination(outputDir)
      .clean(false)
      .use(markdown())
      .use(
        layouts({
          default: BUILD_CONTENT_INPUT_DEFAULT_FILE,
          directory: layoutsDir,
        })
      );

    this.#embedLiveReloadIfWatchMode(instance);
    this.#minifyIfForProduction(instance);

    return instance;
  }

  /**
   * Add a plugin for Metalsmith that will embed the LiveReload script code when running in watch mode.
   * @param {Metalsmith} instance Metalsmith instance
   */
  #embedLiveReloadIfWatchMode(instance) {
    const { watchMode, liveReloadPort } = this.context;
    if (!watchMode) {
      return;
    }

    instance.use((files, metalsmith, done) => {
      for (const fileName of Object.getOwnPropertyNames(files)) {
        const file = files[fileName];
        file.contents = Buffer.from(
          file.contents.toString().replace(
            '</body>',
            `
  <script>
    document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + \
':${liveReloadPort}/livereload.js?snipver=1"></' + 'script>');
  </script>
</body>`
          )
        );
      }
      done(null, files, metalsmith);
    });
  }

  /**
   * Add a plugin for Metalsmith that will run HTML minification when running a production build.
   * @param {Metalsmith} instance Metalsmith instance
   */
  #minifyIfForProduction(instance) {
    if (!this.context.production) {
      return;
    }

    instance.use((files, metalsmith, done) => {
      try {
        for (const fileName of Object.getOwnPropertyNames(files)) {
          const file = files[fileName];
          file.contents = Buffer.from(minify(file.contents.toString(), BUILD_CONTENT_MINIFIER_PROPERTIES));
        }
        done(null, files, metalsmith);
      } catch (e) {
        done(e, files, metalsmith);
      }
    });
  }
}
