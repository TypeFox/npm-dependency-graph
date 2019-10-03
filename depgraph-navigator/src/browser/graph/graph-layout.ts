/*
 * Copyright (C) 2018 TypeFox
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable } from 'inversify';
import { LayoutOptions }from 'elkjs/lib/elk-api';
import { SGraphSchema, SModelIndex, SModelElementSchema } from 'sprotty';
import { DefaultLayoutConfigurator } from 'sprotty-elk';

@injectable()
export class DepGraphLayoutConfigurator extends DefaultLayoutConfigurator {

    protected graphOptions(sgraph: SGraphSchema, index: SModelIndex<SModelElementSchema>): LayoutOptions {
        return {
            'elk.algorithm': 'layered',
            'elk.direction': 'RIGHT',
            'elk.edgeRouting': 'POLYLINE'
        }
    }

}
