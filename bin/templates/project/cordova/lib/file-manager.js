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
    util = require("util"),
    packagerUtils = require("./packager-utils"),
    fs = require("fs"),
    conf = require("./conf"),
    BBWPignore = require('./bbwpignore'),
    wrench = require("wrench"),
    zip = require("zip"),
    localize = require("./localize"),
    logger = require("./logger"),
    CLIENT_JS = "client.js",
    SERVER_JS = "index.js",
    VALID_EXTENSIONS = [".js", ".json"],
    CORDOVA_JS_REGEX = /(cordova-.+js)|cordova\.js/,
    MODULES_TO_KEEP = ["lib/utils.js", "lib/exception.js"];

function unzip(from, to) {
    var data, entries, p, parent;

    if (fs.existsSync(from)) {
        data = fs.readFileSync(from);
        entries = zip.Reader(data).toObject();

        if (!fs.existsSync(to)) {
            wrench.mkdirSyncRecursive(to, "0755");
        }

        for (p in entries) {
            if (entries.hasOwnProperty(p)) {
                if (p.indexOf("__MACOSX") >= 0) {
                    continue;
                }

                if (p.split("/").length > 1) {
                    parent = p.split("/").slice(0, -1).join("/");
                    wrench.mkdirSyncRecursive(to + "/" + parent, "0755");
                }

                fs.writeFileSync(to + "/" + p, entries[p]);
            }
        }
    } else {
        throw localize.translate("EXCEPTION_WIDGET_ARCHIVE_NOT_FOUND", from);
    }
}

function copyDirContents(from, to) {
    var files = wrench.readdirSyncRecursive(from),
        bbwpignoreFile = path.join(from, conf.BBWP_IGNORE_FILENAME),
        bbwpignore,
        ignoreFiles = conf.BBWP_IGNORE_FILENAME;

    if (fs.existsSync(bbwpignoreFile)) {
        bbwpignore = new BBWPignore(bbwpignoreFile, files);
        bbwpignore.matchedFiles.push(conf.BBWP_IGNORE_FILENAME); //add the .bbwpignore file to the ignore list
        ignoreFiles = bbwpignore.matchedFiles.join("|");
    }


    wrench.copyDirSyncRecursive(from, to, {preserve: true, whitelist: false, filter: new RegExp(ignoreFiles, "g")});
}

function prepare(session) {
    var conf = session.conf,
        dest = session.sourcePaths;

    if (fs.existsSync(session.sourceDir)) {
        wrench.rmdirSyncRecursive(session.sourceDir);
    }

    // unzip archive
    if (fs.existsSync(session.archivePath)) {
        if (session.archivePath.toLowerCase().match("[.]zip$")) {
            unzip(session.archivePath, session.sourceDir);
        } else {
            copyDirContents(session.archivePath, session.sourceDir);
        }
    } else {
        throw localize.translate("EXCEPTION_INVALID_ARCHIVE_PATH", session.archivePath);
    }
}


function getModulesArray(dest, files, baseDir) {
    var modulesList = [],
        EXCLUDE_FILES = ["client.js", "manifest.json"];

    function isExcluded(file) {
        return EXCLUDE_FILES.indexOf(path.basename(file)) !== -1 || !file.match(/\.(js|json)$/);
    }

    files.forEach(function (file) {
        file = path.resolve(baseDir, file);

        if (!fs.statSync(file).isDirectory()) {
            if (!isExcluded(file)) {
                modulesList.push({name: path.relative(path.normalize(dest.CHROME), file).replace(/\\/g, "/"), file: file});
            }
        }
    });

    return modulesList;
}

function generateFrameworkModulesJS(session) {
    var dest = session.sourcePaths,
        modulesList = [],
        modulesStr = "(function () { ",
        frameworkModulesStr = "window.frameworkModules = [",
        libFiles = wrench.readdirSyncRecursive(dest.LIB),
        extFiles,
        extModules;

    modulesList = modulesList.concat(getModulesArray(dest, libFiles, dest.LIB));

    if (fs.existsSync(dest.EXT)) {
        extFiles = wrench.readdirSyncRecursive(dest.EXT);
        extModules = getModulesArray(dest, extFiles, dest.EXT);
        modulesList = modulesList.concat(extModules);
    }

    modulesList.forEach(function (module, index) {
        modulesStr += "define('" + module.name + "', function (require, exports, module) {\n" +
                      fs.readFileSync(module.file, "utf-8") + "\n" +
                      "});\n";
        frameworkModulesStr += "'" + module.name + "'" +  (index !== modulesList.length - 1 ? ", " : "");
        // Issue with 10.1 webplatform - requires certain files in chrome/lib
        if (MODULES_TO_KEEP.indexOf(module.name) < 0) {
            fs.unlinkSync(path.normalize(dest.CHROME + "/" + module.name));
        }
    });

    modulesStr += "}());";
    frameworkModulesStr += "];\n";
    fs.writeFileSync(path.normalize(dest.CHROME + "/frameworkModules.js"), frameworkModulesStr + modulesStr);
}

