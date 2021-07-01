import { buildAll } from './build-scripts/builder.js';
import { Context } from './build-scripts/context.js';
import { deploy } from './build-scripts/deployer.js';
import { packageSite } from './build-scripts/packager.js';
import { listen } from './build-scripts/server.js';

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
