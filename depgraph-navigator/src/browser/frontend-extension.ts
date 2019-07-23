/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from 'inversify';
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { FrontendApplicationContribution, OpenHandler, KeybindingContribution, KeybindingContext, WidgetFactory } from '@theia/core/lib/browser';
import { DiagramConfiguration, DiagramManagerProvider, DiagramManager } from 'sprotty-theia';
import { DepGraphDiagramConfiguration } from './widget/diagram-config';
import { DepGraphDiagramManager } from './widget/diagram-manager';
import { DiagramCommandContribution, DepgraphKeybindingContext } from './widget/diagram-commands';

import 'sprotty/css/sprotty.css';
import 'sprotty-theia/css/theia-sprotty.css';
import '../../src/browser/style/depgraph.css';

export default new ContainerModule(bind => {
    bind(DiagramConfiguration).to(DepGraphDiagramConfiguration).inSingletonScope();
    bind(DepGraphDiagramManager).toSelf().inSingletonScope();
    bind(DiagramManagerProvider).toProvider<DiagramManager>(context => {
        return () => Promise.resolve(context.container.get(DepGraphDiagramManager));
    }).whenTargetNamed('dependency-graph');
    bind(FrontendApplicationContribution).toService(DepGraphDiagramManager);
    bind(OpenHandler).toService(DepGraphDiagramManager);
    bind(WidgetFactory).toService(DepGraphDiagramManager);
    bind(DepgraphKeybindingContext).toSelf().inSingletonScope();
    bind(KeybindingContext).toService(DepgraphKeybindingContext);
    bind(DiagramCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DiagramCommandContribution);
    bind(KeybindingContribution).toService(DiagramCommandContribution);
    bind(MenuContribution).toService(DiagramCommandContribution);
});
