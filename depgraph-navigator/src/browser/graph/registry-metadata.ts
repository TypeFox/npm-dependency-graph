/*
 * Copyright (C) 2018 TypeFox
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

export interface PackageMetadata {
    name: string
    description: string
    'dist-tags': { [tag: string]: string }
    versions: { [version: string]: VersionMetadata }
}

export interface VersionMetadata {
    name: string
    version: string
    dependencies?: { [dep: string]: string }
    optionalDependencies?: { [dep: string]: string }
    devDependencies?: { [dep: string]: string }
    peerDependencies?: { [dep: string]: string }
}
