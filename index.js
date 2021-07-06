import Context from './build-scripts/context/context.class.js';
import Execution from './build-scripts/execution.class.js';

const context = Context.create();
const execution = new Execution(context);
execution.run();
