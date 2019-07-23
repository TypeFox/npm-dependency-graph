/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import { VNode } from 'snabbdom/vnode';
import { h } from 'snabbdom/h';
import { IView, RenderingContext, PolylineEdgeView, Point, toDegrees, angleOfPoint, maxDistance } from 'sprotty';
import { DependencyGraphNode, DependencyGraphEdge } from './graph-model';

@injectable()
export class DependencyNodeView implements IView {
    cornerRadius = 5;

    render(node: Readonly<DependencyGraphNode>, context: RenderingContext): VNode {
        const vnode = h('g', [
            h('rect.sprotty-node', {
                class: {
                    mouseover: node.hoverFeedback,
                    selected: node.selected,
                    resolved: node.resolved,
                    error: node.error !== undefined
                },
                attrs: {
                    x: '0', y: '0',
                    rx: this.cornerRadius, ry: this.cornerRadius,
                    width: Math.max(node.size.width, 0), height: Math.max(node.size.height, 0)
                }
            })
        ]);
        vnode.children!.push(...context.renderChildren(node));
        addNS(vnode);
        return vnode;
    }
}

@injectable()
export class DependencyEdgeView extends PolylineEdgeView {
    arrowLength = 10;
    arrowWidth = 8;

    render(edge: Readonly<DependencyGraphEdge>, context: RenderingContext): VNode {
        const router = this.edgeRouterRegistry.get(edge.routerKind);
        const route = router.route(edge);
        if (route.length === 0)
            return this.renderDanglingEdge('Cannot compute route', edge, context);

        const vnode = h('g.sprotty-edge', {
            class: {
                mouseover: edge.hoverFeedback,
                optional: edge.optional
            }
        }, [
            this.renderLine(edge, route, context)
        ]);
        vnode.children!.push(...this.renderAdditionals(edge, route, context));
        vnode.children!.push(...context.renderChildren(edge, { route }));
        addNS(vnode);
        return vnode;
    }

    protected renderAdditionals(edge: DependencyGraphEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p2 = segments[segments.length - 1];
        let p1: Point;
        let index = segments.length - 2;
        do {
            p1 = segments[index];
            index--;
        } while (index >= 0 && maxDistance(p1, p2) < this.arrowLength);

        const vnode = h('path.arrow', {
            attrs: {
                d: `M -1.5,0 L ${this.arrowLength},-${this.arrowWidth / 2} L ${this.arrowLength},${this.arrowWidth / 2} Z`,
                transform: `rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`
            }
        });
        return [vnode];
    }
}

function addNS(vnode: VNode) {
    if (vnode.data === undefined) {
        vnode.data = {};
    }
    vnode.data.ns = 'http://www.w3.org/2000/svg';
    if (vnode.children !== undefined) {
        for (let i = 0; i < vnode.children.length; i++) {
            const child = vnode.children[i];
            if (typeof child === 'object') {
                addNS(child);
            }
        }
    }
}
