/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    RectangularNode, moveFeature, SEdge, editFeature, SNodeSchema, SEdgeSchema, SModelElementSchema
} from "sprotty/lib";

export interface DependencyGraphNodeSchema extends SNodeSchema {
    name: string
    versions: string[]
    resolved?: boolean
    hidden?: boolean
    description?: string
    url?: string
    error?: string
}

export function isNode(element?: SModelElementSchema): element is DependencyGraphNodeSchema {
    return element !== undefined && element.type === 'node';
}

export class DependencyGraphNode extends RectangularNode {
    name: string = '';
    versions: string[] = [];
    resolved: boolean = false;
    hidden: boolean = false;
    description?: string;
    url?: string;
    error?: string;

    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}

export interface DependencyGraphEdgeSchema extends SEdgeSchema {
    optional?: boolean
}

export function isEdge(element?: SModelElementSchema): element is DependencyGraphEdgeSchema {
    return element !== undefined && element.type === 'edge';
}

export class DependencyGraphEdge extends SEdge {
    optional: boolean = false;

    constructor() {
        super();
        this.sourceAnchorCorrection = 1;
        this.targetAnchorCorrection = 1.5;
    }

    hasFeature(feature: symbol): boolean {
        if (feature === editFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}
