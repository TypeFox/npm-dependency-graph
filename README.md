## Package Dependency Graph for npm

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/TypeFox/npm-dependency-graph/)

![Dependency graph of sprotty](https://raw.githubusercontent.com/TypeFox/npm-dependency-graph/master/screenshot.png)

This project renders dependency graphs of npm packages. It uses [the npm registry](https://github.com/npm/registry) to obtain package metadata, [sprotty](https://github.com/theia-ide/sprotty) for rendering the graphs, and [ELK](https://www.eclipse.org/elk/) for automatic layout. It can be run either as a standalone application with a simple web page or as a [Theia](https://www.theia-ide.org) extension. Theia supports both the web browser and [Electron](https://electronjs.org).

The standalone application is available at [npm-dependencies.com](http://npm-dependencies.com/). Find more details on this project [in this blog post](http://typefox.io/visualizing-npm-package-dependencies-with-sprotty).

### Building

The easiest way to build and test this application is to [open it in Gitpod](https://gitpod.io/#https://github.com/TypeFox/npm-dependency-graph/). If you would like to do it on your own machine, follow the steps below.

You need [Yarn](https://yarnpkg.com/) in order to build this project.

```
$ git clone https://github.com/TypeFox/npm-dependency-graph.git
$ cd npm-dependency-graph
$ yarn
```

### Running as Standalone App

```
$ cd standalone-app
$ yarn start
```

Point your web browser to `http://localhost:3001/`

### Running as Theia App in the Browser

```
$ cd browser-app
$ yarn start
```

Point your web browser to `http://localhost:3000/`

### Running as Theia App with Electron

```
$ yarn rebuild:electron
$ cd electron-app
$ yarn start
```

If you would like to switch back to the browser app, run `yarn rebuild:browser`.
