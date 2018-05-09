/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from "inversify";
import { maxSatisfying } from "semver";
import { SGraphSchema, SModelIndex, SModelElementSchema, SLabelSchema } from "sprotty/lib";
import { IGraphGenerator } from "./graph-generator";
import { DependencyGraphNodeSchema, DependencyGraphEdgeSchema } from "./graph-model";
import { PackageMetadata, VersionMetadata } from "./registry-metadata";

export const REGISTRY_URL = 'https://registry.npmjs.org';
export const WEBSITE_URL = 'https://www.npmjs.com';

@injectable()
export class NpmDependencyGraphGenerator implements IGraphGenerator {

    registryUrl = REGISTRY_URL;
    websiteUrl = WEBSITE_URL;

    readonly graph: SGraphSchema = {
        type: 'graph',
        id: 'npm-dependency-graph',
        children: []
    };

    readonly index = new SModelIndex<SModelElementSchema>();

    generateNode(name: string, version?: string): DependencyGraphNodeSchema {
        let node = this.index.getById(name) as DependencyGraphNodeSchema;
        if (node === undefined) {
            node = this.createNode(name);
            this.graph.children.push(node);
            this.index.add(node);
        }
        if (version && node.versions.indexOf(version) < 0) {
            node.versions.push(version);
        }
        return node;
    }

    protected createNode(name: string): DependencyGraphNodeSchema {
        return {
            type: 'node',
            id: name,
            name,
            versions: [],
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

    resolveNode(node: DependencyGraphNodeSchema): Promise<SGraphSchema> {
        if (node.resolved) {
            return Promise.resolve(this.graph);
        }
        const nameUrlComponent = node.name.replace(/\//g, '%2F');
        const path = `${this.registryUrl}/${nameUrlComponent}`;
        return this.request(path).then((data: PackageMetadata) => {
            node.description = data.description;
            node.url = `${this.websiteUrl}/package/${nameUrlComponent}`;
            const versionData = this.findVersion(node, data);
            if (versionData) {
                if (versionData.dependencies)
                    this.addDependencies(node, versionData.dependencies);
                if (versionData.optionalDependencies)
                    this.addDependencies(node, versionData.optionalDependencies, true);
                if (versionData.peerDependencies)
                    this.addDependencies(node, versionData.peerDependencies, true);
                node.resolved = true;
            }
            return this.graph;
        });
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

    addDependencies(node: DependencyGraphNodeSchema, dependencies: { [dep: string]: string }, optional?: boolean): void {
        for (const dep in dependencies) {
            const depNode = this.generateNode(dep, dependencies[dep]);
            const depEdge: DependencyGraphEdgeSchema = {
                type: 'edge',
                id: `dependency:${node.name}>${dep}`,
                optional,
                sourceId: node.id,
                targetId: depNode.id
            };
            if (!this.index.contains(depEdge)) {
                this.graph.children.push(depEdge);
                this.index.add(depEdge);
            }
        }
    }

}
