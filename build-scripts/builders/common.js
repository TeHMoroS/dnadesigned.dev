/**
 * Execute a build on a pre-configured Metalsmith instance.
 * @param {import('../context.js').Context} context site build context
 * @param {import('metalsmith').Metalsmith} instance Metalsmith instance to run
 * @param {string} name build name (Content, Styles, Fonts, etc.)
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function executeBuild(context, instance, name) {
  return new Promise((resolve, reject) => {
    if (!instance) {
      reject(new Error('No Metalsmith instance supplied!'));
    }

    context.signalExecution(name);
    instance.build((error) => {
      context.signalDone(name);
      error ? reject(error) : resolve();
    });
  });
}
