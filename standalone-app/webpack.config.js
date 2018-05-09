/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const buildRoot = path.resolve(__dirname, 'lib');
const appRoot = path.resolve(__dirname, 'app');
const bootstrapDistPath = '../node_modules/bootstrap/dist';
const jqueryDistPath = '../node_modules/jquery/dist';
const sprottyCssPath = '../node_modules/sprotty/css';
const elkWorkerPath = '../node_modules/elkjs/lib/elk-worker.min.js';

module.exports = function(env) {
    if (!env) {
        env = {}
    }
    return {
        entry: {
            elkgraph: path.resolve(buildRoot, 'frontend/main'),
        },
        output: {
            filename: 'bundle.js',
            path: appRoot
        },
        module: {
            loaders: env.uglify ? [
                {
                    test: /.*\.js$/,
                    exclude: /snabbdom(\/|\\)es|fontawesome(\/|\\)index.es.js|popper.js(\/|\\)dist(\/|\\)esm/,
                    loader: 'uglify-loader'
                }
            ] : []
        },
        resolve: {
            extensions: ['.js']
        },
        devtool: 'source-map',
        target: 'web',
        node: {
            fs: 'empty',
            child_process: 'empty',
            net: 'empty',
            crypto: 'empty'
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: bootstrapDistPath,
                to: 'bootstrap'
            }]),
            new CopyWebpackPlugin([{
                from: jqueryDistPath,
                to: 'jquery'
            }]),
            new CopyWebpackPlugin([{
                from: sprottyCssPath,
                to: 'sprotty'
            }]),
            new CopyWebpackPlugin([{
                from: elkWorkerPath,
                to: 'elk'
            }])
        ]
    }
}