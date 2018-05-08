/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import * as snabbdom from 'snabbdom-jsx';
import { VNode } from "snabbdom/vnode";
import { IView, RenderingContext, PolylineEdgeView, Point, toDegrees, angleOfPoint } from "sprotty/lib";
import { DependencyGraphNode, DependencyGraphEdge } from './graph-model';

const JSX = {createElement: snabbdom.svg};

export class DependencyNodeView implements IView {
    cornerRadius = 5;

    render(node: Readonly<DependencyGraphNode>, context: RenderingContext): VNode {
        return <g>
            <rect class-sprotty-node={true}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  class-resolved={node.resolved} class-error={node.error !== undefined}
                  x="0" y="0" rx={this.cornerRadius} ry={this.cornerRadius}
                  width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

export class DependencyEdgeView extends PolylineEdgeView {
    render(edge: Readonly<DependencyGraphEdge>, context: RenderingContext): VNode {
        const route = edge.route();
        if (route.length === 0)
            return this.renderDanglingEdge("Cannot compute route", edge, context);

        return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}
                  class-optional={edge.optional}>
            {this.renderLine(edge, route, context)}
            {this.renderAdditionals(edge, route, context)}
            {context.renderChildren(edge, { route })}
        </g>;
    }

    protected renderAdditionals(edge: DependencyGraphEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-arrow={true} d="M -1.5,0 L 10,-4 L 10,4 Z"
                  transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }
}
