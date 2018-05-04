declare module "elkjs/lib/elk-api" {

    export interface ElkPoint {
        x: number
        y: number
    }
    
    export interface ElkGraphElement {
        id: string
        labels?: ElkLabel[]
    }
    
    export interface ElkShape extends ElkGraphElement {
        x?: number
        y?: number
        width?: number
        height?: number
    }
    
    export interface ElkNode extends ElkShape {
        children?: ElkNode[]
        ports?: ElkPort[]
        edges?: ElkEdge[]
    }
    
    export interface ElkPort extends ElkShape { }
    
    export interface ElkLabel extends ElkShape {
        text: string
    }
    
    export interface ElkEdge extends ElkGraphElement {
        junctionPoints?: ElkPoint[]
    }
    
    export interface ElkPrimitiveEdge extends ElkEdge {
        source: string
        sourcePort?: string
        target: string
        targetPort?: string
        sourcePoint?: ElkPoint
        targetPoint?: ElkPoint
        bendPoints?: ElkPoint[]
    }
    
    export interface ElkExtendedEdge extends ElkEdge {
        sources: string[]
        targets: string[]
        sections: ElkEdgeSection[]
    }
    
    export interface ElkEdgeSection extends ElkGraphElement {
        startPoint: ElkPoint
        endPoint: ElkPoint
        bendPoints?: ElkPoint[]
        incomingShape?: string
        outgoingShape?: string
        incomingSections?: string[]
        outgoingSections?: string[]
    }

    export interface ELK {
        layout(graph: ElkNode): Promise<void>;
    }
    const elk: {
        new(args?: { workerUrl: string }): ELK;
    };
    export default elk;
}

declare module "elkjs" {
    export * from "elkjs/lib/elk-api";
}
