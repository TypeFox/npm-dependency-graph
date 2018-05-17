/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { Widget } from "@phosphor/widgets";
import { Message } from '@phosphor/messaging/lib';
import { DiagramWidget, DiagramWidgetOptions } from "theia-sprotty/lib";
import { SearchBoxFactory, SearchBox } from "@theia/navigator/lib/browser/search-box";
import { DepGraphModelSource } from "../graph/model-source";

export class DepGraphWidget extends DiagramWidget {

    protected readonly searchBox: SearchBox;

    constructor(options: DiagramWidgetOptions,
                searchBoxFactory: SearchBoxFactory) {
        super(options);
        this.searchBox = searchBoxFactory({ delay: 300 });
        this.toDispose.pushAll([
            this.searchBox,
            this.searchBox.onTextChange(data => (this.modelSource as DepGraphModelSource).filter(data || '')),
            this.searchBox.onClose(() => (this.modelSource as DepGraphModelSource).filter(''))
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
