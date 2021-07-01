/**
 * Create a private property in an object.
 *
 * @param {object} target the target object in which the property should be created
 * @param {string} name the name of the property to create
 * @param {any} value the initial value of the property
 */
export function createPrivateProperty(target, name, value) {
  Object.defineProperty(target, name, {
    value,
    enumerable: false,
    writable: true,
  });
}
