/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { Widget } from '@phosphor/widgets';
import { Message } from '@phosphor/messaging/lib';
import { TYPES } from 'sprotty';
import { DiagramWidget, DiagramWidgetOptions, TheiaSprottyConnector } from 'sprotty-theia';
import { SearchBoxFactory, SearchBox } from '@theia/core/lib/browser/tree/search-box';
import { DepGraphModelSource } from '../graph/model-source';
import { Container } from 'inversify';

export class DepGraphWidget extends DiagramWidget {

    protected readonly searchBox: SearchBox;

    get modelSource(): DepGraphModelSource {
        return this.diContainer.get(TYPES.ModelSource);
    }

    get diagramType(): string {
        return this.options.diagramType;
    }

    constructor(options: DiagramWidgetOptions, searchBoxFactory: SearchBoxFactory, id: string, diContainer: Container, connector?: TheiaSprottyConnector) {
        super(options, id, diContainer, connector);
        this.searchBox = searchBoxFactory({ delay: 300 });
        this.toDispose.pushAll([
            this.searchBox,
            this.searchBox.onTextChange(data => (this.modelSource).filter(data || '')),
            this.searchBox.onClose(() => (this.modelSource).filter(''))
        ]);
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        if (this.searchBox.isAttached) {
            Widget.detach(this.searchBox);
        }
        Widget.attach(this.searchBox, this.node.parentElement!);
        this.addKeyListener(this.node,
            this.searchBox.keyCodePredicate.bind(this.searchBox),
            this.searchBox.handle.bind(this.searchBox));
    }

}
