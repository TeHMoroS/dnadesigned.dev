### Deprecated

> The repository has been archived as I'm:
> - not going to be using the dnadesigned.dev domain for the time being (will work on another brand);
> - the static site generation project is being rewritten from JS to Java (Quarkus+Native Image).


# dnadesigned.dev project

Project's goals:

-   create a site building/generation tools for [dnadesigned.dev](https://dnadesigned.dev);
-   a learning project.

The overall structure of this project is based around the concept of executors and builders, sharing a build context,
where:

-   context stores the general information about the site build configuration from input parameters, config files
    and environment variables;
-   executors are responsbile for executing different tasks (building, packaging, deploying, etc.);
-   builders are responsible for different site building pipelines (content, styles, etc.);
-   other classes for handling non-building tasks (SSH connections, compression, etc.).

The executors launch, depending on the command line parameters and employ builders and other classes to complete
the given task.

## Site building

The tools here should work on a "fire and forget" basis, so you just write content, launch the tools and it's done.
This is the main goal of the project.

The tools mentioned are:

-   site generation;
-   serve (dev) mode;
-   packaging;
-   deployment.

### Site generation

This is a fairly standard static site generation process. Originally based on [Metalsmith](https://metalsmith.io/) with
some standard and custom plugins (see `package.json` from early commits of the project). Metalsmith has been used here
in two roles:

-   as a static site generator, which it advertises itself as;
-   as a processing pipeline, then can be used for any processing needs (which Metalsmith also mentions - go check
    the "A Little Secret" section on their main page - worth it!).

In short, the building process is divided into several independent pipelines for: content, JavaScript code, styles,
fonts and images - each with it's own plugins. The process can run in development mode or the production mode
(the difference being site optimization in production mode).

### Serve (dev) mode

This tool runs a development server that's serving the generated content. It also watches for any changes to the sources
to trigger a build and reload the page.

This is a combination of several tools:

-   the site generation tool (mentioned above);
-   a file watcher;
-   a LiveReload server;
-   a simple web server.

This tool has a basic development server workflow: when someone edits the sources, the file watcher will trigger
the necessary build pipeline (e.g. the styles pipeline when editing CSS files or layout files), resulting in new files
being generated in the output directory. The LiveReload server is watching the output directory for changes and notifies
the page (if opened) to reload itself. The output directory is also served to the browser via a simple web server.

This tool can also run in production mode (with minification turned on).

### Packaging

This tool triggers a full build, compresses the output directory into a `.tar.gz` package, ready to be deployed on
the server.

This always implies production mode (minification).

### Deployment

This step triggers packaging (which in turn triggers a full build). After that, the package is sent to the target
server and extracted into the specified directory. The last step is adjusting permissions on the directories and files.

This always implies production mode (minification).

## Learning experience

The other main goal of this project is the learning experience. In time, the project will be getting rid of dependencies
on other libraries, as I attempt to create simple solutions by myself, using only the Node.js APIs, as I chose Node.js
as a base environment. When everything has been replaced, I might go and try implementing this in other languages
as well (Java and Rust being the first candidates).

This goal, by any means, is not an attempt to create "another library doing XYZ". It's for the sole purpose of gaining
knowledge of how different solutions are built or could be built. This goes in accord with what
the [Frameworkless Movement](https://www.frameworklessmovement.org/) is about and what Uncle Bob refers to in his post
from 2015 [Make the Magic go away](https://blog.cleancoder.com/uncle-bob/2015/08/06/LetTheMagicDie.html). To cite
the latter:

> Never buy magic! Before you commit to a framework, make sure you could write it. Do this by actually writing
> something simple that does the basics that you need. Make sure the magic all goes away. And then look at the framework
> again. Is it worth it? Can you live without it?
>
> -- <cite>Robert C. Martin (Uncle Bob)</cite>

Some of the things I do here will end up as posts on the site as well. :)

### Progress

I intend to replace everything in the `dependencies` section of the `package.json` file with custom, tailored
implementations that do what I need.

Custom implementation progress so far (what I've already replaced/implemented using only what Node.js has out of
the box, in order of implementation):

-   the build tool workflow - for running in different modes from the CLI;
-   simple web server - for serving the generated site in dev mode;
-   Git structure parsing and extracting commit and tree data - for use when evaluating the content authors (the author
    of the first commit that mentiones the given content file is automatically assigned as the content author);

### Additional TODOs

-   generate a site.webmanifest file automatically and link package.json name/description with it and with the base
    template
-   generate a RSS/ATOM feed
-   (long-term) go "zero dependencies"
