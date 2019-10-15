/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { WidgetOpenerOptions } from '@theia/core/lib/browser';
import { FileSystem } from '@theia/filesystem/lib/common';
import { DiagramManager, DiagramWidget } from 'sprotty-theia';
import { NodeModulesGraphGenerator } from './node-modules';
import { DepGraphWidget } from './diagram-widget';

@injectable()
export class DepGraphDiagramManager extends DiagramManager {
    
    @inject(FileSystem) protected readonly fileSystem!: FileSystem;

    readonly diagramType: string = 'dependency-graph';
    
    iconClass: string = 'fa fa-arrow-circle-o-up';
    label: string = 'Dependency Graph';

    canHandle(uri: URI, options?: WidgetOpenerOptions | undefined): number {
        if (uri.path.base === 'package.json')
            return 10;
        else
            return 0;
    }

    async createWidget(options?: any): Promise<DiagramWidget> {
        const diagramWidget = await super.createWidget(options) as DepGraphWidget;
        this.createModel(new URI(options.uri), diagramWidget);
        return diagramWidget;
    }

    protected async createModel(uri: URI, diagramWidget: DepGraphWidget): Promise<void> {
        await diagramWidget.attached.promise;
        const { content } = await this.fileSystem.resolveContent(uri.toString());
        const pck = JSON.parse(content);
        const modelSource = diagramWidget.modelSource;
        const generator = modelSource.graphGenerator as NodeModulesGraphGenerator;
        generator.startUri = uri;
        const node = generator.generateNode(pck.name, pck.version);
        node.description = pck.description;
        node.resolved = true;
        if (pck.dependencies)
            generator.addDependencies(node, pck.dependencies);
        if (pck.optionalDependencies)
            generator.addDependencies(node, pck.optionalDependencies, true);
        if (pck.peerDependencies)
            generator.addDependencies(node, pck.peerDependencies, true);
        await modelSource.updateModel();
        modelSource.center([node.id]);
    }

}
