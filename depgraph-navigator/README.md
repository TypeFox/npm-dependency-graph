# depgraph-navigator

A visualization of npm package dependencies that can be installed as a [Theia](https://www.theia-ide.org) extension or embedded in any web page. An example application is available at [npm-dependencies.com](http://npm-dependencies.com/).

Graphs are visualized using [Sprotty](https://www.npmjs.com/package/sprotty) and automatically arranged by [ELK](https://www.npmjs.com/package/elkjs).

Sprotty uses [dependency injection](https://www.npmjs.com/package/inversify) to configure the application, so you can change every aspect of this visualization by binding your own custom classes. This even allows you to reuse this package to display other kinds of dependencies, e.g. Maven or Python modules.
