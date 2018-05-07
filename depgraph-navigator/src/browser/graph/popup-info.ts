/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { SModelElementSchema, RequestPopupModelAction, SModelRootSchema, PreRenderedElementSchema } from "sprotty/lib";
import { DependencyGraphNodeSchema } from "./graph-model";

export function popupModelFactory(request: RequestPopupModelAction, element?: SModelElementSchema): SModelRootSchema | undefined {
    if (element && element.type === 'node') {
        const node = element as DependencyGraphNodeSchema;
        const versions = node.versions.length > 0 ? `<span class="popup-info-version">${node.versions.join(', ')}</span>`: '';
        const body = node.error? node.error : node.description;
        return {
            type: 'html',
            id: 'popup',
            children: [
                <PreRenderedElementSchema> {
                    type: 'pre-rendered',
                    id: 'popup-title',
                    code: `<div class="sprotty-popup-title">${node.name}${versions}</div>`
                },
                <PreRenderedElementSchema> {
                    type: 'pre-rendered',
                    id: 'popup-body',
                    code: `<div class="sprotty-popup-body${node.error ? ' error' : ''}">${body}</div>`
                }
            ]
        };
    }
    return undefined;
}
