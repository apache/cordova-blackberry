/*
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

var fs = require('fs'),
    path = require('path'),
    os = require('os'),
    childProcess = require('child_process'),
    AUTHOR_P12 = "author.p12",
    BBIDTOKEN = "bbidtoken.csk",
    CSK = "barsigner.csk",
    DB = "barsigner.db",
    _self;

function getDefaultPath(file) {
    // The default location where signing key files are stored will vary based on the OS:
    // Windows XP: %HOMEPATH%\Local Settings\Application Data\Research In Motion
    // Windows Vista and Windows 7: %HOMEPATH%\AppData\Local\Research In Motion
    // Mac OS: ~/Library/Research In Motion
    // UNIX or Linux: ~/.rim
    var p = "";
    if (os.type().toLowerCase().indexOf("windows") >= 0) {
        // Try Windows XP location
        p = process.env.HOMEDRIVE + process.env.HOMEPATH + "\\Local Settings\\Application Data\\Research In Motion\\";
        if (!fs.existsSync(p)) {
            // Try Windows Vista and Windows 7 location
            p = process.env.HOMEDRIVE + process.env.HOMEPATH + "\\AppData\\Local\\Research In Motion\\";
        }
    } else if (os.type().toLowerCase().indexOf("darwin") >= 0) {
        // Try Mac OS location
        p = process.env.HOME + "/Library/Research In Motion/";
    } else if (os.type().toLowerCase().indexOf("linux") >= 0) {
        // Try Linux location
        p = process.env.HOME + "/.rim/";
    }

    return p + file;

}

function getDefaultPathIfExists(file) {
    var p = getDefaultPath(file);
    if (fs.existsSync(p)) {
        return p;
    }
}

_self = {
    getDefaultPath: getDefaultPath,

    getKeyStorePath : function () {
        // Todo: decide where to put sigtool.p12 which is generated and used in WebWorks SDK for Tablet OS
        return getDefaultPathIfExists(AUTHOR_P12);
    },

    getKeyStorePathBBID: function () {
        return getDefaultPathIfExists(BBIDTOKEN);
    },

    getCskPath : function () {
        return getDefaultPathIfExists(CSK);
    },

    getDbPath : function () {
        return getDefaultPathIfExists(DB);
    },

    warn: function () {
        if (!this.getKeyStorePath()) {
            console.error(
                "WARNING: Cannot sign applications. Author.p12 file cannot be found at default location: " +
                getDefaultPath("author.p12")
            );
        }

        if (!this.getKeyStorePathBBID()) {

            if (this.getCskPath() && this.getDbPath()) {
                console.error(
                    "WARNING: BlackBerry ID tokens can now be used in place of your old signing keys.\n" +
                    "For more information log in at http://developer.blackberry.com and click on Code Signing"
                );
            } else {
                console.error(
                    "WARNING: Cannot sign applications. bbidtoken.csk file cannot be found at default location: " +
                    getDefaultPath("bbidtoken.csk")
                );
            }
        }
    }
};

module.exports = _self;
