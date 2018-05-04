/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import 'reflect-metadata'
import * as jQuery from 'jquery';
import { TYPES } from 'sprotty/lib';
import { containerFactory, DepGraphModelSource } from 'npm-dependency-graph-extension/lib/browser';

const container = containerFactory();
const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
modelSource.start();

const input = jQuery('#package-input');
input.keydown(event => {
    if (event.keyCode === 13) { // Enter
        modelSource.addPackageNode(input.val() as string);
    }
});
