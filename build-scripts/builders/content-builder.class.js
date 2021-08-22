import Metalsmith from 'metalsmith';
import discoverPartials from 'metalsmith-discover-partials';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import { BUILD_CONTENT_INPUT_DEFAULT_FILE, BUILD_CONTENT_LAYOUT_PARTIALS_DIRECTORY } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import createContentAuthorPlugin from '../plugins/content-author-plugin.js';
import createContentLiveReloadPlugin from '../plugins/content-live-reload-plugin.js';
import createContentMinifyPlugin from '../plugins/content-minify-plugin.js';
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
    super('Content', context, [context.layoutsDir, context.contentDir]);
  }

  /**
   * Prepare the content building pipeline.
   * @return {Metalsmith} a configurated Metalsmith instance
   */
  _prepareBuild() {
    const { sourcesDir, contentDir, layoutsDir, outputDir } = this.context;
    // eslint-disable-next-line new-cap
    const instance = Metalsmith(sourcesDir)
      .source(contentDir)
      .destination(outputDir)
      .clean(false)
      .use(createContentAuthorPlugin(this.context))
      .use(markdown())
      .use(
        discoverPartials({
          directory: `${layoutsDir}/${BUILD_CONTENT_LAYOUT_PARTIALS_DIRECTORY}`,
        })
      )
      .use(
        layouts({
          default: BUILD_CONTENT_INPUT_DEFAULT_FILE,
          directory: layoutsDir,
        })
      )
      .use(createContentLiveReloadPlugin(this.context))
      .use(createContentMinifyPlugin(this.context));

    return instance;
  }
}
