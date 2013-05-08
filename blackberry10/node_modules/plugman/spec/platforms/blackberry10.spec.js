var blackberry10 = require('../../src/platforms/blackberry10'),
    common  = require('../../src/platforms/common'),
    install = require('../../src/install'),
    path    = require('path'),
    fs      = require('fs'),
    shell   = require('shelljs'),
    et      = require('elementtree'),
    os      = require('osenv'),
    temp    = path.join(os.tmpdir(), 'plugman'),
    plugins_dir = path.join(temp, 'cordova', 'plugins'),
    xml_helpers = require('../../src/util/xml-helpers'),
    plugins_module = require('../../src/util/plugins'),
    dummyplugin = path.join(__dirname, '..', 'plugins', 'DummyPlugin'),
    faultyplugin = path.join(__dirname, '..', 'plugins', 'FaultyPlugin'),
    blackberry10_project = path.join(__dirname, '..', 'projects', 'blackberry10', '*'),
    xml_path     = path.join(dummyplugin, 'plugin.xml'),
    xml_text     = fs.readFileSync(xml_path, 'utf-8'),
    plugin_et    = new et.ElementTree(et.XML(xml_text)),
    platformTag = plugin_et.find('./platform[@name="blackberry10"]'),
    dummy_id = plugin_et._root.attrib['id'],
    valid_source = platformTag.findall('./source-file'),
    assets = plugin_et.findall('./asset'),
    configChanges = platformTag.findall('./config-file'),
    invalid_source = platformTag.findall('./source-file'),
    faulty_id = plugin_et._root.attrib['id'];

function copyArray(arr) {
    return Array.prototype.slice.call(arr, 0);
}

describe('blackberry10 project handler', function() {
    it('should have an install function', function() {
        expect(typeof blackberry10.install).toEqual('function');
    });
    it('should have an uninstall function', function() {
        expect(typeof blackberry10.uninstall).toEqual('function');
    });
    it('should return cordova-blackberry project www location using www_dir', function() {
        expect(blackberry10.www_dir('/')).toEqual('/www');
    });

    describe('installation', function() {
        beforeEach(function() {
            shell.mkdir('-p', temp);
            shell.cp('-rf', blackberry10_project, temp);
        });
        afterEach(function() {
            shell.rm('-rf', temp);
        });
        describe('of <config-file> elements', function() {
            it('should target config.xml', function() {
                var config = copyArray(configChanges);
                var s = spyOn(xml_helpers, 'parseElementtreeSync').andCallThrough();
                blackberry10.install(config, dummy_id, temp, dummyplugin, {});
                expect(s).toHaveBeenCalledWith(path.join(temp, 'www', 'config.xml'));
            });
            it('should call into xml helper\'s graftXML', function() {
                shell.cp('-rf', blackberry10_project, temp);
                var config = copyArray(configChanges);
                var s = spyOn(xml_helpers, 'graftXML').andReturn(true);
                blackberry10.install(config, dummy_id, temp, dummyplugin, {});
                expect(s).toHaveBeenCalled();
            });
        });
    });

    describe('uninstallation', function() {
        beforeEach(function() {
            shell.mkdir('-p', temp);
            shell.mkdir('-p', plugins_dir);
            shell.cp('-rf', blackberry10_project, temp);
            shell.cp('-rf', dummyplugin, plugins_dir);
        });
        afterEach(function() {
            shell.rm('-rf', temp);
        });
        describe('of <config-file> elements', function() {
            it('should target config.xml', function(done) {
                var config = copyArray(configChanges);
                var s = spyOn(xml_helpers, 'parseElementtreeSync').andCallThrough();
                install('blackberry10', temp, 'DummyPlugin', plugins_dir, {}, function() {
                    var config = copyArray(configChanges);
                    blackberry10.uninstall(config, dummy_id, temp, path.join(plugins_dir, 'DummyPlugin'));
                    expect(s).toHaveBeenCalledWith(path.join(temp, 'www', 'config.xml'));
                    done();
                });
            });
            it('should call into xml helper\'s pruneXML', function(done) {
                var config = copyArray(configChanges);
                install('blackberry10', temp, 'DummyPlugin', plugins_dir, {}, function() {
                    var s = spyOn(xml_helpers, 'pruneXML').andReturn(true);
                    blackberry10.uninstall(config, dummy_id, temp, path.join(plugins_dir, 'DummyPlugin'));
                    expect(s).toHaveBeenCalled();
                    done();
                });
            });
        });
        describe('of <asset> elements', function() {
            it('should remove www\'s plugins/<plugin-id> directory', function(done) {
                var as = copyArray(assets);
                install('blackberry10', temp, 'DummyPlugin', plugins_dir, {}, function() {
                    var s = spyOn(shell, 'rm');
                    blackberry10.uninstall(as, dummy_id, temp, path.join(plugins_dir, 'DummyPlugin'));
                    expect(s).toHaveBeenCalledWith('-rf', path.join(temp, 'www', 'plugins', dummy_id));
                    done();
                });
            });
            it('should remove stuff specified by the element', function(done) {
                var as = copyArray(assets);
                install('blackberry10', temp, 'DummyPlugin', plugins_dir, {}, function() {
                    var s = spyOn(shell, 'rm');
                    blackberry10.uninstall(as, dummy_id, temp, path.join(plugins_dir, 'DummyPlugin'));
                    expect(s).toHaveBeenCalledWith('-rf', path.join(temp, 'www', 'dummyplugin.js'));
                    expect(s).toHaveBeenCalledWith('-rf', path.join(temp, 'www', 'dummyplugin'));
                    done();
                });
            });
        });
    });
});
