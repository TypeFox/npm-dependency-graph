/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import ElkFactory, {
    ELK, ElkNode, ElkGraphElement, ElkEdge, ElkLabel, ElkShape, ElkPrimitiveEdge, ElkExtendedEdge,
    LayoutOptions
}from 'elkjs/lib/elk-api';
import {
    SGraphSchema, SModelIndex, SModelElementSchema, SNodeSchema, SShapeElementSchema, SEdgeSchema,
    SLabelSchema, Point
} from 'sprotty/lib';

@injectable()
export class ElkGraphLayout {

    protected readonly elk: ELK = new ElkFactory({
        workerUrl: 'elk/elk-worker.min.js',
        algorithms: ['layered']
    });

    layout(graph: SGraphSchema, index: SModelIndex<SModelElementSchema>): Promise<void> {
        const elkGraph = this.transformToElk(graph) as ElkNode;
        return this.elk.layout(elkGraph).then(result => this.applyLayout(result, index));
    }

    protected transformToElk(smodel: SModelElementSchema): ElkGraphElement {
        switch (smodel.type) {
            case 'graph': {
                const sgraph = smodel as SGraphSchema;
                return <ElkNode>{
                    id: sgraph.id,
                    layoutOptions: this.graphOptions(sgraph),
                    children: sgraph.children.filter(c => c.type === 'node').map(c => this.transformToElk(c)) as ElkNode[],
                    edges: sgraph.children.filter(c => c.type === 'edge').map(c => this.transformToElk(c)) as ElkEdge[]
                };
            }
            case 'node': {
                const snode = smodel as SNodeSchema;
                const elkNode: ElkNode = { id: snode.id };
                if (snode.children) {
                    elkNode.children = snode.children.filter(c => c.type === 'node').map(c => this.transformToElk(c)) as ElkNode[];
                    elkNode.edges = snode.children.filter(c => c.type === 'edge').map(c => this.transformToElk(c)) as ElkEdge[];
                    elkNode.labels = snode.children.filter(c => c.type === 'label').map(c => this.transformToElk(c)) as ElkLabel[];
                }
                this.transformShape(elkNode, snode);
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
                    elkEdge.labels = sedge.children.filter(c => c.type === 'label').map(c => this.transformToElk(c)) as ElkLabel[];
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
                this.transformShape(elkLabel, slabel);
                return elkLabel;
            }
            default:
                throw new Error('Type not supported: ' + smodel.type);
        }
    }

    protected graphOptions(sgraph: SGraphSchema): LayoutOptions {
        return {
            'elk.algorithm': 'layered',
            'elk.direction': 'UP',
            'elk.edgeRouting': 'POLYLINE'
        }
    }

    protected transformShape(elkShape: ElkShape, sshape: SShapeElementSchema): void {
        if (sshape.position) {
            elkShape.x = sshape.position.x;
            elkShape.y = sshape.position.y;
        }
        if (sshape.size) {
            elkShape.width = sshape.size.width;
            elkShape.height = sshape.size.height;
        }
    }

    protected applyLayout(elkNode: ElkNode, index: SModelIndex<SModelElementSchema>): void {
        const snode = index.getById(elkNode.id);
        if (snode && snode.type === 'node') {
            this.applyShape(snode as SNodeSchema, elkNode);
        }
        if (elkNode.children) {
            for (const child of elkNode.children) {
                this.applyLayout(child, index);
            }
        }
        if (elkNode.edges) {
            for (const elkEdge of elkNode.edges) {
                const sedge = index.getById(elkEdge.id);
                if (sedge && sedge.type === 'edge') {
                    this.applyEdge(sedge as SEdgeSchema, elkEdge);
                }
            }
        }
        if (elkNode.labels) {
            for (const elkLabel of elkNode.labels) {
                const slabel = index.getById(elkLabel.id);
                if (slabel && slabel.type === 'label') {
                    this.applyShape(slabel as SLabelSchema, elkLabel);
                }
            }
        }
    }

    protected applyShape(sshape: SShapeElementSchema, elkShape: ElkShape): void {
        if (elkShape.x !== undefined && elkShape.y !== undefined)
            sshape.position = { x: elkShape.x, y: elkShape.y };
        if (elkShape.width !== undefined && elkShape.height !== undefined)
            sshape.size = { width: elkShape.width, height: elkShape.height };
    }

    protected applyEdge(sedge: SEdgeSchema, elkEdge: ElkEdge): void {
        const points: Point[] = [];
        if ((elkEdge as any).sections && (elkEdge as any).sections.length > 0) {
            const section = (elkEdge as ElkExtendedEdge).sections[0];
            if (section.startPoint)
                points.push(section.startPoint);
            if (section.bendPoints)
                points.push(...section.bendPoints);
            if (section.endPoint)
                points.push(section.endPoint);
        } else {
            const section = elkEdge as ElkPrimitiveEdge;
            if (section.sourcePoint)
                points.push(section.sourcePoint);
            if (section.bendPoints)
                points.push(...section.bendPoints);
            if (section.targetPoint)
                points.push(section.targetPoint);
        }
        sedge.routingPoints = points;
    }

}
