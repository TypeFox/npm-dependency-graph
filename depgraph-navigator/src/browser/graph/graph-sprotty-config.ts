/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule, Container } from 'inversify';
import {
    TYPES, ConsoleLogger, LogLevel, SGraphFactory, configureModelElement, SGraph,
    SGraphView, HtmlRoot, HtmlRootView, PreRenderedElement, PreRenderedView, SLabel,
    SLabelView, SCompartment, SCompartmentView, defaultModule, selectModule,
    moveModule, boundsModule, fadeModule, viewportModule, exportModule, hoverModule,
    ActionHandlerRegistry, SelectCommand, edgeEditModule, SelectAllCommand
} from 'sprotty/lib';
import { DependencyGraphNode, DependencyGraphEdge } from './graph-model';
import { IGraphGenerator } from './graph-generator';
import { DepGraphModelSource } from './model-source';
import { NpmDependencyGraphGenerator } from './npm-dependencies';
import { ResolveNodesHandler } from './resolve-nodes';
import { DependencyNodeView, DependencyEdgeView } from './graph-views';
import { popupModelFactory } from './popup-info';
import { ElkGraphLayout, ElkFactory } from './graph-layout';

export interface ContainerFactoryArguments {
    elkFactory: ElkFactory
    graphGenerator?: { new(...args: any[]): IGraphGenerator }
}

export default (args: ContainerFactoryArguments) => {
    const depGraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        bind(ResolveNodesHandler).toSelf();
        bind(ElkFactory).toConstantValue(args.elkFactory);
        bind(ElkGraphLayout).toSelf();
        bind(IGraphGenerator).to(args.graphGenerator || NpmDependencyGraphGenerator).inSingletonScope();
        bind(TYPES.ModelSource).to(DepGraphModelSource).inSingletonScope();
        bind(TYPES.PopupModelFactory).toConstantValue(popupModelFactory);
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
        rebind(TYPES.IModelFactory).to(SGraphFactory).inSingletonScope();
        const context = { bind, unbind, isBound, rebind };
        configureModelElement(context, 'graph', SGraph, SGraphView);
        configureModelElement(context, 'node', DependencyGraphNode, DependencyNodeView);
        configureModelElement(context, 'edge', DependencyGraphEdge, DependencyEdgeView);
        configureModelElement(context, 'label', SLabel, SLabelView);
        configureModelElement(context, 'compartment', SCompartment, SCompartmentView);
        configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    });

    const container = new Container();
    container.load(defaultModule, selectModule, moveModule, boundsModule, fadeModule, viewportModule,
        exportModule, hoverModule, edgeEditModule, depGraphModule);
    
    const actionHandlerRegistry = container.get<ActionHandlerRegistry>(TYPES.ActionHandlerRegistry);
    const resolveNodesHandler = container.get(ResolveNodesHandler);
    actionHandlerRegistry.register(SelectCommand.KIND, resolveNodesHandler);
    actionHandlerRegistry.register(SelectAllCommand.KIND, resolveNodesHandler);
    return container;
};
