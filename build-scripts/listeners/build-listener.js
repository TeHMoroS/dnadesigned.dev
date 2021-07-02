/**
 * Listener monitoring the build process. It outputs that information on the terminal in a nice manner.
 */
export class BuildListener {
  #running;
  #interval;
  #startTime;

  /**
   * Creates a new build listener instance.
   * @return build listener instance
   */
  static create() {
    return new BuildListener();
  }

  /**
   * Runs when a build process begins (first pipeline starts). The method prepares a new running instances object
   * and starts the timer for printing the status at regular intervals.
   */
  onBuildStart() {
    this.#startTime = Date.now();
    this.#running = {};
    this.#interval = setInterval(() => this.#printStatus(), 100);
    process.stdout.write('\n');
  }

  /**
   * Runs when a build pipeline starts. The method marks the time the given executor started.
   * @param {string} executor pipeline executor's name
   */
  onStart(executor) {
    this.#running[executor] = {
      start: Date.now(),
    };
    this.#printStatus();
  }

  /**
   * Runs when a build pipeline finishes. The method marks the time the given executor finished.
   * @param {string} executor pipeline executor's name
   */
  onStop(executor) {
    this.#running[executor].stop = Date.now();
    this.#printStatus();
  }

  /**
   * Runs when a build process finishes (last pipeline finishes). The method stops the timer and prints out the time
   * the build took to complete.
   */
  onBuildStop() {
    clearInterval(this.#interval);
    process.stdout.write(`Total build time: ${Date.now() - this.#startTime}ms\n\n`);
  }

  /**
   * Pretty-prints the current build status, using some ASCII control codes for nicer output.
   */
  #printStatus() {
    // make space for what will be printing (5 lines will do), move back up and save the cursor position
    let output = '\n\n\n\n\n\x1b[5A\x1b[s';
    let stillRunning = false;
    // add status of every registered executor
    for (const executor in this.#running) {
      if (!Object.prototype.hasOwnProperty.call(this.#running, executor)) {
        continue;
      }
      output += `\x1b[KExecuting build step "${executor}"\t- `;
      const data = this.#running[executor];
      const running = !data.stop;
      // calculate the time the executor is taking to complete
      if (running) {
        output += `${Date.now() - data.start}ms\n`;
      } else {
        output += `done (${data.stop - data.start}ms)\n`;
      }

      stillRunning = stillRunning || running;
    }
    // reset the cursor position, as we'll be printing this information again in a moment (next timer tick)
    if (stillRunning) {
      output += '\x1b[u';
    }
    // print the information
    process.stdout.write(output);
  }
}
