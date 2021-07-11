import fs from 'fs/promises';
import http from 'http';
import livereload from 'livereload';
import path from 'path';
import url from 'url';
import { SERVER_MIME_TYPES } from '../../build.config.js';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import AbstractExecutor from './abstract-executor.class.js';
import BuildExecutor from './build-executor.class.js';

/**
 * Executor responsible for building and serving the site in dev mode.
 */
export default class ServeExecutor extends AbstractExecutor {
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
    return this.context.serveMode;
  }

  /**
   * Returns the executors, upon which this executor is dependant.
   * @return {string[]} a list of names of the required executors
   */
  requires() {
    return [BuildExecutor.name];
  }

  /**
   * Runs the executor.
   * @return {Promise} a promise that resolves on successful execution or gets rejected on error
   */
  execute() {
    const { serverPort, liveReloadPort, outputDir } = this.context;
    return new Promise((resolve, reject) => {
      try {
        console.log(`Site server running at http://localhost:${serverPort}. LiveReload server running at \
http://localhost:${liveReloadPort}`);

        http.createServer(this.#createRequestHandler()).listen(serverPort);
        livereload
          .createServer({
            exts: Object.keys(SERVER_MIME_TYPES).map((extension) => extension.substr(1)),
            port: liveReloadPort,
          })
          .watch(outputDir);
        console.log('LiveReload is now active.');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Created a server request handler based on the site build context.
   * @returns {Function} server request handler
   */
  #createRequestHandler() {
    const { serverPort, outputDir } = this.context;
    /**
     * Server request handler. Parses the URL and returns an appropriate file from disk in response.
     *
     * Based on a small HTTP server implementation (but modernized) from
     * https://adrianmejia.com/building-a-node-js-static-file-server-files-over-http-using-es6/
     * @param {http.IncomingMessage} request server request
     * @param {http.ServerResponse} response server response
     */
    return (request, response) => {
      const requestUrl = new url.URL(request.url, `http://localhost:${serverPort}`);
      const sanitizedPath = path.normalize(requestUrl.pathname).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(outputDir, sanitizedPath);

      fs.stat(filePath)
        .then((stats) => {
          if (stats.isDirectory()) {
            filePath += '/index.html';
          }
          return fs.readFile(filePath);
        })
        .then((fileData) => {
          const ext = path.parse(filePath).ext;
          const mimeType = SERVER_MIME_TYPES[ext] || 'text/plain';

          response.setHeader('Content-type', mimeType);
          response.end(fileData);
          this.#logRequest(request, 200);
        })
        .catch((error) => {
          if (error.code === 'ENOENT') {
            response.statusCode = 404;
            response.end(`Requested URL: ${requestUrl} was not found`);
            this.#logRequest(request, response.statusCode);
          } else {
            response.statusCode = 500;
            response.end(`An unknown error has occured on stat: ${error.code}`);
            this.#logRequest(request, response.statusCode);
          }
        });
    };
  }

  /**
   * Log the request and response code.
   * @param {http.IncomingMessage} request server request
   * @param {Number} statusCode response HTTP status code
   */
  #logRequest(request, statusCode) {
    const { method, url } = request;
    const color = statusCode < 300 ? '\x1b[32m' : statusCode < 400 ? '\x1b[33m' : '\x1b[31m';
    console.log(`${new Date().toISOString()} - ${color}${statusCode} ${method} ${url}\x1b[0m`);
  }
}
