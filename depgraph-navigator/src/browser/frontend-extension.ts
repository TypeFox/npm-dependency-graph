/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule, Container } from 'inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import {
    FrontendApplicationContribution, OpenHandler, KeybindingContribution, KeybindingContext, WidgetFactory
} from '@theia/core/lib/browser';
import { SearchBoxFactory, SearchBox, SearchBoxProps } from '@theia/core/lib/browser/tree/search-box';
import { SearchBoxDebounce } from '@theia/core/lib/browser/tree/search-box-debounce';
import {
    DiagramConfiguration, DiagramManagerProvider, DiagramManager, DiagramWidgetFactory, DiagramWidgetOptions, TheiaSprottyConnector
} from 'sprotty-theia';
import { DepGraphDiagramConfiguration } from './widget/diagram-config';
import { DepGraphDiagramManager } from './widget/diagram-manager';
import { DiagramFrontendContribution, DepgraphKeybindingContext } from './widget/diagram-frontend-contribution';
import { ColorContribution } from '@theia/core/lib/browser/color-application-contribution';
import { DepGraphWidget } from './widget/diagram-widget';

import 'sprotty/css/sprotty.css';
import 'sprotty-theia/css/theia-sprotty.css';
import '../../src/browser/style/depgraph.css';

export default new ContainerModule(bind => {
    bind(DiagramConfiguration).to(DepGraphDiagramConfiguration).inSingletonScope();
    bind(DepGraphDiagramManager).toDynamicValue(context => {
        const childContainer = new Container();
        childContainer.parent = context.container;
        childContainer.bind(DiagramWidgetFactory).toFactory(_ => {
            return (options: DiagramWidgetOptions, widgetId: string, diContainer: Container, connector?: TheiaSprottyConnector) =>
                new DepGraphWidget(options, createSearchBox, widgetId, diContainer, connector);
        });
        return childContainer.resolve(DepGraphDiagramManager);
    }).inSingletonScope();
    bind(DiagramManagerProvider).toProvider<DiagramManager>(context => {
        return () => Promise.resolve(context.container.get(DepGraphDiagramManager));
    }).whenTargetNamed('dependency-graph');
    bind(FrontendApplicationContribution).toService(DepGraphDiagramManager);
    bind(OpenHandler).toService(DepGraphDiagramManager);
    bind(WidgetFactory).toService(DepGraphDiagramManager);
    bind(DepgraphKeybindingContext).toSelf().inSingletonScope();
    bind(KeybindingContext).toService(DepgraphKeybindingContext);
    bind(DiagramFrontendContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DiagramFrontendContribution);
    bind(KeybindingContribution).toService(DiagramFrontendContribution);
    bind(MenuContribution).toService(DiagramFrontendContribution);
    bind(ColorContribution).toService(DiagramFrontendContribution);
});

export const createSearchBox: SearchBoxFactory = (props: SearchBoxProps) => {
    const debounce = new SearchBoxDebounce({ delay: 300 });
    return new SearchBox(props, debounce);
};
