/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { FrontendApplicationContribution, OpenHandler } from "@theia/core/lib/browser";
import { DiagramConfiguration, DiagramManagerProvider, DiagramManager } from "theia-sprotty/lib";
import { DepGraphDiagramConfiguration } from "./widget/diagram-config";
import { DepGraphDiagramManager } from "./widget/diagram-manager";

export default new ContainerModule(bind => {
    bind(DiagramConfiguration).to(DepGraphDiagramConfiguration).inSingletonScope();
    bind(DepGraphDiagramManager).toSelf().inSingletonScope();
    bind(DiagramManagerProvider).toProvider<DiagramManager>(context => {
        return () => Promise.resolve(context.container.get(DepGraphDiagramManager));
    }).whenTargetNamed('dependency-graph');
    bind(FrontendApplicationContribution).toDynamicValue(context => context.container.get(DepGraphDiagramManager));
    bind(OpenHandler).toDynamicValue(context => context.container.get(DepGraphDiagramManager));
});
