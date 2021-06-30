/**
 * Execute a build on a pre-configured Metalsmith instance.
 *
 * @param {import('metalsmith').Metalsmith} instance Metalsmith instance to run
 * @param {string} name build name (Content, Styles, Fonts, etc.)
 * @return {Promise} a promise that resolves on a successful build or gets rejected on build error
 */
export function executeBuild(instance, name) {
  return new Promise((resolve, reject) => {
    if (!instance) {
      reject(new Error('No Metalsmith instance supplied!'));
    }

    console.log(`-----------------------\n${name} rebuilding\n-----------------------`);
    const start = Date.now();
    instance.build((error) => {
      if (error) {
        reject(error);
      }

      const end = Date.now();
      console.log(`Build time: ${end - start}ms\n`);
      resolve();
    });
  });
}
