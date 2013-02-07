/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require("path"),
    fs = require("fs"),
    packagerUtils = require("./packager-utils"),
    localize = require("./localize"),
    logger = require("./logger"),
    MANIFEST_FILE = "manifest.json",
    _extensionMap = {}, // stores manifest content, indexed by extension base name (i.e. api folder name)
    _idLookup = {}, // indexed by feature id, for looking up extension base name
    _globalFeatures = [],
    _inProgressStack = [],
    _resolvedDependencies = [];

function initializeGlobalFeatures() {
    Object.getOwnPropertyNames(_extensionMap).forEach(function (extBasename) {
        if (_extensionMap[extBasename].global) {
            _globalFeatures.push({
                id: _extensionMap[extBasename].namespace
            });
        }
    });
}

function initialize(session) {
    var extPath = session.conf.EXT,
        extDirs;

    if (!path.sep) {
        path.sep = packagerUtils.isWindows() ? "\\" : "/";
    }

    if (fs.existsSync(extPath)) {
        extDirs = fs.readdirSync(extPath); // just read the top-level dirs under "ext" 
        extDirs.forEach(function (dir) {
            if (!dir.match(/^\./)) { // to avoid reading .DS_Store on Mac
                var manifestPath = path.normalize(path.resolve(extPath, path.join(dir, MANIFEST_FILE))),
                    apiDir = path.normalize(path.resolve(extPath, dir)),
                    manifest,
                    basename;

                if (fs.existsSync(manifestPath)) {
                    try {
                        // use loadModule function to load manifest so that mocking can be done in tests
                        manifest = packagerUtils.loadModule(manifestPath);
                        basename = apiDir.split(path.sep).pop(); // get extension base name
                        _extensionMap[basename] = manifest;

                        if (manifest.namespace) {
                            _idLookup[manifest.namespace] = basename;
                        } else {
                            // error - manifest.json did not specify namespace property
                            throw localize.translate("EXCEPTION_EXTENSION_MISSING_NAMESPACE_MANIFEST", manifestPath);
                        }
                    } catch (e) {
                        // error - manifest.json contains error
                        throw localize.translate("EXCEPTION_EXTENSION_ERROR_PARSING_MANIFEST", manifestPath);
                    }
                } else {
                    // error - manifest.json not found int extension dir
                    throw localize.translate("EXCEPTION_EXTENSION_MISSING_MANIFEST", apiDir);
                }
            }
        });
    }

    initializeGlobalFeatures();
}

function resolve(extensions) {
    extensions.forEach(function (extBasename) {
        var manifest = _extensionMap[extBasename];

        if (manifest) {
            _inProgressStack.push(extBasename);

            if (_resolvedDependencies.indexOf(extBasename) === -1) {
                _resolvedDependencies.push(extBasename);
            }

            if (manifest.dependencies && (manifest.dependencies instanceof Array) && manifest.dependencies.length > 0) {
                manifest.dependencies.forEach(function (depBasename) {
                    var deps = [];

                    if (_inProgressStack.indexOf(depBasename) === -1) {
                        deps.push(depBasename);
                    } else {
                        // error - circular dependency
                        throw localize.translate("EXCEPTION_EXTENSION_CIRCULAR_DEPENDENCY", extBasename);
                    }

                    resolve(deps);
                });
            }

            _inProgressStack.pop(extBasename);
        } else {
            // error - the dependency list contains something not found in map
            throw localize.translate("EXCEPTION_EXTENSION_NOT_FOUND", extBasename);
        }
    });
}

module.exports = {
    initialize: function (session) {
        initialize(session);

        return {
            getGlobalFeatures: function () {
                return _globalFeatures;
            },
            getAllExtensionsToCopy: function (accessList) {
                var extensions = [],
                    extBasename;

                _resolvedDependencies = [];
                accessList.forEach(function (accessListEntry) {
                    accessListEntry.features.forEach(function (feature) {
                        extBasename = _idLookup[feature.id];

                        if (extBasename) {
                            extensions.push(extBasename);
                        } else {
                            // warn - not found in registry
                            logger.warn(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", feature.id));
                        }
                    });
                });

                resolve(extensions);

                return _resolvedDependencies;
            },
            getExtensionBasenameByFeatureId: function (featureId) {
                return _idLookup[featureId];
            },
            getFeatureIdByExtensionBasename: function (extBasename) {
                if (_extensionMap[extBasename]) {
                    return _extensionMap[extBasename].namespace;
                }

                return null;
            },
            getExtensionMap: function () {
                return _extensionMap;
            }
        };
    }
};