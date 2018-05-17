/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { SGraphSchema, SModelIndex, SModelElementSchema } from "sprotty/lib";
import { DependencyGraphNodeSchema } from "./graph-model";

export interface IGraphGenerator {

    readonly graph: SGraphSchema
    readonly index: SModelIndex<SModelElementSchema>

    generateNode(name: string, version?: string): DependencyGraphNodeSchema;

    resolveNode(node: DependencyGraphNodeSchema): Promise<DependencyGraphNodeSchema[]>;

    addDependencies(node: DependencyGraphNodeSchema, dependencies: { [dep: string]: string }, optional?: boolean): DependencyGraphNodeSchema[];

}

export const IGraphGenerator = Symbol('IGraphGenerator');
