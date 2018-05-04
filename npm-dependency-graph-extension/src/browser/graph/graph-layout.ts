/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ELK, ElkNode, ElkGraphElement, ElkEdge, ElkLabel, ElkShape, ElkPrimitiveEdge } from 'elkjs';
import { SGraphSchema, SModelIndex, SModelElementSchema, SNodeSchema, SShapeElementSchema, SEdgeSchema, SLabelSchema, Point } from 'sprotty/lib';

export function elkLayout(graph: SGraphSchema, index: SModelIndex<SModelElementSchema>): Promise<void> {
    return new Promise((resolve, reject) => {
        const elkGraph = transformToElk(graph) as ElkNode;
        const elk = new ELK()
        elk.layout(elkGraph)
            .then(() => {
                applyLayout(elkGraph, index);
                resolve();
            })
            .catch(error => reject(error));
    });
}

function transformToElk(smodel: SModelElementSchema): ElkGraphElement {
    switch (smodel.type) {
        case 'graph': {
            const sgraph = smodel as SGraphSchema;
            return <ElkNode>{
                id: sgraph.id,
                children: sgraph.children.filter(c => c.type === 'node').map(c => transformToElk(c)) as ElkNode[],
                edges: sgraph.children.filter(c => c.type === 'edge').map(c => transformToElk(c)) as ElkEdge[]
            };
        }
        case 'node': {
            const snode = smodel as SNodeSchema;
            const elkNode: ElkNode = { id: snode.id };
            if (snode.children) {
                elkNode.children = snode.children.filter(c => c.type === 'node').map(c => transformToElk(c)) as ElkNode[];
                elkNode.edges = snode.children.filter(c => c.type === 'edge').map(c => transformToElk(c)) as ElkEdge[];
                elkNode.labels = snode.children.filter(c => c.type === 'label').map(c => transformToElk(c)) as ElkLabel[];
            }
            transformShape(elkNode, snode);
            return elkNode;
        }
        case 'edge': {
            const sedge = smodel as SEdgeSchema;
            const elkEdge: ElkPrimitiveEdge = {
                id: sedge.id,
                source: sedge.sourceId,
                target: sedge.targetId
            };
            if (sedge.children) {
                elkEdge.labels = sedge.children.filter(c => c.type === 'label').map(c => transformToElk(c)) as ElkLabel[];
            }
            const points = sedge.routingPoints;
            if (points && points.length >= 2) {
                elkEdge.sourcePoint = points[0];
                elkEdge.bendPoints = points.slice(1, points.length - 1);
                elkEdge.targetPoint = points[points.length - 1];
            }
            return elkEdge;
        }
        case 'label': {
            const slabel = smodel as SLabelSchema;
            const elkLabel: ElkLabel = { id: slabel.id, text: slabel.text };
            transformShape(elkLabel, slabel);
            return elkLabel;
        }
        default:
            throw new Error('Type not supported: ' + smodel.type);
    }
}

function transformShape(elkShape: ElkShape, sshape: SShapeElementSchema): void {
    if (sshape.position) {
        elkShape.x = sshape.position.x;
        elkShape.y = sshape.position.y;
    }
    if (sshape.size) {
        elkShape.width = sshape.size.width;
        elkShape.height = sshape.size.height;
    }
}

function applyLayout(elkNode: ElkNode, index: SModelIndex<SModelElementSchema>): void {
    const snode = index.getById(elkNode.id);
    if (snode && snode.type === 'node') {
        applyShape(snode as SNodeSchema, elkNode);
    }
    if (elkNode.children) {
        for (const child of elkNode.children) {
            applyLayout(child, index);
        }
    }
    if (elkNode.edges) {
        for (const elkEdge of elkNode.edges) {
            const sedge = index.getById(elkEdge.id);
            if (sedge && sedge.type === 'edge') {
                applyEdge(sedge as SEdgeSchema, elkEdge as ElkPrimitiveEdge);
            }
        }
    }
    if (elkNode.labels) {
        for (const elkLabel of elkNode.labels) {
            const slabel = index.getById(elkLabel.id);
            if (slabel && slabel.type === 'label') {
                applyShape(slabel as SLabelSchema, elkLabel);
            }
        }
    }
}

function applyShape(sshape: SShapeElementSchema, elkShape: ElkShape): void {
    if (elkShape.x !== undefined && elkShape.y !== undefined)
        sshape.position = { x: elkShape.x, y: elkShape.y };
    if (elkShape.width !== undefined && elkShape.height !== undefined)
        sshape.size = { width: elkShape.width, height: elkShape.height };
}

function applyEdge(sedge: SEdgeSchema, elkEdge: ElkPrimitiveEdge): void {
    const points: Point[] = [];
    if (elkEdge.sourcePoint)
        points.push(elkEdge.sourcePoint);
    if (elkEdge.bendPoints)
        points.push(...elkEdge.bendPoints);
    if (elkEdge.targetPoint)
        points.push(elkEdge.targetPoint);
    sedge.routingPoints = points;
}
