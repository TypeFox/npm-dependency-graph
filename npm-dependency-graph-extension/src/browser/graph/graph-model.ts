/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { RectangularNode, moveFeature, SEdge, editFeature, SNodeSchema, SEdgeSchema } from "sprotty/lib";

export interface PackageNode extends SNodeSchema {
    name: string
    versions: string[]
    description?: string
    resolved?: boolean
}

export class DependencyGraphNode extends RectangularNode {
    name: string = '';
    versions: string[] = [];
    description?: string;
    resolved: boolean = false;

    hasFeature(feature: symbol): boolean {
        if (feature === moveFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}

export interface PackageDependency extends SEdgeSchema {
    optional?: boolean
}

export class DependencyGraphEdge extends SEdge {
    hasFeature(feature: symbol): boolean {
        if (feature === editFeature)
            return false;
        else
            return super.hasFeature(feature);
    }
}