function copyNative(session, target) {
    var src = path.normalize(session.conf.NATIVE + "/" + target),
        dest = path.normalize(session.sourceDir);

    copyDirContents(src, dest);
}

function copyWebworks(session) {
    var srcPath = path.normalize(session.conf.PROJECT_ROOT + "/lib"),
        dest = path.normalize(session.sourceDir),
        srcFiles;

    srcFiles = packagerUtils.listFiles(srcPath, function (file) {
        return CORDOVA_JS_REGEX.test(file);
    });

    if (srcFiles.length === 1) {
        packagerUtils.copyFile(srcFiles[0], dest);

        //Rename file to webworks.js
        fs.renameSync(path.join(dest, path.basename(srcFiles[0])), path.join(dest, "cordova.js"));
    } else {
        throw localize.translate("EXCEPTION_CORDOVA_JS_IN_LIB_DIR", srcFiles.length);
    }
}

function handleCSP(session, config) {
    var filename = config.content;
    if (filename.indexOf('local://') === 0) {
        filename = filename.substring(7);
        filename = path.join(path.normalize(session.sourceDir), filename);
        var contents = fs.readFileSync(filename, 'utf-8');
        // Meta tag is replaced as needed with our required port
        var updated = parsePolicy(contents);
        fs.writeFileSync(filename, updated, 'utf8');
    }
}

/*
Accepts the list of policy directives in the form: "default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *".
Parses the list and will add http://localhost:8472 to the connect-src directive if it's not found in either default-src or connect-src.
Returns the list with any necessary additions.
*/
function updateCSP(policy) {
    var src = 'http://localhost:8472';
    var directives = policy.split(';');
    var connectSrc = -1;
    for (var dir in directives) {
        var sources = directives[dir].trim().split(' ');
        if (sources[0] === 'default-src') {
            if (checkSourceForPort(directives[dir], src)) {
                // found user defined port
                return policy;
            }
        } else if (sources[0] === 'connect-src') {
            connectSrc = dir;
            if (checkSourceForPort(directives[dir], src)) {
                // found user defined port
                return policy;
            }
        }
    }
    // Didn't find it previously defined
    if (connectSrc >=0) {
        // Found a pre-existing directive to use
        directives[connectSrc] = directives[connectSrc] + ' ' + src;
        return directives.join(';');
    } else {
        // Add the directive
        return policy + '; connect-src ' + src;
    }

}

function checkSourceForPort(sourceList, src) {
    if (sourceList.indexOf(src) > 0) {
        return true;
    } else {
        return false;
    }
}

/*
Accepts a string which should be the document to check for the Content-Security-Policy meta tag.
If found, the tag is updated to include the necessary ports for BlackBerry10 plugins.
Returns the modified document.
*/
function parsePolicy(doc) {
    // Find the meta tag in the document
    var policyMetaTag = /<meta(\s+|\s+.*\s+)http-equiv\s*=\s*"Content-Security-Policy".*>/i;
    // Find the content value in the meta tag
    var contentAttr = /\s+content\s*=\s*"(.*)"/i;
    var policy = policyMetaTag.exec(doc);
    if (!policy) {
        // no policy to update
        return doc;
    }
    // policy[0] is the full meta tag as found
    var content = contentAttr.exec(policy[0]);
    // content[1] is the list of directives in the meta tag
    var newPolicy = ' content=\"'+updateCSP(content[1]) + '\"';
    var newMetaTag = policy[0].replace(contentAttr, newPolicy);
    logger.log("Checking and updating Content-Security-Policy as needed to allow BlackBerry 10 Plugins to function.");
    logger.log("The tag has been set in the BlackBerry project to:\n" + newMetaTag);
    return doc.replace(policyMetaTag, newMetaTag);
}

function hasValidExtension(file) {
    return VALID_EXTENSIONS.some(function (element, index, array) {
        return path.extname(file) === element;
    });
}

function generateUserConfig(session, config) {
    packagerUtils.writeFile(path.join(session.sourcePaths.LIB, "config"), "user.js", "module.exports = " + JSON.stringify(config, null, "    ") + ";");
}

module.exports = {
    unzip: unzip,

    copyNative: copyNative,

    copyWebworks : copyWebworks,

    handleCSP : handleCSP,

    prepareOutputFiles: prepare,

    generateFrameworkModulesJS: generateFrameworkModulesJS,

    generateUserConfig: generateUserConfig,

    cleanSource: function (session) {
        if (!session.keepSource) {
            wrench.rmdirSyncRecursive(session.sourceDir);
        }
    },

    copyDirContents: copyDirContents
};
