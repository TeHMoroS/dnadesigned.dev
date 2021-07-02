import { readFile } from 'fs/promises';
import { Client } from 'ssh2';
import { SITE_OUTPUT_FILE } from '../../build-config.js';
import { packageSite } from './packager.js';

/**
 * Send the site package and return a promise that resolves on success or gets rejected on error.
 *
 * @param {import('../context.js').Context} context site build context
 * @param {Buffer} key SSH private key
 * @return {Promise} file sending promise
 */
function doFileSend(context, key) {
  return readFile(`${context.buildDir}/${SITE_OUTPUT_FILE}`).then(
    (data) =>
      new Promise((resolve, reject) => {
        const client = new Client();
        client
          .on('ready', () => {
            client.sftp((err, sftp) => {
              if (err) {
                console.error('Error while establishing SFTP connection:', err);
                reject(err);
                client.end();
                return;
              }
              sftp.writeFile(SITE_OUTPUT_FILE, data, (err) => {
                if (err) {
                  console.error('Error while sending site package:', err);
                  reject(err);
                  client.end();
                  return;
                }
                console.log('Site package successfully uploaded.');
                resolve(key);
                client.end();
              });
            });
          })
          .connect({
            host: context.deployHost,
            port: context.deployPort,
            username: context.deployUserName,
            privateKey: key,
          });
      })
  );
}

/**
 * Deploy the sent package and return a promise that resolves on success or gets rejected on error.
 *
 * @param {import('../context.js').Context} context site build context
 * @param {Buffer} key SSH private key
 * @return {Promise} site deployment promise
 */
function doSiteDeploy(context, key) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client
      .on('ready', () => {
        client.exec(`tar xzf ${SITE_OUTPUT_FILE} -C ${context.deployDirectory}`, (err, channel) => {
          if (err) {
            console.error('Error while attempting to extract site contents:', err);
            reject(err);
            return;
          }
          channel
            .on('close', (code) => {
              if (code !== 0) {
                console.error('Error while extracting site contents. Tar returned non-zero exit code');
                reject(new Error(`Tar returned non-zero code: ${code}`));
                return;
              }
              console.log('Site package successfully deployed.');
              resolve(key);
              client.end();
            })
            .on('data', () => {});
        });
      })
      .connect({
        host: context.deployHost,
        port: context.deployPort,
        username: context.deployUserName,
        privateKey: key,
      });
  });
}

/**
 * Adjust site directory permissions and return a promise that resolves on success or gets rejected on error.
 *
 * @param {import('../context.js').Context} context site build context
 * @param {Buffer} key SSH private key
 * @return {Promise} site deployment promise
 */
function doAdjustPermissions(context, key) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    client
      .on('ready', () => {
        client.exec(
          `find ${context.deployDirectory} -type d -exec chmod 755 {} +;` +
            `find ${context.deployDirectory} -type f -exec chmod 644 {} +`,
          (err, channel) => {
            if (err) {
              console.error('Error while attempting to set site directory permissions:', err);
              reject(err);
              return;
            }
            channel
              .on('close', (code) => {
                if (code !== 0) {
                  console.error('Error while adjusting site permissions: non-zero code returned');
                  reject(new Error(`Non-zero code ${code} returned`));
                  return;
                }
                console.log('Site directory permissions successfully adjusted.');
                resolve();
                client.end();
              })
              .on('data', () => {});
          }
        );
      })
      .connect({
        host: context.deployHost,
        port: context.deployPort,
        username: context.deployUserName,
        privateKey: key,
      });
  });
}

/**
 * Execute the full building pipeline.
 *
 * @param {import('../context.js').Context} context site build context
 */
export function deploy(context) {
  packageSite(context)
    .then(() => readFile(context.deployUserKeyPath))
    .then((key) => doFileSend(context, key))
    .then((key) => doSiteDeploy(context, key))
    .then((key) => doAdjustPermissions(context, key))
    .then(() => console.log('Deploy complete.'));
}
