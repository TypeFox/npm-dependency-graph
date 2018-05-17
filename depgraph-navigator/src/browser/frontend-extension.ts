/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { CommandContribution, MenuContribution } from '@theia/core/lib/common';
import { FrontendApplicationContribution, OpenHandler, KeybindingContribution, KeybindingContext } from "@theia/core/lib/browser";
import { DiagramConfiguration, DiagramManagerProvider, DiagramManager } from "theia-sprotty/lib";
import { DepGraphDiagramConfiguration } from "./widget/diagram-config";
import { DepGraphDiagramManager } from "./widget/diagram-manager";
import { DiagramCommandContribution, DepgraphKeybindingContext } from "./widget/diagram-commands";

import 'sprotty/css/sprotty.css';
import 'theia-sprotty/css/theia-sprotty.css';
import '../../src/browser/style/depgraph.css';

export default new ContainerModule(bind => {
    bind(DiagramConfiguration).to(DepGraphDiagramConfiguration).inSingletonScope();
    bind(DepGraphDiagramManager).toSelf().inSingletonScope();
    bind(DiagramManagerProvider).toProvider<DiagramManager>(context => {
        return () => Promise.resolve(context.container.get(DepGraphDiagramManager));
    }).whenTargetNamed('dependency-graph');
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(DepGraphDiagramManager));
    bind(OpenHandler).toDynamicValue(context => context.container.get(DepGraphDiagramManager));
    bind(DepgraphKeybindingContext).toSelf().inSingletonScope();
    bind(KeybindingContext).toDynamicValue(context => context.container.get(DepgraphKeybindingContext));
    bind(DiagramCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toDynamicValue(context => context.container.get(DiagramCommandContribution));
    bind(KeybindingContribution).toDynamicValue(context => context.container.get(DiagramCommandContribution));
    bind(MenuContribution).toDynamicValue(context => context.container.get(DiagramCommandContribution));
});
