/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';
import { KeybindingContribution, KeybindingRegistry, ApplicationShell, KeybindingContext, Keybinding } from '@theia/core/lib/browser';
import { DiagramMenus, DiagramWidget } from 'sprotty-theia';
import { DepGraphModelSource } from '../graph/model-source';
import { DepGraphWidget } from './diagram-widget';

export const RESOLVE_GRAPH = 'diagram.resolveGraph'

@injectable()
export class DepgraphKeybindingContext implements KeybindingContext {

    @inject(ApplicationShell) protected readonly shell!: ApplicationShell;

    id = 'depgraph-navigator.keybinding.context'

    isEnabled(arg?: Keybinding) {
        const widget = this.shell.currentWidget;
        return widget instanceof DepGraphWidget && widget.diagramType === 'dependency-graph';
    }
}

@injectable()
export class DiagramCommandContribution implements CommandContribution, KeybindingContribution, MenuContribution {

    @inject(ApplicationShell) protected readonly shell!: ApplicationShell;
    @inject(DepgraphKeybindingContext) protected readonly keybindingContext!: DepgraphKeybindingContext;

    registerCommands(registry: CommandRegistry): void {
        const checkCurrentWidget = () => {
            const widget = this.shell.currentWidget;
            return widget instanceof DepGraphWidget && widget.diagramType === 'dependency-graph';
        };
        registry.registerCommand({
            id: RESOLVE_GRAPH,
            label: 'Resolve All Dependencies'
        }, {
            execute: () => {
                const widget = this.shell.currentWidget as DiagramWidget;
                const modelSource = widget.modelSource as DepGraphModelSource;
                modelSource.resolveGraph();
            },
            isEnabled: checkCurrentWidget,
            isVisible: checkCurrentWidget
        });
    }

    registerKeybindings(registry: KeybindingRegistry): void {
        registry.registerKeybinding({
            command: RESOLVE_GRAPH,
            context: this.keybindingContext.id,
            keybinding: 'ctrlcmd+shift+a'
        });
    }

    registerMenus(registry: MenuModelRegistry) {
        registry.registerMenuAction(DiagramMenus.DIAGRAM, {
            commandId: RESOLVE_GRAPH
        })
    }
}
