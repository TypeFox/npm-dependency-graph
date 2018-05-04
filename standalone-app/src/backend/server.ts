/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as express from 'express';

const port = 3001;

const app = express();
app.use(express.static('app'))
app.listen(port, () => console.log(`Server listening on port ${port}.`))
