/**
 * Listener monitoring the build process. It outputs that information on the terminal in a nice manner.
 */
export default class BuildListener {
  /**
   * A state object containing the state of ran builders.
   * @type {{[builderName: string]: {start: number, stop?: number}}}
   */
  #running;

  /**
   * The timer which updated the output on the terminal.
   * @type {NodeJS.Timeout}
   */
  #interval;

  /**
   * The time at which the building process has started.
   * @type {number}
   */
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
   * Runs when a build pipeline starts. The method marks the time the given builder started.
   * @param {string} builder pipeline buillder's name
   */
  onStart(builder) {
    this.#running[builder] = {
      start: Date.now(),
    };
    this.#printStatus();
  }

  /**
   * Runs when a build pipeline finishes. The method marks the time the given builder finished.
   * @param {string} builder pipeline builder's name
   */
  onStop(builder) {
    this.#running[builder].stop = Date.now();
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
    // add status of every registered builder
    for (const builder of Object.getOwnPropertyNames(this.#running)) {
      output += `\x1b[KExecuting build step "${builder}"\t- `;
      const data = this.#running[builder];
      const running = !data.stop;
      // calculate the time the builder is taking to complete
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
