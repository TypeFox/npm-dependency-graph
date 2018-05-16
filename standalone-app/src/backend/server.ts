/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as http from 'http';
import * as express from 'express';

//---------------------------------------------------------
// Set up static resources from the app directory
const app = express();
app.use(express.static('app'))

//---------------------------------------------------------
// Set up a proxy to the npm registry to avoid CORS
app.get('/registry/*', (inReq, inRes) => {
    const outReq = http.request({ host: 'registry.npmjs.org', path: getPath(inReq) }, outRes => {
        inRes.contentType(outRes.headers['content-type'] || 'application/json');
        inRes.status(outRes.statusCode || 200);
        outRes.on('data', chunk => {
            inRes.write(chunk);
        });
        outRes.on('end', () => {
            inRes.end();
        });
    });
    outReq.on('error', error => {
        inRes.status(500).send(error.toString());
    });
    outReq.end();
});

const getPath = (request: express.Request) => {
    let path = request.path.substring('/registry'.length);
    let paramCount = 0;
    for (const param in request.query) {
        if (paramCount === 0)
            path += '?'
        else
            path += '&'
        path += encodeURIComponent(param) + '=' + encodeURIComponent(request.query[param]);
        paramCount++;
    }
    return path;
}

//---------------------------------------------------------
// Start the server
const port = 3001;
app.listen(port, () => console.log(`Server listening on port ${port}.`))
