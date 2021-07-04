import fs from 'fs/promises';
import http from 'http';
import livereload from 'livereload';
import path from 'path';
import url from 'url';
import { SERVER_MIME_TYPES, SERVER_WATCHER_BUILDERS } from '../../build.config.js';
import { clearBuildDirectory } from '../utils.js';
import { WatchBuilder } from './watch-builder.js';

/**
 * Log the request and response code.
 *
 * @param {http.IncomingMessage} request server request
 * @param {Number} statusCode response HTTP status code
 */
function logRequest(request, statusCode) {
  const color = statusCode < 300 ? '\x1b[32m' : statusCode < 400 ? '\x1b[33m' : '\x1b[31m';
  console.log(`${new Date().toISOString()} - ${color}${statusCode} ${request.method} ${request.url}\x1b[0m`);
}

/**
 * Created a server request handler based on the site build context.
 *
 * @param {import('../context.js').Context} context site build context
 * @returns {Function} server request handler
 */
function createRequestHandler(context) {
  /**
   * Server request handler. Parses the URL and returns an appropriate file from disk in response.
   *
   * @param {http.IncomingMessage} request server request
   * @param {http.ServerResponse} response server response
   */
  return (request, response) => {
    const requestUrl = new url.URL(request.url, `http://localhost:${context.serverPort}`);
    const sanitizedPath = path.normalize(requestUrl.pathname).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(context.outputDir, sanitizedPath);

    fs.stat(filePath)
      .then((stats) => {
        if (stats.isDirectory()) {
          filePath += '/index.html';
        }
        fs.readFile(filePath)
          .then((fileData) => {
            const ext = path.parse(filePath).ext;
            const mimeType = SERVER_MIME_TYPES[ext] || 'text/plain';

            response.setHeader('Content-type', mimeType);
            response.end(fileData);
            logRequest(request, 200);
          })
          .catch((error) => {
            response.statusCode = 500;
            response.end(`An unknown error has occured on read: ${error.code}`);
            logRequest(request, response.statusCode);
          });
      })
      .catch((error) => {
        if (error.code === 'ENOENT') {
          response.statusCode = 404;
          response.end(`Requested URL: ${requestUrl} was not found`);
          logRequest(request, response.statusCode);
        } else {
          response.statusCode = 500;
          response.end(`An unknown error has occured on stat: ${error.code}`);
          logRequest(request, response.statusCode);
        }
      });
  };
}

/**
 * Create the WatherBuilder factory function.
 *
 * @param {import('../context.js').Context} context site build context
 * @return WatcherBuilder factory
 */
function createWatcherBuilderFactory(context) {
  /**
   * Factory function.
   *
   * @param {{params: string[], build: Function}} watcherBuilderParams WatcherBuilder parameters
   */
  return (watcherBuilderParams) => {
    /**
     * @type {string[]}
     */
    const paths = watcherBuilderParams.params.map((paramName) => context[`${paramName}Dir`]);
    return new WatchBuilder(context, watcherBuilderParams, paths);
  };
}

/**
 * Monitor for project file changes and trigger a build when on is detected.
 *
 * @param {import('../context.js').Context} context site build context
 */
function monitorFileChanges(context) {
  SERVER_WATCHER_BUILDERS.map(createWatcherBuilderFactory(context)).forEach((watchedBuilder) => watchedBuilder.start());
}

/**
 * Run the content server and the LiveReload server.
 *
 * Based on a small HTTP server implementation (but modernized) from
 * https://adrianmejia.com/building-a-node-js-static-file-server-files-over-http-using-es6/
 *
 * @param {import('../context.js').Context} context site build context
 */
export function listen(context) {
  console.log(`Site server running at http://localhost:${context.serverPort}. \
LiveReload server running at http://localhost:${context.liveReloadPort}`);

  clearBuildDirectory(context);

  http.createServer(createRequestHandler(context)).listen(context.serverPort);
  livereload
    .createServer({
      port: context.liveReloadPort,
    })
    .watch(context.outputDir);
  monitorFileChanges(context);
}
