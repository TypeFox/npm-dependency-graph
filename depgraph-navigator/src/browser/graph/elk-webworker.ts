/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import ElkConstructor from 'elkjs/lib/elk-api';
import { ElkFactory } from "./graph-layout";

const elkFactory: ElkFactory = () => new ElkConstructor({
    workerUrl: 'elk/elk-worker.min.js',
    algorithms: ['layered']
});

export default elkFactory;
