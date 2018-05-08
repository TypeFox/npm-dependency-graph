/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import { IActionHandler, Action, SelectAction, TYPES } from 'sprotty/lib';
import { DepGraphModelSource } from './model-source';
import { DependencyGraphNodeSchema } from './graph-model';

@injectable()
export class ResolveNodesHandler implements IActionHandler {

    constructor(@inject(TYPES.ModelSource) protected readonly modelSource: DepGraphModelSource) {}

    handle(action: Action): void {
        if ((action as any).selectedElementsIDs) {
            const select = action as SelectAction;
            const nodes: DependencyGraphNodeSchema[] = [];
            select.selectedElementsIDs.forEach(id => {
                const element = this.modelSource.graphGenerator.index.getById(id);
                if (element && element.type === 'node')
                    nodes.push(element as DependencyGraphNodeSchema);
            });
            if (nodes.length > 0) {
                this.modelSource.resolveNodes(nodes);
            }
        }
    }
}
