# dnadesigned.dev project

Project's goals:

-   create a site building/generation tools for [dnadesigned.dev](https://dnadesigned.dev);
-   a learning project.

## Site building

The tools here should work on a "fire and forget" basis, so you just write content, launch the tools and it's done.
This is the main goal of the project.

The tools mentioned are:

-   site generation;
-   dev mode;
-   packaging;
-   deployment.

### Site generation

This is a fairly standard static site generation process. Originally based on [Metalsmith](https://metalsmith.io/) with
some standard and custom plugins (see package.json from early commits of the project). Metalsmith has been used here
in two roles:

-   as a static site generator, which it advertises itself as;
-   as a processing pipeline, then can be used for any processing needs (which Metalsmith also mentions - go check
    the "A Little Secred" section on their main page - worth it!).

In short, the building process is divided into several independent pipelines for: content, JS code, styles, fonts
and images, each with it's own plugins. The process can be run in development mode or the production mode,
the difference being site minification in production mode.

### Dev mode

This tools runs a development server that's serving the generated content and watches for any changes to the sources
to trigger a build and reload the page.

This is a combination of several tools:

-   the site generation tool (mentioned above);
-   a file watcher;
-   a LiveReload server;
-   a simple web server.

This tool has a basic development server workflow: when someone edits the sources, the file watched will trigger
the necessary build pipeline (e.g. the styles pipeline when editing CSS files or layout files), resulting in new files
being generated in the output directory. The LiveReload server is watching the output directory for changes and notifies
the page (if opened) to reload itself. The output directory is also served to the browser via a simple web server.

This tool can also be run in production mode (with minification turned on).

### Packaging

This tool basically triggers a full build first, then it compresses the output directory into a package `.tar.gz`
package, ready to be deployed on the server.

This always implies production mode (minification).

### Deployment

Again, this step triggers packaging (which in turn triggers a full build). After that the package is sent to the target
server and extracted into the specified directory. The last step is adjusting permissions on the directories and files.

This always implies production mode (minification).

## Learning experience

The other main goal of this project is the learning experience. In time, the project will be getting rid of dependencies
on other libraries, as I attempt to create simple solutions by myself, using only the Node.js APIs, as I chose Node.js
as a base. When everything has been replaced, I might go and try implementing this in other languages as well.

This goal, in any means, is not an attempt to create "another library doing XYZ". It's for the sole purpose of gaining
knowledge of how different solution are or can be built. This goes in accord with what
the [Frameworkless Movement](https://www.frameworklessmovement.org/) is about and what Uncle Bob refers to in his post
from 2015 [Make the Magic go away](https://blog.cleancoder.com/uncle-bob/2015/08/06/LetTheMagicDie.html). To cite
the latter:

> Never buy magic! Before you commit to a framework, make sure you could write it. Do this by actually writing
> something simple that does the basics that you need. Make sure the magic all goes away. And then look at the framework
> again. Is it worth it? Can you live without it?
>
> -- <cite>Robert C. Martin (Uncle Bob)</cite>

Some of the things I do here might end up as posts on the site as well. :)

### Progress

I intend to replace everything in the `dependencies` section of the `package.json` file with custom, tailored
implementations that do what I need.

Custom implementation progress so far (what I've already replaced):

-   the build tool workflow;
-   web server for serving the generated site in dev mode;
