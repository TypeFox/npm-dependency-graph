/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject, optional } from "inversify";
import {
    LocalModelSource, TYPES, IActionDispatcher, ActionHandlerRegistry, ViewerOptions,
    IPopupModelProvider, IStateAwareModelProvider, ILogger, SelectAction, FitToScreenAction,
    SelectAllAction, Action, SelectCommand, SelectAllCommand, IModelLayoutEngine, SModelElementSchema
} from "sprotty/lib";
import { IGraphGenerator } from "./graph-generator";
import { DependencyGraphNodeSchema, isNode } from "./graph-model";
import { DependencyGraphFilter } from "./graph-filter";

@injectable()
export class DepGraphModelSource extends LocalModelSource {

    loadIndicator: (loadStatus: boolean) => void = () => {};

    constructor(@inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher,
                @inject(TYPES.ActionHandlerRegistry) actionHandlerRegistry: ActionHandlerRegistry,
                @inject(TYPES.ViewerOptions) viewerOptions: ViewerOptions,
                @inject(TYPES.ILogger) logger: ILogger,
                @inject(IGraphGenerator) public readonly graphGenerator: IGraphGenerator,
                @inject(DependencyGraphFilter) protected readonly graphFilter: DependencyGraphFilter,
                @inject(TYPES.StateAwareModelProvider)@optional() modelProvider?: IStateAwareModelProvider,
                @inject(TYPES.IPopupModelProvider)@optional() popupModelProvider?: IPopupModelProvider,
                @inject(TYPES.IModelLayoutEngine)@optional() layoutEngine?: IModelLayoutEngine
            ) {
        super(actionDispatcher, actionHandlerRegistry, viewerOptions, logger, modelProvider, popupModelProvider, layoutEngine);

        this.currentRoot = {
            type: 'graph',
            id: 'npm-dependency-graph',
            children: []
        };
    }

    protected initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);

        registry.register(SelectCommand.KIND, this);
        registry.register(SelectAllCommand.KIND, this);
    }

    select(elementIds: string[]): Promise<void> {
        if (elementIds.length > 0) {
            return this.actionDispatcher.dispatch(new SelectAction(elementIds.filter(id => {
                const element = this.graphGenerator.index.getById(id);
                return isNode(element) && !element.hidden;
            })));
        } else {
            return Promise.resolve();
        }
    }

    center(elementIds: string[]): Promise<void> {
        if (elementIds.length > 0) {
            return this.actionDispatcher.dispatch(<FitToScreenAction>{
                kind: 'fit',
                elementIds: elementIds.filter(id => {
                    const element = this.graphGenerator.index.getById(id);
                    return isNode(element) && !element.hidden;
                }),
                padding: 20,
                maxZoom: 1,
                animate: true
            });
        } else {
            return Promise.resolve();
        }
    }

    async filter(text: string): Promise<void> {
        this.loadIndicator(true);

        this.graphFilter.setFilter(text);
        this.graphFilter.refresh(this.graphGenerator);
        this.actionDispatcher.dispatch(new SelectAllAction(false));
        const center = this.graphGenerator.nodes.filter(n => !n.hidden).map(c => c.id);
        await this.updateModel();

        this.loadIndicator(false);
        this.center(center);
    }

    async createNode(name: string, version?: string): Promise<void> {
        const isNew = this.graphGenerator.index.getById(name) === undefined;
        const node = this.graphGenerator.generateNode(name, version);
        if (isNew) {
            this.loadIndicator(true);
            await this.updateModel();
            this.loadIndicator(false);
        }
        this.select([node.id]);
    }

    async resolveNodes(nodes: DependencyGraphNodeSchema[]): Promise<void> {
        if (nodes.every(n => !!n.hidden || !!n.resolved)) {
            this.center(nodes.map(n => n.id));
            return;
        }
        this.loadIndicator(true);

        const promises: Promise<DependencyGraphNodeSchema[]>[] = [];
        const center: string[] = [];
        for (const node of nodes) {
            if (!node.hidden) {
                try {
                    promises.push(this.graphGenerator.resolveNode(node));
                } catch (error) {
                    node.error = error.toString();
                }
                center.push(node.id);
            }
        }
        await Promise.all(promises)
        this.graphFilter.refresh(this.graphGenerator);
        await this.updateModel();

        this.loadIndicator(false);
        this.center(center);
    }

    async resolveGraph(): Promise<void> {
        this.loadIndicator(true);

        let nodes = this.graphGenerator.nodes.filter(n => !n.hidden && !n.resolved) as DependencyGraphNodeSchema[];
        while (nodes.length > 0) {
            const newNodes: DependencyGraphNodeSchema[] = [];
            const promises: Promise<void>[] = [];
            for (const node of nodes) {
                try {
                    promises.push(this.graphGenerator.resolveNode(node).then(result => {
                        newNodes.push(...result);
                    }));
                } catch (error) {
                    node.error = error.toString();
                }
            }
            await Promise.all(promises);
            nodes = newNodes;
        }
        this.graphFilter.refresh(this.graphGenerator);
        const center = this.graphGenerator.nodes.filter(n => !n.hidden).map(c => c.id);
        await this.updateModel();

        this.loadIndicator(false);
        this.center(center);
    }

    clear(): Promise<void> {
        const gen = this.graphGenerator;
        gen.nodes.forEach(n => gen.index.remove(n));
        gen.nodes.splice(0, gen.nodes.length);
        gen.edges.forEach(e => gen.index.remove(e));
        gen.edges.splice(0, gen.edges.length);
        this.graphFilter.setFilter('');
        return this.updateModel();
    }

    updateModel(): Promise<void> {
        const gen = this.graphGenerator;
        const nodes: SModelElementSchema[] = gen.nodes.filter(n => !n.hidden);
        const edges: SModelElementSchema[] = gen.edges.filter(e => {
            const source = gen.index.getById(e.sourceId);
            if (isNode(source) && source.hidden)
                return false;
            const target = gen.index.getById(e.targetId);
            if (isNode(target) && target.hidden)
                return false;
            return true;
        });
        this.currentRoot.children = nodes.concat(edges);
        return super.updateModel();
    }

    handle(action: Action): void {
        switch (action.kind) {
            case SelectCommand.KIND:
                this.handleSelect(action as SelectAction);
                break;
            case SelectAllCommand.KIND:
                this.handleSelectAll(action as SelectAllAction);
                break;
            default:
                super.handle(action);
        }
    }

    protected handleSelect(action: SelectAction) {
        const nodes: DependencyGraphNodeSchema[] = [];
        action.selectedElementsIDs.forEach(id => {
            const element = this.graphGenerator.index.getById(id);
            if (element && element.type === 'node')
                nodes.push(element as DependencyGraphNodeSchema);
        });
        if (nodes.length > 0) {
            this.resolveNodes(nodes);
        }
    }

    protected handleSelectAll(action: SelectAllAction) {
        if (action.select) {
            const nodes: DependencyGraphNodeSchema[] = [];
            this.graphGenerator.index.all().forEach(element => {
                if (element.type === 'node')
                    nodes.push(element as DependencyGraphNodeSchema);
            });
            if (nodes.length > 0) {
                this.resolveNodes(nodes);
            }
        }
    }

}
