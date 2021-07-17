import fs from 'fs/promises';
// eslint-disable-next-line no-unused-vars
import Metalsmith from 'metalsmith';
import path from 'path';
// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';
import { createCommitHistory, getGitTree, readGitObject } from '../utils/git-utils.js';

/**
 * Creates an instance of the author finding plugin for Metalsmith.
 * @param {Context} context site build context
 * @return {Function} Metalsmith plugin function
 */
export default function createContentAuthorPlugin(context) {
  /**
   * Author finding plugin for Metalsmith. It scans the Git directory commits of the currently selected branch, locates
   * the commit in which the file was created and extract's it's author as the content author.
   * @param {Metalsmith.Files} files files to process
   * @param {Metalsmith} metalsmith Metalsmith instance
   * @param {Metalsmith.Callback} done callback function
   */
  return (files, metalsmith, done) => {
    // read the branch or commit we're currently on
    // create the commit history (hashes only)
    const gitDirectory = `${context.projectDir}/.git`;

    fs.readFile(`${gitDirectory}/HEAD`, { encoding: 'utf-8' })
      .then((head) => buildCommitHistory(head, gitDirectory))
      .then((history) => createCommitDataMap(history, gitDirectory))
      .then((commitDataMap) => assignAuthorsToFiles(commitDataMap, gitDirectory, files, context))
      .then(() => done(null, files, metalsmith))
      .catch((error) => done(error, files, metalsmith));
  };
}

/**
 * Creates a commit history, containing a chronological list of all commits, up to the initial one.
 * @param {string} head Git's head position on the current branch
 * @param {string} gitDirectory absolute path to Git data directory
 * @return {Promise<string[]>} a promise, which resolves with a complete history to scan (from oldest commit to newest)
 * or rejects on error
 */
function buildCommitHistory(head, gitDirectory) {
  return new Promise((resolve, reject) => {
    const refMatch = head.match(/^ref: (.+)$/m);
    const hashMatch = head.match(/^([0-9a-f]{40})$/m);
    if (refMatch === null && hashMatch === null) {
      reject(new Error('Unknown head format found!'));
      return;
    }
    resolve(refMatch ? refMatch[1] : hashMatch[1]);
  })
    .then(
      (match) =>
        new Promise((resolve, reject) => {
          if (!match.startsWith('refs')) {
            resolve(match);
          }
          const refFile = `${gitDirectory}/${match}`;
          fs.readFile(refFile, { encoding: 'utf-8' })
            .then((hash) => resolve(hash.trim()))
            .catch(reject);
        })
    )
    .then((lastCommitHash) => assembleCommitHistory(lastCommitHash, gitDirectory));
}

/**
 * Creates an array of commit hash history from oldest to newest.
 * @param {string} commitHash commit hash to start with
 * @param {string} gitDirectory absolute path to Git data directory
 * @return {Promise<string[]>} a promise that resolves with a commit hash history or rejects on error
 */
function assembleCommitHistory(commitHash, gitDirectory) {
  return new Promise((resolve, reject) => {
    try {
      const history = createCommitHistory(commitHash, gitDirectory);
      resolve(history);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates a map containing a relation of commit hash to it's author and hash of the tree inside the site's content
 * directory.
 * @param {string[]} commitHistory commit hash history (from oldest)
 * @param {string} gitDirectory absolute path to Git data directory
 * @return {Promise<Map<string,{author:string,treeHash:string}>} a promise that resolves with a commit data map
 * (commit in relation to the author and content directory tree object hash) or rejects on error
 */
function createCommitDataMap(commitHistory, gitDirectory) {
  return new Promise((resolve, reject) => {
    const map = new Map();
    for (const hash of commitHistory) {
      const commitString = readGitObject(hash, gitDirectory).toString();

      // eslint-disable-next-line no-control-regex
      const treeMatch = commitString.match(/^.+\x00tree ([0-9a-f]{40})$/m);
      const authorMatch = commitString.match(/^author (.+) </m);
      if (!treeMatch || !authorMatch) {
        reject(new Error(`No author or tree entry found for commit ${hash}!`));
        return;
      }

      try {
        const mainTree = getGitTree(treeMatch[1], gitDirectory);
        const srcDirectoryHash = mainTree.filter((entry) => entry.dir && entry.name === 'src')[0]?.hash;
        if (!srcDirectoryHash) {
          reject(new Error('No source directory detected for current site!'));
          return;
        }

        // special case: see if we're in the new structure format (after refactoring content from src to src/content)
        const srcTree = getGitTree(srcDirectoryHash, gitDirectory);
        const contentDirectoryHash = srcTree.filter((entry) => entry.dir || entry.name === 'content')[0]?.hash;

        map.set(hash, {
          author: authorMatch[1],
          treeHash: contentDirectoryHash ? contentDirectoryHash : srcDirectoryHash,
        });
      } catch (error) {
        reject(error);
        return;
      }
    }
    resolve(map);
  });
}

/**
 * Assign the author of the first commit the given file has appeared in to the content files.
 * @param {Map<string,{author:string,treeHash:string}>} commitDataMap a map of commit hash to it's author and tree hash
 * @param {string} gitDirectory absolute path to Git data directory
 * @param {Metalsmith.Files} files files to process
 * @param {Context} context site build context
 * @return {Promise<void>} a promise that resolves, when all files have been checked or rejects on error or when a file
 * is missing an author in production environment
 */
function assignAuthorsToFiles(commitDataMap, gitDirectory, files, context) {
  return Promise.all(
    Object.getOwnPropertyNames(files).map(
      (fileName) =>
        new Promise((resolve, reject) => {
          const file = files[fileName];
          const pathToFile = fileName.split(path.sep);

          for (const commitHash of commitDataMap.keys()) {
            const commit = commitDataMap.get(commitHash);
            let tree = getGitTree(commit.treeHash, gitDirectory);

            for (const pathEntry of pathToFile) {
              const match = tree.filter((treeEntry) => treeEntry.name === pathEntry)[0];
              if (!match) {
                // no match, so no information in this commit - can move to the next
                tree = null;
                break;
              }
              if (match.dir) {
                // match is a directory - prepare to go inside
                tree = getGitTree(match.hash, gitDirectory);
              } else {
                // match is a file - that's the commit we're searching for
                file.author = commit.author;
                break;
              }
            }

            if (file.author) {
              // commit found, further processing is not required
              break;
            }
            if (tree === null) {
              // no match in this commit, so move on to the next one
              continue;
            }
          }

          if (!file.author && context.production) {
            // only fail when there's no author in a production environment
            reject(new Error(`No author found for file ${fileName}! Did you forget to commit?`));
            return;
          }
          resolve();
        })
    )
  );
}
