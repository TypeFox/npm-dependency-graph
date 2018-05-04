/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { getJSON } from "jquery";
import { maxSatisfying } from "semver";
import { SGraphSchema, SModelIndex, SModelElementSchema } from "sprotty/lib";
import { PackageNode, PackageDependency } from "./graph-model";
import { PackageMetadata, VersionMetadata } from "./registry-metadata";

const REGISTRY_URL = 'https://registry.npmjs.org';

export class DependencyGraphGenerator {

    registryUrl = REGISTRY_URL;

    readonly graph: SGraphSchema = {
        type: 'graph',
        id: 'npm-dependency-graph',
        children: []
    };

    readonly index = new SModelIndex<SModelElementSchema>();

    generateNode(name: string, version?: string): PackageNode {
        let node = this.index.getById(name) as PackageNode;
        if (node === undefined) {
            node = {
                type: 'node',
                id: name,
                name,
                versions: []
            };
            this.graph.children.push(node);
            this.index.add(node);
        }
        if (version && node.versions.indexOf(version) < 0) {
            node.versions.push(version);
        }
        return node;
    }

    resolveNode(node: PackageNode): Promise<SGraphSchema> {
        return new Promise((resolve, reject) => {
            const path = `${this.registryUrl}/${node.name.replace(/\//g, '%2F')}`;
            const xhr = getJSON(path);
            xhr.done((data: PackageMetadata) => {
                const versionData = this.findVersion(node, data);
                if (versionData) {
                    if (versionData.dependencies)
                        this.addDependencies(node, versionData.dependencies);
                    if (versionData.optionalDependencies)
                        this.addDependencies(node, versionData.optionalDependencies, true);
                    node.resolved = true;
                }
                resolve(this.graph);
            });
            xhr.fail((jqXHR, textStatus, errorThrown) => {
                reject(textStatus);
            });
        });
    }

    private findVersion(node: PackageNode, data: PackageMetadata): VersionMetadata | undefined {
        for (let i = 0; i < node.versions.length; i++) {
            const match = maxSatisfying(Object.keys(data.versions), node.versions[i]);
            if (match)
                return data.versions[match];
        }
        const latest = data['dist-tags']['latest'];
        if (latest)
            return data.versions[latest];
        return undefined;
    }

    private addDependencies(node: PackageNode, dependencies: { [dep: string]: string }, optional?: boolean): void {
        for (const dep in dependencies) {
            const depNode = this.generateNode(dep, dependencies[dep]);
            const depEdge: PackageDependency = {
                type: 'edge',
                id: `dependency:${node.name}>${dep}`,
                optional,
                sourceId: node.id,
                targetId: depNode.id
            };
            this.graph.children.push(depEdge);
            this.index.add(depEdge);
        }
    }

}
