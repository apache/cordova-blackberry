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
        p = process.env.HOMEDRIVE + process.env.HOMEPATH + "\\Local Settings\\Application Data\\Research In Motion\\" + file;
        if (fs.existsSync(p)) {
            return p;
        }

        // Try Windows Vista and Windows 7 location
        p = process.env.HOMEDRIVE + process.env.HOMEPATH + "\\AppData\\Local\\Research In Motion\\" + file;
        if (fs.existsSync(p)) {
            return p;
        }
    } else if (os.type().toLowerCase().indexOf("darwin") >= 0) {
        // Try Mac OS location
        p = process.env.HOME + "/Library/Research In Motion/" + file;
        if (fs.existsSync(p)) {
            return p;
        }
    } else if (os.type().toLowerCase().indexOf("linux") >= 0) {
        // Try Linux location
        p = process.env.HOME + "/.rim/" + file;
        if (fs.existsSync(p)) {
            return p;
        }
    }
}

_self = {
    getKeyStorePath : function () {
        // Todo: decide where to put sigtool.p12 which is genereated and used in WebWorks SDK for Tablet OS
        return getDefaultPath(AUTHOR_P12);
    },

    getKeyStorePathBBID: function () {
        return getDefaultPath(BBIDTOKEN);
    },

    getCskPath : function () {
        return getDefaultPath(CSK);
    },

    getDbPath : function () {
        return getDefaultPath(DB);
    }
};

module.exports = _self;
