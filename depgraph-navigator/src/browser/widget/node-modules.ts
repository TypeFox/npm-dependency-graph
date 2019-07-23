/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { Path } from '@theia/core/lib/common';
import { FileSystem } from '@theia/filesystem/lib/common';
import { DependencyGraphNodeSchema } from '../graph/graph-model';
import { VersionMetadata } from '../graph/registry-metadata';
import { NpmDependencyGraphGenerator } from '../graph/npm-dependencies';

@injectable()
export class NodeModulesGraphGenerator extends NpmDependencyGraphGenerator {

    fileSystem?: FileSystem;
    startUri?: URI;

    protected async getMetadata(node: DependencyGraphNodeSchema): Promise<VersionMetadata> {
        const startUri = this.startUri;
        if (this.fileSystem && startUri) {
            const segs = startUri.path.toString().split(Path.separator);
            while (segs.length > 0 && segs[segs.length - 1] && segs[segs.length - 1] !== '..') {
                segs.splice(segs.length - 1, 1);
                const packageUri = startUri.withPath(`${segs.join('/')}/node_modules/${node.name}/package.json`);
                if (await this.fileSystem.exists(packageUri.toString())) {
                    try {
                        const { content } = await this.fileSystem.resolveContent(packageUri.toString());
                        return JSON.parse(content);
                    } catch {
                        // Try the parent directory
                    }
                }
            }
        }
        // Fall back to the remote package registry
        return super.getMetadata(node);
    }

}
