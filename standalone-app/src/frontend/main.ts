/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import 'reflect-metadata';
import 'bootstrap';
import 'devbridge-autocomplete';
import * as jQuery from 'jquery';
import * as faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import * as faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle'
import fontawesome from '@fortawesome/fontawesome'
import { TYPES } from 'sprotty/lib';
import {
    containerFactory, DepGraphModelSource, REGISTRY_URL, NpmDependencyGraphGenerator, IGraphGenerator
} from 'depgraph-navigator/lib/browser';

fontawesome.library.add(faSpinner, faExclamationCircle);

jQuery(() => {
    const input = jQuery('#package-input');
    const loadingIndicator = jQuery('#loading-indicator');
    const errorIndicator = jQuery('#error-indicator');

    //---------------------------------------------------------
    // Create sprotty container and initialize model source
    const container = containerFactory();
    const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
    modelSource.loadIndicator = loading => {
        loadingIndicator.css({ visibility: loading ? 'visible' : 'hidden' });
    };
    modelSource.start();

    // Configure the npm dependency graph generator to use the local proxy
    container.get<NpmDependencyGraphGenerator>(IGraphGenerator).registryUrl = 'registry';

    //---------------------------------------------------------
    // Set up input field with autocomplete
    const SEARCH_SIZE = 12;
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
        onSearchComplete: (query, suggestions) => {
            if (suggestions.length === 0)
                setErrorMessage(`No package found for search query: ${query}`);
        },
        onSearchError: (query, jqXHR, textStatus, errorThrown) => {
            if (textStatus !== 'abort') {
                let message = 'Search request to package registry failed';
                if (textStatus)
                    message += ` (${textStatus})`;
                setErrorMessage(message);
            }
        },
        onSelect: (suggestion) => {
            modelSource.createNode(suggestion.value);
            jQuery('#sprotty>svg').focus();
        }
    });
    input.keydown(event => clearErrorMessage());
    input.focus();

    //---------------------------------------------------------
    // Manage the error indicator icon and its popup box
    let errorMessageTimeout: number;
    let errorVisible = false;
    const setErrorMessage = (message: string) => {
        if (errorMessageTimeout)
            window.clearTimeout(errorMessageTimeout);
        errorMessageTimeout = window.setTimeout(() => {
            errorIndicator.attr({ 'data-content': message }).css({ visibility: 'visible' });
            errorVisible = true;
        }, 500);
    }
    const clearErrorMessage = () => {
        if (errorMessageTimeout)
            window.clearTimeout(errorMessageTimeout);
        if (errorVisible) {
            errorIndicator.css({ visibility: 'hidden' });
            errorIndicator.popover('hide');
            errorVisible = false;
        }
    }
    errorIndicator.popover({
        trigger: 'hover',
        placement: 'bottom'
    });

    //---------------------------------------------------------
    // Buttons in the button bar
    jQuery('#button-clear').click(event => {
        modelSource.clear();
    });

    //---------------------------------------------------------
    // Layout: position the indicator icons onto the input field
    const updateIndicatorBounds = () => {
        const verticalOffset = 3;
        const horizontalOffset = -12;
        loadingIndicator.offset({
            top: input.offset()!.top + verticalOffset,
            left: input.offset()!.left + input.width()! + horizontalOffset
        });
        errorIndicator.offset({
            top: input.offset()!.top + verticalOffset,
            left: input.offset()!.left + input.width()! + horizontalOffset
        });
    }
    updateIndicatorBounds();
    jQuery(window).resize(updateIndicatorBounds);
});
