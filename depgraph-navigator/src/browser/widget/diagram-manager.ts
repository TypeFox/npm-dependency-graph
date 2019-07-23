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
import { WidgetOpenerOptions, Widget } from '@theia/core/lib/browser';
import { SearchBoxFactory, SearchBoxProps, SearchBox } from '@theia/core/lib/browser/tree/search-box';
import { FileSystem } from '@theia/filesystem/lib/common';
import { DiagramManager, DiagramWidgetOptions } from 'sprotty-theia';
import { DepGraphModelSource } from '../graph/model-source';
import { NodeModulesGraphGenerator } from './node-modules';
import { DepGraphWidget } from './diagram-widget';
import { SearchBoxDebounce } from '@theia/core/lib/browser/tree/search-box-debounce';

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

    async createWidget(options?: any): Promise<Widget> {
        if (DiagramWidgetOptions.is(options)) {
            const clientId = this.createClientId();
            const config = this.diagramConfigurationRegistry.get(options.diagramType);
            const diContainer = config.createContainer(clientId + '_sprotty');
            const diagramWidget = new DepGraphWidget(options, createSearchBox, clientId, diContainer, this.diagramConnector);
            this.createModel(new URI(options.uri), diagramWidget.modelSource);
            return diagramWidget;
        }
        throw Error('DiagramWidgetFactory needs DiagramWidgetOptions but got ' + JSON.stringify(options));
    }

    protected async createModel(uri: URI, modelSource: DepGraphModelSource): Promise<void> {
        // Workaround for https://github.com/theia-ide/sprotty/issues/218
        await animationFrames(4);

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

export const createSearchBox: SearchBoxFactory = (props: SearchBoxProps) => {
    const debounce = new SearchBoxDebounce({ delay: 300 });
    return new SearchBox(props, debounce);
};
