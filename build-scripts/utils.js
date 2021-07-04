/**
 * Returns a value of the specified environment variable.
 *
 * @param {string} name environment variable name
 * @return {string} environment variable value
 * @throws Will throw an error when the environment variable was not found
 */
export function getEnvironmentVariable(name) {
  const value = process.env[name?.toUpperCase()];
  if (!value) {
    throw new Error(`${name} environment variable not specified`);
  }
  return value;
}

/**
 * Removes all files from the files object.
 *
 * @param {import('metalsmith').Files} files the object containing all files as properties
 */
export function emptyMetalsmithFiles(files) {
  for (const fileName in files) {
    if (!Object.prototype.hasOwnProperty.call(files, fileName)) {
      continue;
    }
    delete files[fileName];
  }
}
