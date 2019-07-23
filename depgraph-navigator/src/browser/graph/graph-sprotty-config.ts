/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule, Container, interfaces } from 'inversify';
import {
    TYPES, ConsoleLogger, LogLevel, SGraphFactory, configureModelElement, SGraph,
    SGraphView, HtmlRoot, HtmlRootView, PreRenderedElement, PreRenderedView, SLabel,
    SLabelView, SCompartment, SCompartmentView, defaultModule, selectModule, moveModule,
    boundsModule, fadeModule, viewportModule, exportModule, hoverModule, edgeEditModule,
    updateModule, graphModule, routingModule, edgeLayoutModule, modelSourceModule
} from 'sprotty';
import { ILayoutConfigurator, elkLayoutModule } from 'sprotty-elk';
import { DependencyGraphNode, DependencyGraphEdge } from './graph-model';
import { IGraphGenerator } from './graph-generator';
import { DepGraphModelSource } from './model-source';
import { NpmDependencyGraphGenerator } from './npm-dependencies';
import { DependencyNodeView, DependencyEdgeView } from './graph-views';
import { PopupModelProvider } from './popup-info';
import { DepGraphLayoutConfigurator } from './graph-layout';
import { DependencyGraphFilter } from './graph-filter';

export default (additionalBindings?: interfaces.ContainerModuleCallBack) => {
    const depGraphModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        bind(DependencyGraphFilter).toSelf();
        bind(IGraphGenerator).to(NpmDependencyGraphGenerator).inSingletonScope();
        bind(TYPES.ModelSource).to(DepGraphModelSource).inSingletonScope();
        rebind(ILayoutConfigurator).to(DepGraphLayoutConfigurator);
        bind(TYPES.IPopupModelProvider).to(PopupModelProvider);
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
        if (additionalBindings) {
            additionalBindings(bind, unbind, isBound, rebind);
        }
    });

    const container = new Container();
    container.load(defaultModule, graphModule, updateModule, modelSourceModule, routingModule,
        selectModule, moveModule, boundsModule, fadeModule, viewportModule, exportModule,
        hoverModule, edgeLayoutModule, edgeEditModule, elkLayoutModule, depGraphModule);
    return container;
};
