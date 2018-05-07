import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";

export const NpmDependencyGraphCommand = {
    id: 'NpmDependencyGraph.command',
    label: "Shows a message"
};

@injectable()
export class NpmDependencyGraphCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(NpmDependencyGraphCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}

@injectable()
export class NpmDependencyGraphMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: NpmDependencyGraphCommand.id,
            label: 'Say Hello'
        });
    }
}