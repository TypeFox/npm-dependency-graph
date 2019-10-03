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
import * as faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';
import * as faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';
import * as faGithub from '@fortawesome/fontawesome-free-brands/faGithub';
import fontawesome from '@fortawesome/fontawesome';
import { TYPES } from 'sprotty';
import { ElkFactory } from 'sprotty-elk';
import {
    containerFactory, DepGraphModelSource, REGISTRY_URL, NpmDependencyGraphGenerator, IGraphGenerator
} from 'depgraph-navigator/lib/browser';
import elkFactory from 'depgraph-navigator/lib/browser/graph/elk-webworker';

fontawesome.library.add(faSpinner, faExclamationCircle, faGithub);

jQuery(() => {
    const packageInput = jQuery('#package-input');
    const loadingIndicator = jQuery('#loading-indicator');
    const errorIndicator = jQuery('#error-indicator');

    //---------------------------------------------------------
    // Create sprotty container and initialize model source
    const container = containerFactory((bind, unbind, isBound, rebind) => {
        bind(ElkFactory).toConstantValue(elkFactory);
    });
    const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
    modelSource.loadIndicator = loading => {
        loadingIndicator.css({ visibility: loading ? 'visible' : 'hidden' });
    };
    const createNode = (name: string) => {
        modelSource.createNode(name);
        jQuery('#sprotty>svg').focus();
    }

    // Configure the npm dependency graph generator to use the local proxy
    container.get<NpmDependencyGraphGenerator>(IGraphGenerator).registryUrl = 'registry';

    //---------------------------------------------------------
    // Set up the package input field with autocomplete
    const SEARCH_SIZE = 12;
    packageInput.autocomplete({
        serviceUrl: REGISTRY_URL + '/-/v1/search',
        paramName: 'text',
        params: { size: SEARCH_SIZE },
        dataType: 'json',
        autoSelectFirst: true,
        triggerSelectOnValidInput: false,
        preventBadQueries: false,
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
        onSelect: (suggestion) => createNode(suggestion.value)
    });
    packageInput.keyup(event => {
        clearErrorMessage();
        // Create a node for the input text even when there are no suggestions
        if (event.keyCode === 13)
            createNode(packageInput.val() as string);
    });
    packageInput.focus();

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
        }, 300);
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
    // Set up the dependencies filter
    const filterInput = jQuery('#filter-input');
    let lastFilterValue: string = '';
    let filterTimeout: number;
    filterInput.keyup(event => {
        if (filterTimeout)
            window.clearTimeout(filterTimeout);
        filterTimeout = window.setTimeout(() => {
            const newValue = filterInput.val() as string;
            if (newValue !== lastFilterValue) {
                modelSource.filter(newValue);
                lastFilterValue = newValue;
            }
        }, 300);
    });
    filterInput.popover({
        trigger: 'hover',
        placement: 'top'
    });

    //---------------------------------------------------------
    // Buttons in the button bar
    jQuery('#button-clear').click(event => {
        modelSource.clear();
        filterInput.val('');
    }).popover({
        trigger: 'hover',
        placement: 'top'
    });
    jQuery('#button-resolve-all').click(event => {
        modelSource.resolveGraph();
    }).popover({
        trigger: 'hover',
        placement: 'top'
    });

    //---------------------------------------------------------
    // Layout: position the indicator icons onto the input field
    const updateIndicatorBounds = () => {
        const verticalOffset = 3;
        const horizontalOffset = -12;
        loadingIndicator.offset({
            top: packageInput.offset()!.top + verticalOffset,
            left: packageInput.offset()!.left + packageInput.width()! + horizontalOffset
        });
        errorIndicator.offset({
            top: packageInput.offset()!.top + verticalOffset,
            left: packageInput.offset()!.left + packageInput.width()! + horizontalOffset
        });
    }
    jQuery(window).resize(updateIndicatorBounds);

    //---------------------------------------------------------
    // Initialize the layout
    function animationFrames(number: number): Promise<void> {
        return new Promise(resolve => {
            function recurse(n: number): void {
                if (n === 0)
                    resolve();
                else
                    window.requestAnimationFrame(() => recurse(n - 1));
            }
            recurse(number);
        });
    }
    animationFrames(2).then(() => updateIndicatorBounds());
});
