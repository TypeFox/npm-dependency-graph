/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, Container } from "inversify";
import { overrideViewerOptions, KeyTool, TYPES } from "sprotty/lib";
import { DiagramConfiguration, TheiaKeyTool } from "theia-sprotty/lib";
import containerFactory from '../graph/graph-sprotty-config';
import { DepGraphModelSource } from "../graph/model-source";
import elkFactory from '../graph/elk-bundled';

@injectable()
export class DepGraphDiagramConfiguration implements DiagramConfiguration {

    readonly diagramType: string = 'dependency-graph';

    createContainer(widgetId: string): Container {
        const container = containerFactory({ elkFactory });
        container.rebind(KeyTool).to(TheiaKeyTool).inSingletonScope();
        overrideViewerOptions(container, {
            baseDiv: widgetId
        });
        const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
        modelSource.start();
        return container;
    }
}
