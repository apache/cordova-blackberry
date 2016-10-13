/*
* Copyright 2013 Research In Motion Limited.
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
describe ('geolocation', function () {
    var _apiDir = __dirname + "./../../../../plugins/Geolocation/src/blackberry10/",
        mockedPluginResult,
        geolocationIndex,
        mockedNavigator = {
            geolocation: {
                getCurrentPosition: jasmine.createSpy(),
                watchPosition: jasmine.createSpy().andReturn('1337'),
                clearWatch: jasmine.createSpy()
            }
        },
        noop = function () {};	

    beforeEach (function() {
        mockedPluginResult = {
            callbackOk: jasmine.createSpy(),
            error: jasmine.createSpy(),
            noResult: jasmine.createSpy(),
            ok: jasmine.createSpy()
        };
		
        GLOBAL.PluginResult = function () {
            return mockedPluginResult;
        };

        GLOBAL.navigator = mockedNavigator;
        geolocationIndex = require(_apiDir + 'index');
    });

    afterEach(function () {
        delete require.cache[require.resolve(_apiDir + 'index')];
        delete GLOBAL.PluginResult;
    });

    describe('getLocation property', function() {
        it('calls navigator and result.noResult after declarations', function() {
            geolocationIndex.getLocation(noop,noop,{});
            expect(mockedNavigator.geolocation.getCurrentPosition).toHaveBeenCalled();
            expect(mockedPluginResult.noResult).toHaveBeenCalledWith(true);
        });
    });

    describe('addWatch property', function() {
        it('calls navigator to initialize id and calls result.noResult(true)', function() {
            geolocationIndex.addWatch(noop,noop,{});
            expect(mockedNavigator.geolocation.watchPosition).toHaveBeenCalled();
            expect(mockedPluginResult.noResult).toHaveBeenCalledWith(true);
        });
    });

    describe('clearWatch property', function() {
        it('calls navigator.geolocation.clearWatch(id) if id exists and calls result.ok', function () {
            geolocationIndex.addWatch(noop,noop,{});
            geolocationIndex.clearWatch(noop,noop,{});
            expect(mockedNavigator.geolocation.clearWatch).toHaveBeenCalledWith('1337');
            expect(mockedPluginResult.ok).toHaveBeenCalledWith(null, false); 
        });
    });
});
