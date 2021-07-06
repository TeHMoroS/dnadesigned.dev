import { readFile } from 'fs/promises';
import { Client } from 'ssh2';
import { SITE_OUTPUT_FILE } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractExecutor from './abstract-executor.class.js';
import BuildExecutor from './build-executor.class.js';
import PackageExecutor from './package-executor.class.js';

/**
 * Executor responsible for building, packaging and deploying the site.
 */
export default class DeployExecutor extends AbstractExecutor {
  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    super(context);
  }

  /**
   * Checks to see if the executor should run.
   * @return {boolean} true, if the executor can run
   */
  supports() {
    return this.context.deployMode;
  }

  /**
   * Returns the executors, upon which this executor is dependant.
   * @return {string[]} a list of names of the required executors
   */
  requires() {
    return [BuildExecutor.name, PackageExecutor.name];
  }

  /**
   * Runs the executor.
   * @return {Promise} a promise that resolves on successful execution or gets rejected on error
   */
  execute() {
    return readFile(this.context.deployUserKeyPath)
      .then((key) => this.#doFileSend(key))
      .then((key) => this.#doSiteDeploy(key))
      .then((key) => this.#doAdjustPermissions(key))
      .then(() => console.log('Deploy complete.'));
  }

  /**
   * Send the site package and return a promise that resolves on success or gets rejected on error.
   * @param {Buffer} key SSH private key
   * @return {Promise} file sending promise
   */
  #doFileSend(key) {
    return readFile(`${this.context.buildDir}/${SITE_OUTPUT_FILE}`).then(
      (data) =>
        new Promise((resolve, reject) => {
          const client = new Client();
          client.on('ready', () => {
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
          });
          this.#executeConnection(client, key);
        })
    );
  }

  /**
   * Execute a configured SSH connection to the server.
   * @param {Client} client configured SSH client
   * @param {Buffer} key SSH private key
   */
  #executeConnection(client, key) {
    const { deployHost, deployPort, deployUserName } = this.context;
    client.connect({
      host: deployHost,
      port: deployPort,
      username: deployUserName,
      privateKey: key,
    });
  }

  /**
   * Deploy the sent package and return a promise that resolves on success or gets rejected on error.
   * @param {Buffer} key SSH private key
   * @return {Promise} site deployment promise
   */
  #doSiteDeploy(key) {
    return new Promise((resolve, reject) => {
      const client = new Client();
      client.on('ready', () => {
        client.exec(`tar xzf ${SITE_OUTPUT_FILE} -C ${this.context.deployDirectory}`, (err, channel) => {
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
      });
      this.#executeConnection(client, key);
    });
  }

  /**
   * Adjust site directory permissions and return a promise that resolves on success or gets rejected on error.
   * @param {Buffer} key SSH private key
   * @return {Promise} site deployment promise
   */
  #doAdjustPermissions(key) {
    const { deployDirectory } = this.context;
    return new Promise((resolve, reject) => {
      const client = new Client();
      client.on('ready', () => {
        client.exec(
          `find ${deployDirectory} -type d -exec chmod 755 {} +; find ${deployDirectory} -type f -exec chmod 644 {} +`,
          (error, channel) => {
            if (error) {
              console.error('Error while attempting to set site directory permissions:', error);
              reject(error);
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
      });
      this.#executeConnection(client, key);
    });
  }
}
