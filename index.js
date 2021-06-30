import { buildAll } from './build_scripts/builder.js';
import { Context } from './build_scripts/context.js';
import { deploy } from './build_scripts/deployer.js';
import { packageSite } from './build_scripts/packager.js';
import { listen } from './build_scripts/server.js';

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
