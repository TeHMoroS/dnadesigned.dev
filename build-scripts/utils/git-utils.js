import fs from 'fs';
import zlib from 'zlib';

/**
 * Creates an array of commit hash history from oldest to newest.
 * @param {string} commitHash commit hash to start with
 * @param {string} gitDirectory absolute path to Git data directory
 * @return {string[]} commit hash history array
 */
export function createCommitHistory(commitHash, gitDirectory) {
  const history = [commitHash];

  let hashToCheck = commitHash;
  while (hashToCheck) {
    const commitContent = readGitObject(hashToCheck, gitDirectory).toString();
    const parentMatch = commitContent.match(/^parent ([0-9a-f]{40})$/m);

    if (!parentMatch) {
      break;
    }

    hashToCheck = parentMatch[1];
    history.push(hashToCheck);
  }

  return history.reverse();
}

/**
 * Gets the contents of the Git tree in a form of an array of objects. A convinience function for reading the Git object
 * and parsing it into a tree structure in one call.
 * @param {string} treeHash tree hash to start with
 * @param {string} gitDirectory absolute path to Git data directory
 * @return {{dir:boolean, name: string, hash: string}[]} parsed tree array
 */
export function getGitTree(treeHash, gitDirectory) {
  const treeBuffer = readGitObject(treeHash, gitDirectory);
  return parseGitTree(treeBuffer);
}

/**
 * Parsers the content of the tree and returns it in a form of an array of objects.
 * @param {Buffer} treeBuffer
 * @return {{dir:boolean, name: string, hash: string}[]} parsed tree array
 */
export function parseGitTree(treeBuffer) {
  const tree = [];
  const treeContent = treeBuffer.slice(treeBuffer.indexOf(0) + 1);

  for (let i = 0; i < treeContent.length; i++) {
    const entry = {};
    // check if blob (1 at beginning) or tree entry and move the the name (6 or 7 characters forward)
    entry.dir = String.fromCharCode(treeContent[i]) !== '1';
    i += treeContent.slice(i).indexOf(32) + 1;

    // get the name and move to the hash (after the nearest 0 byte)
    const nameSlice = treeContent.slice(i);
    const nameLength = nameSlice.indexOf(0);
    entry.name = nameSlice.slice(0, nameLength).toString();
    i += nameLength + 1;

    // get the hash and move to the next entry (20 characters forward - 19 here and 1 in the for loop itself)
    const hashSlice = treeContent.slice(i);
    entry.hash = '';
    for (let hi = 0; hi < 20; hi++) {
      const hex = hashSlice[hi].toString(16);
      entry.hash += hex.length < 2 ? '0' + hex : hex;
    }
    // advance by 19 only - the remaining 1 will be increased by the for loop entering next iteration
    i += 19;

    tree.push(entry);
  }
  return tree;
}

/**
 * Reads the contents of a Git repository object.
 * @param {string} hash Git object's hash
 * @param {string} gitDirectory absolute path to Git data directory
 * @return {Buffer} content of the Git object
 */
export function readGitObject(hash, gitDirectory) {
  const objectPath = `${gitDirectory}/objects/${hash.substring(0, 2)}/${hash.substring(2)}`;
  const deflatedContent = fs.readFileSync(objectPath);
  return zlib.inflateSync(deflatedContent);
}
