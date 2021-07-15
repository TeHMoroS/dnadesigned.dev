// eslint-disable-next-line no-unused-vars
import Metalsmith from 'metalsmith';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';

/**
 * Creates an instance of the LiveReload code embedding plugin for Metalsmith.
 * @param {Context} context site build context
 */
export default function createContentLiveReloadPlugin(context) {
  /**
   * LiveReload code embedding plugin for Metalsmith.
   * @param {Metalsmith.Files} files files to process
   * @param {Metalsmith} metalsmith Metalsmith instance
   * @param {Metalsmith.Callback} done callback function
   */
  return (files, metalsmith, done) => {
    if (!context.serveMode) {
      done(null, files, metalsmith);
      return;
    }

    for (const fileName of Object.getOwnPropertyNames(files)) {
      const file = files[fileName];
      file.contents = Buffer.from(
        file.contents.toString().replace(
          '</body>',
          `
  <script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + \
  ':${context.liveReloadPort}/livereload.js?snipver=1"></' + 'script>');
  </script>
  </body>`
        )
      );
    }

    done(null, files, metalsmith);
  };
}
