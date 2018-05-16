/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { BackendApplicationContribution } from "@theia/core/lib/node";
import { RegistryProxy } from "./proxy";

export default new ContainerModule(bind => {
    bind(RegistryProxy).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toDynamicValue(ctx => ctx.container.get(RegistryProxy)).inSingletonScope();
});
