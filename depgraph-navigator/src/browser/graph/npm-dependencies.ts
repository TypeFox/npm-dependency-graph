/*
 * Copyright (C) 2018 TypeFox
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import { maxSatisfying } from 'semver';
import { SModelIndex, SModelElementSchema, SLabelSchema } from 'sprotty';
import { IGraphGenerator } from './graph-generator';
import { DependencyGraphNodeSchema, DependencyGraphEdgeSchema } from './graph-model';
import { PackageMetadata, VersionMetadata } from './registry-metadata';

export const REGISTRY_URL = 'https://registry.npmjs.org';
export const WEBSITE_URL = 'https://www.npmjs.com';

@injectable()
export class NpmDependencyGraphGenerator implements IGraphGenerator {

    registryUrl = REGISTRY_URL;
    websiteUrl = WEBSITE_URL;

    readonly nodes: DependencyGraphNodeSchema[] = [];
    readonly edges: DependencyGraphEdgeSchema[] = [];
    readonly index = new SModelIndex<SModelElementSchema>();

    generateNode(name: string, requiredVersion?: string): DependencyGraphNodeSchema {
        let node = this.index.getById(name) as DependencyGraphNodeSchema;
        if (node === undefined) {
            node = this.createNode(name);
            this.nodes.push(node);
            this.index.add(node);
        }
        if (requiredVersion && node.requiredVersions.indexOf(requiredVersion) < 0) {
            node.requiredVersions.push(requiredVersion);
        }
        return node;
    }

    protected createNode(name: string): DependencyGraphNodeSchema {
        return {
            type: 'node',
            id: name,
            name,
            requiredVersions: [],
            layout: 'vbox',
            children: [
                <SLabelSchema>{
                    type: 'label',
                    id: `${name}/label`,
                    text: name
                }
            ]
        };
    }

    toggleResolveNode(node: DependencyGraphNodeSchema): Promise<DependencyGraphNodeSchema[]> {
        if (node.resolved) {
            this.unresolveNode(node);
            return Promise.resolve([]);
        } else {
            return this.resolveNode(node);
        }
    }

    unresolveNode(node: DependencyGraphNodeSchema): void {
        const removeEdges = (nodeId:string) => {
            this.edges
                .filter(({ sourceId }) => sourceId === nodeId)
                .map(({ targetId }) => targetId)
                .forEach(removeEdges);

            for (var i = 0; i < this.edges.length;) {
                if (this.edges[i].sourceId === nodeId) {
                    this.index.remove(this.edges[i]);
                    this.edges.splice(i, 1);
                } else {
                    ++i;
                }
            }
        }

        removeEdges(node.id);

        const nodeIdsWithEdges = [
          ...this.edges.map(({ sourceId }) => sourceId),
          ...this.edges.map(({ targetId }) => targetId),
        ];
        for (var i = 0; i < this.nodes.length;) {
            if (!nodeIdsWithEdges.includes(this.nodes[i].id)) {
                this.index.remove(this.nodes[i]);
                this.nodes.splice(i, 1);
            } else {
                ++i;
            }
        }

        node.resolved = false;
    }

    resolveNode(node: DependencyGraphNodeSchema): Promise<DependencyGraphNodeSchema[]> {
        return this.getMetadata(node).then(versionData => {
            const result: DependencyGraphNodeSchema[] = [];
            if (versionData) {
                node.version = versionData.version;
                node.description = versionData.description;
                node.url = `${this.websiteUrl}/package/${node.name}`;
                if (versionData.dependencies)
                    result.push(...this.addDependencies(node, versionData.dependencies));
                if (versionData.optionalDependencies)
                    result.push(...this.addDependencies(node, versionData.optionalDependencies, true));
                if (versionData.peerDependencies)
                    result.push(...this.addDependencies(node, versionData.peerDependencies, true));
                node.resolved = true;
            }
            return result;
        });
    }

    protected async getMetadata(node: DependencyGraphNodeSchema): Promise<VersionMetadata> {
        const nameUrlComponent = node.name.replace(/\//g, '%2F');
        const path = `${this.registryUrl}/${nameUrlComponent}`;
        const data = await this.request(path);
        const versionData = this.findVersion(node, data);
        if (versionData)
            return versionData;
        else
            return Promise.reject(new Error(`No matching versions found for ${node.name}: ${node.requiredVersions}`));
    }

    protected request(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            const errorHandler = () => {
                let message = `Could not load package metadata from ${url}`;
                if (xhr.statusText)
                    message += ` (${xhr.statusText})`
                reject(new Error(message));
            };
            xhr.addEventListener('load', () => {
                if (xhr.status === 200)
                    resolve(JSON.parse(xhr.responseText));
                else
                    errorHandler();
            });
            xhr.addEventListener('error', errorHandler);
            xhr.send();
        });
    }

    protected findVersion(node: DependencyGraphNodeSchema, data: PackageMetadata): VersionMetadata | undefined {
        for (let i = 0; i < node.requiredVersions.length; i++) {
            const match = maxSatisfying(Object.keys(data.versions), node.requiredVersions[i]);
            if (match)
                return data.versions[match];
        }
        const latest = data['dist-tags']['latest'];
        if (latest)
            return data.versions[latest];
        return undefined;
    }

    addDependencies(node: DependencyGraphNodeSchema, dependencies: { [dep: string]: string }, optional?: boolean): DependencyGraphNodeSchema[] {
        const targetNodes: DependencyGraphNodeSchema[] = [];
        for (const dep in dependencies) {
            const depNode = this.generateNode(dep, dependencies[dep]);
            const depEdge: DependencyGraphEdgeSchema = {
                type: 'edge',
                id: `dependency:${node.name}>${dep}`,
                optional,
                sourceId: node.id,
                targetId: depNode.id,
                children: [
                    <SLabelSchema> {
                        type: 'label',
                        id: `dependency_version:${node.name}>${dep}`,
                        text: dependencies[dep],
                        edgePlacement: {
                            position: 1,
                            offset: 4,
                            side: 'bottom',
                            rotate: true
                        }
                    }
                ]
            };
            if (!this.index.contains(depEdge)) {
                this.edges.push(depEdge);
                this.index.add(depEdge);
                targetNodes.push(depNode);
            }
        }
        return targetNodes;
    }

}
