/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from "inversify";
import URI from "@theia/core/lib/common/uri";
import { OpenerOptions } from "@theia/core/lib/browser";
import { FileSystem } from "@theia/filesystem/lib/common";
import { DiagramManagerImpl, DiagramWidget, DiagramWidgetFactory } from "theia-sprotty/lib";
import { DepGraphModelSource } from '../graph/model-source';
import { NodeModulesGraphGenerator } from "./node-modules";

@injectable()
export class DepGraphDiagramManager extends DiagramManagerImpl {
    
    @inject(DiagramWidgetFactory) private readonly _diagramWidgetFactory!: DiagramWidgetFactory;
    @inject(FileSystem) protected readonly fileSystem!: FileSystem;

    readonly diagramType: string = 'dependency-graph';
    
    iconClass: string = 'fa fa-arrow-circle-o-up';
    label: string = 'Dependency Graph';

    canHandle(uri: URI, options?: OpenerOptions): number {
        if (uri.path.base === 'package.json')
            return 10;
        else
            return 0;
    }

    protected createDiagramWidget(uri: URI): DiagramWidget {
        const widget = super.createDiagramWidget(uri);
        this.createModel(uri, widget.modelSource as DepGraphModelSource);
        return widget;
    }

    protected async createModel(uri: URI, modelSource: DepGraphModelSource): Promise<void> {
        // Workaround for https://github.com/theia-ide/sprotty/issues/218
        await animationFrames(3);

        const { content } = await this.fileSystem.resolveContent(uri.toString());
        const pck = JSON.parse(content);
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

    get diagramWidgetFactory(): DiagramWidgetFactory {
        return this._diagramWidgetFactory;
    }

}

function animationFrames(number: number): Promise<void> {
    if (number < 0) {
        throw new Error('Illegal argument: ' + number);
    }
    return new Promise(resolve => {
        function recurse(n: number): void {
            if (n === 0)
                resolve();
            else
                window.requestAnimationFrame(() => recurse(n - 1));
        }
        recurse(number);
    });
}
