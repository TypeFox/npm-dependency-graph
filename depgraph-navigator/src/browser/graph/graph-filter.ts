/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import { SModelIndex, SModelElementSchema } from 'sprotty';
import { DependencyGraphNodeSchema, DependencyGraphEdgeSchema, isNode } from './graph-model';
import { IGraphGenerator } from './graph-generator';

@injectable()
export class DependencyGraphFilter {

    protected nameFilter: (name: string) => boolean = node => true;

    setFilter(text: string) {
        const textTrim = text.trim();
        if (textTrim.length === 0)
            this.nameFilter = name => true;
        else if (text.startsWith(' ') && text.endsWith(' '))
            this.nameFilter = name => name === textTrim;
        else if (text.startsWith(' '))
            this.nameFilter = name => name.startsWith(textTrim);
        else if (text.endsWith(' '))
            this.nameFilter = name => name.endsWith(textTrim);
        else
            this.nameFilter = name => name.indexOf(textTrim) >= 0;
    }

    refresh(generator: IGraphGenerator): void {
        let nodeCount = 0;
        let visibleCount = 0;

        // Count the nodes and apply the name filter
        for (const node of generator.nodes) {
            const visible = this.nameFilter(node.name);
            node.hidden = !visible;
            nodeCount++;
            if (visible)
                visibleCount++;
        }
        if (visibleCount === nodeCount)
            return;
        
        // Construct a map of incoming edges
        const incoming = this.createIncomingMap(generator.edges, generator.index);
        const dfsMark: { [id: string]: boolean } = {};

        // Perform a depth-first-search to find the nodes from which the name-filtered nodes are reachable
        for (const node of generator.nodes) {
            if (!node.hidden) {
                this.dfs(node, incoming, dfsMark, generator.index);
            }
        }
    }

    protected createIncomingMap(edges: DependencyGraphEdgeSchema[], index: SModelIndex<SModelElementSchema>):
            Map<DependencyGraphNodeSchema, DependencyGraphEdgeSchema[]> {
        const incoming = new Map<DependencyGraphNodeSchema, DependencyGraphEdgeSchema[]>();
        for (const edge of edges) {
            const target = index.getById(edge.targetId);
            if (isNode(target)) {
                let arr = incoming.get(target);
                if (arr) {
                    arr.push(edge);
                } else {
                    arr = [edge];
                    incoming.set(target, arr);
                }
            }
        }
        return incoming;
    }

    protected dfs(node: DependencyGraphNodeSchema,
                  incoming: Map<DependencyGraphNodeSchema, DependencyGraphEdgeSchema[]>,
                  mark: { [id: string]: boolean },
                  index: SModelIndex<SModelElementSchema>): void {
        if (mark[node.id])
            return;
        mark[node.id] = true;
        for (const edge of incoming.get(node) || []) {
            const source = index.getById(edge.sourceId);
            if (isNode(source)) {
                source.hidden = false;
                this.dfs(source, incoming, mark, index);
            }
        }
    }

}
