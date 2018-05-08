/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import 'reflect-metadata';
import 'devbridge-autocomplete';
import * as jQuery from 'jquery';
import fontawesome from '@fortawesome/fontawesome'
import * as faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import { TYPES } from 'sprotty/lib';
import { containerFactory, DepGraphModelSource, REGISTRY_URL } from 'depgraph-navigator/lib/browser';

fontawesome.library.add(faSpinner);

// Create sprotty container and initialize model source
const container = containerFactory();
const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
modelSource.loadIndicator = loading => {
    jQuery('#loading-indicator').css({ visibility: loading ? 'visible' : 'hidden' });
};
modelSource.start();

// Set up input field with autocomplete
const SEARCH_SIZE = 12;
const input = jQuery('#package-input');
input.autocomplete({
    serviceUrl: REGISTRY_URL + '/-/v1/search',
    paramName: 'text',
    params: { size: SEARCH_SIZE },
    dataType: 'json',
    autoSelectFirst: true,
    maxHeight: 500,
    minChars: 2,
    deferRequestBy: 50,
    transformResult: (response, query) => {
        const suggestions = response.objects.map((entry: any) => {
            return <AutocompleteSuggestion>{
                value: entry.package.name,
                data: entry
            }
        });
        return { suggestions };
    },
    onSelect: (suggestion) => {
        modelSource.createNode(suggestion.value);
        jQuery('#sprotty').focus()
    }
});
jQuery(() => input.focus());

// Layout: put the loading indicator onto the input field
const updateLoadingIndicatorBounds = () => {
    jQuery('#loading-indicator').offset({
        top: input.offset()!.top + 3,
        left: input.offset()!.left + input.width()! - 12
    });
}
jQuery(updateLoadingIndicatorBounds);
jQuery(window).resize(updateLoadingIndicatorBounds);
