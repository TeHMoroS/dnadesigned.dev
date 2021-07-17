/**
 * Returns a value of the specified environment variable.
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
