/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject, Container } from "inversify";
import { FileSystem } from "@theia/filesystem/lib/common";
import { StatusBar, StatusBarAlignment } from "@theia/core/lib/browser";
import { overrideViewerOptions, KeyTool, TYPES } from "sprotty/lib";
import { DiagramConfiguration, TheiaKeyTool } from "theia-sprotty/lib";
import { DepGraphModelSource } from "../graph/model-source";
import { IGraphGenerator } from "../graph/graph-generator";
import { ElkFactory } from "../graph/graph-layout";
import { NodeModulesGraphGenerator } from "./node-modules";
import containerFactory from '../graph/graph-sprotty-config';
import elkFactory from '../graph/elk-bundled';

@injectable()
export class DepGraphDiagramConfiguration implements DiagramConfiguration {

    @inject(FileSystem) protected readonly fileSystem!: FileSystem;
    @inject(StatusBar) protected readonly statusBar!: StatusBar;

    readonly diagramType: string = 'dependency-graph';

    createContainer(widgetId: string): Container {
        const container = containerFactory((bind, unbind, isBound, rebind) => {
            bind(ElkFactory).toConstantValue(elkFactory);
            rebind(IGraphGenerator).to(NodeModulesGraphGenerator).inSingletonScope();
        });
        container.rebind(KeyTool).to(TheiaKeyTool).inSingletonScope();
        overrideViewerOptions(container, {
            baseDiv: widgetId
        });

        const graphGenerator = container.get<NodeModulesGraphGenerator>(IGraphGenerator);
        graphGenerator.fileSystem = this.fileSystem;
        graphGenerator.registryUrl = 'npm-registry';

        const modelSource = container.get<DepGraphModelSource>(TYPES.ModelSource);
        modelSource.loadIndicator = loading => {
            if (loading) {
                this.statusBar.setElement(widgetId + '_loadIndicator', {
                    text: '$(spinner~spin)',
                    tooltip: 'Loading package dependencies...',
                    alignment: StatusBarAlignment.RIGHT
                });
            } else {
                this.statusBar.removeElement(widgetId + '_loadIndicator');
            }
        };
        modelSource.start();

        return container;
    }
}
