/**
 * Generated using theia-extension-generator
 */

import { NpmDependencyGraphCommandContribution, NpmDependencyGraphMenuContribution } from './dependency-graph-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";

import { ContainerModule } from "inversify";

export default new ContainerModule(bind => {
    // add your contribution bindings here
    
    bind(CommandContribution).to(NpmDependencyGraphCommandContribution);
    bind(MenuContribution).to(NpmDependencyGraphMenuContribution);
    
});