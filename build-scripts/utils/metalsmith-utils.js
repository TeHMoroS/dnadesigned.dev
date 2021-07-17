/**
 * Removes all files from the files object.
 * @param {import('metalsmith').Files} files the object containing all files as properties
 */
export function emptyMetalsmithFiles(files) {
  for (const fileName of Object.getOwnPropertyNames(files)) {
    delete files[fileName];
  }
}
