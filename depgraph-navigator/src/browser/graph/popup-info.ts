/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import {
    SModelElementSchema, RequestPopupModelAction, SModelRootSchema, PreRenderedElementSchema, IPopupModelProvider
} from 'sprotty';
import { DependencyGraphNodeSchema } from './graph-model';

@injectable()
export class PopupModelProvider implements IPopupModelProvider {

    getPopupModel(request: RequestPopupModelAction, element?: SModelElementSchema): SModelRootSchema | undefined {
        if (element && element.type === 'node') {
            const node = element as DependencyGraphNodeSchema;
            const titleClass = 'sprotty-popup-title';

            let versions = '';
            if (node.versions.length > 0)
                versions = `<span class="popup-info-version">${node.versions.join(', ')}</span>`;

            let title: string;
            if (node.url)
                title = `<a href="${node.url}">${node.name}</a>${versions}`;
            else
                title = `${node.name}${versions}`;

            let bodyClass = 'sprotty-popup-body';
            if (node.error)
                bodyClass += ' error';
            else if (!node.resolved)
                bodyClass += ' unresolved';

            let body = '';
            if (node.error)
                body = escapeHTML(node.error);
            else if (node.description)
                body = escapeHTML(node.description);
            else if (!node.resolved)
                body = 'This package has not been resolved yet. Select it to trigger resolution of package metadata.';

            return {
                type: 'html',
                id: 'popup',
                children: [
                    <PreRenderedElementSchema> {
                        type: 'pre-rendered',
                        id: 'popup-title',
                        code: `<div class="${titleClass}">${title}</div>`
                    },
                    <PreRenderedElementSchema> {
                        type: 'pre-rendered',
                        id: 'popup-body',
                        code: `<div class="${bodyClass}">${body}</div>`
                    }
                ]
            };
        }
        return undefined;
    }

}

function escapeHTML(s: string): string {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
