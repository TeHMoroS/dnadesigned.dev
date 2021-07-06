// eslint-disable-next-line no-unused-vars
import Context from '../context/context.class.js';

/**
 * An abstract executor class. It determines whether it should run and runs when called.
 */
export default class AbstractExecutor {
  /**
   * Site build context.
   * @type {Context}
   */
  #context;

  /**
   * Default constructor.
   * @param {Context} context site build context
   */
  constructor(context) {
    if (!context) {
      throw new Error('No context given while creating the executor!');
    }
    this.#context = context;
  }

  /**
   * Site build context (read only).
   * @type {Context}
   */
  get context() {
    return this.#context;
  }

  /**
   * Checks to see if the executor should run.
   * @return {boolean} true, if the executor can run
   */
  supports() {
    throw new Error('Not implemented!');
  }

  /**
   * Returns the executors, upon which this executor is dependant.
   * @return {string[]} a list of required executors
   */
  requires() {
    return [];
  }

  /**
   * Runs the executor if supported.
   * @return {Promise} a promise that resolves on successful execution or gets rejected on error
   */
  execute() {
    throw new Error('Not implemented!');
  }
}
