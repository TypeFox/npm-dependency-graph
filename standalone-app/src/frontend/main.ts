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
import fontawesome from '@fortawesome/fontawesome'
import * as faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import { TYPES } from 'sprotty/lib';
import { containerFactory, DepGraphModelSource } from 'depgraph-navigator/lib/browser';

fontawesome.library.add(faSpinner);

const container = containerFactory();
const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
modelSource.loadIndicator = loading => {
    jQuery('#loading-indicator').css({ visibility: loading ? 'visible' : 'hidden' });
};
modelSource.start();

const input = jQuery('#package-input');
input.keydown(event => {
    if (event.keyCode === 13) { // Enter
        modelSource.createNode(input.val() as string);
    }
});

const updateLoadingIndicatorBounds = () => {
    jQuery('#loading-indicator').offset({
        top: input.offset()!.top + 3,
        left: input.offset()!.left + input.width()! - 12
    });
}

jQuery(updateLoadingIndicatorBounds);
jQuery(window).resize(updateLoadingIndicatorBounds);
