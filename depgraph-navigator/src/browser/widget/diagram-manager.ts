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
import { DiagramManagerImpl, DiagramWidget } from "theia-sprotty/lib";
import { DepGraphModelSource } from '../graph/model-source';

@injectable()
export class DepGraphDiagramManager extends DiagramManagerImpl {

    @inject(FileSystem) protected readonly fileSystem!: FileSystem;

    readonly diagramType: string = 'dependency-graph';
    
    iconClass: string = 'fa fa-arrow-circle-o-up';
    label: string = 'Dependency Graph';

    open(uri: URI, input?: OpenerOptions): Promise<DiagramWidget> {
        const promise = super.open(uri, input);
        promise.then(widget => this.createModel(uri, widget.modelSource as DepGraphModelSource));
        return promise;
    }

    protected createModel(uri: URI, modelSource: DepGraphModelSource): void {
        this.fileSystem.resolveContent(uri.toString()).then(({stat, content}) => {
            const pck = JSON.parse(content);
            const generator = modelSource.graphGenerator;
            const node = generator.generateNode(pck.name, pck.version);
            if (pck.dependencies)
                generator.addDependencies(node, pck.dependencies);
            if (pck.optionalDependencies)
                generator.addDependencies(node, pck.optionalDependencies, true);
            if (pck.peerDependencies)
                generator.addDependencies(node, pck.peerDependencies, true);
            modelSource.updateModel();
        });
    }

}
