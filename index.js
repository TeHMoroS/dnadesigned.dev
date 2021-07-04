import Context from './build-scripts/context/context.class.js';
import { buildAll } from './build-scripts/executors/builder.js';
import { deploy } from './build-scripts/executors/deployer.js';
import { packageSite } from './build-scripts/executors/packager.js';
import { listen } from './build-scripts/executors/server.js';

const context = Context.create();

if (context.watchMode) {
  listen(context);
} else if (context.packageMode) {
  packageSite(context);
} else if (context.deployMode) {
  deploy(context);
} else {
  buildAll(context);
}
