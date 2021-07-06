// eslint-disable-next-line no-unused-vars
import Context from './context/context.class.js';
// eslint-disable-next-line no-unused-vars
import AbstractExecutor from './executors/abstract-executor.class.js';
import BuildExecutor from './executors/build-executor.class.js';
import DeployExecutor from './executors/deploy-executor.class.js';
import PackageExecutor from './executors/package-executor.class.js';
import ServeExecutor from './executors/serve-executor.class.js';

/**
 * Build execution class. Runs the build depending on context configuration.
 */
export default class Execution {
  /**
   * Active executors to run in order.
   * @type {AbstractExecutor[]}
   */
  #activeExecutors;

  /**
   * Executors left in the current run cycle.
   * @type {AbstractExecutor[]}
   */
  #inProgressExecutors;

  /**
   * Default constructor. Creates the executor list to process the build.
   * @param {Context}
   */
  constructor(context) {
    this.#activeExecutors = [];
    this.#evaluateOrderAndCreateExecutors([
      new BuildExecutor(context),
      new DeployExecutor(context),
      new PackageExecutor(context),
      new ServeExecutor(context),
    ]);
  }

  /**
   * Run the active executors in the specified order.
   */
  run() {
    if (!this.#inProgressExecutors) {
      this.#inProgressExecutors = [].concat(this.#activeExecutors);
    }

    const yieldedExecutor = this.#getNextExecutor().next();
    if (yieldedExecutor.done) {
      this.#inProgressExecutors = null;
      return;
    }

    yieldedExecutor.value
      .execute()
      .then(() => this.run())
      .catch((error) => {
        console.error('Pipeline execution error:', error);
      });
  }

  /**
   * Evaluates the order in which the executors should be placed and creates them.
   * @param {AbstractExecutor[]} executors a list of available executors
   */
  #evaluateOrderAndCreateExecutors(executors) {
    const executorsMap = {};
    executors.map((executor) => (executorsMap[executor.constructor.name] = executor));
    executors.forEach((executor) => {
      if (this.#isExecutorActive(executor.constructor.name) || !executor.supports()) {
        return;
      }
      this.#addDependenciesIfNeeded(executor, executorsMap);
      this.#activeExecutors.push(executor);
    });
  }

  /**
   * Activates executors required by the currently processed executor, if needed.
   * @param {AbstractExecutor} executor the currently processed executor
   * @param {{[name: string]: AbstractExecutor}} executorsMap a name-to-executor map for easier searching
   */
  #addDependenciesIfNeeded(executor, executorsMap) {
    const requiredExecutors = executor.requires();
    if (requiredExecutors.length === 0) {
      return;
    }
    requiredExecutors.forEach((preceedingExecutorName) => {
      const alreadyIncluded = this.#isExecutorActive(preceedingExecutorName);
      if (alreadyIncluded) {
        return;
      }
      this.#activeExecutors.push(executorsMap[preceedingExecutorName]);
    });
  }

  /**
   * Checks is the given executor is already activated.
   * @param {string} executorName executor name
   * @return {boolean} true, if the executor is already activated
   */
  #isExecutorActive(executorName) {
    return this.#activeExecutors.filter((executor) => executor.constructor.name === executorName).length > 0;
  }

  /**
   * A generator method which retunrs executors in order in which they should be ran.
   * @return {Generator<AbstractExecutor, AbstractExecutor>} executors in expected execution order
   */
  * #getNextExecutor() {
    const nextExecutor = this.#inProgressExecutors.shift();
    if (nextExecutor) {
      yield nextExecutor;
    }
    return null;
  }
}
