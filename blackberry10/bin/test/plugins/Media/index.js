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
describe ('media', function () {
    var _apiDir = __dirname + "./../../../../plugins/Media/src/blackberry10/",
        mockedPluginResult,
        mockedWebview,
        mockedaudio,
        mediaindex,
        noop = function () {};	

    beforeEach (function() {
         mockedWebview = {
            allowWebEvent: jasmine.createSpy(), 
            onDialogRequested: jasmine.createSpy()
        };
    
        GLOBAL.qnx = {
            webplatform: {
                getWebViews: function () {
                    return {0: mockedWebview};
                }
            }
        }; 
		
        mockedPluginResult = {
            error: jasmine.createSpy(),
            ok: jasmine.createSpy()
        };
		
        GLOBAL.PluginResult = function () {
            return mockedPluginResult;
        };

        mockedaudio = {
            play: jasmine.createSpy(),
            pause: jasmine.createSpy(),
            currentTime: jasmine.createSpy(),
            duration: jasmine.createSpy(),
            src: jasmine.createSpy()
        };	
        GLOBAL.Audio = jasmine.createSpy().andReturn(mockedaudio);
        mediaindex = require(_apiDir + 'index');
    });

    afterEach(function () {
        delete require.cache[require.resolve(_apiDir + 'index')];
        delete GLOBAL.qnx;
        delete GLOBAL.PluginResult;
        delete GLOBAL.Audio;
    });

    describe("create property", function() {
        it('will call result.error with invalid args', function () {
            mediaindex.create(noop, noop, {});
            expect(mockedPluginResult.error).toHaveBeenCalledWith(jasmine.any(String));
        });

        it('will create a new Audio object if invalid args[1]', function() {
            mediaindex.create(
                noop,
                noop, 
                {0: encodeURIComponent(JSON.stringify("42"))}
            );
            expect(Audio).toHaveBeenCalled();
            expect(mockedWebview.allowWebEvent).toHaveBeenCalledWith('DialogRequested');
            expect(mockedWebview.onDialogRequested).toBeDefined();
            expect(mockedPluginResult.ok).toHaveBeenCalled();
        });

        it('will create a new Audio object if valid args[1]', function () {
            mediaindex.create(
                noop,
                noop,
                {
                    0: encodeURIComponent(JSON.stringify('1337')),
                    1: encodeURIComponent(JSON.stringify('11'))
                }
            );
            expect(Audio).toHaveBeenCalledWith('11');
            expect(mockedPluginResult.ok).toHaveBeenCalled();		
        });
    });

    describe('startPlayingAudio property', function () {
        it('will error message if args[0] does not exist', function () {
           mediaindex.startPlayingAudio(
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

	it('will error message if audio does not exist', function () {
            mediaindex.startPlayingAudio(
                noop,
                noop,
                {0:1} //ensuring that args[0] exists
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Audio object has not been initialized');
        });

        it('will call audio.play() and result.ok() when audio exists', function () {
            mediaindex.create(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );
            expect(Audio).toHaveBeenCalled();

            mediaindex.startPlayingAudio(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

            expect(mockedaudio.play).toHaveBeenCalled();
            expect(mockedPluginResult.ok).toHaveBeenCalled();
        });	
    });

    describe('stopPlayingAudio property', function () {
        it('will error message if args[0] does not exist', function () {
            mediaindex.stopPlayingAudio(
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

        it('will error message if audio does not exist', function () {
            mediaindex.stopPlayingAudio(
                noop,
                noop,
                {0:1}
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Audio Object has not been initialized');
        });

        it('will call audio.pause(), audio.currentTime() and result.ok() when audio exists', function () {
            mediaindex.create (
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );
 
            mediaindex.stopPlayingAudio(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );
            expect(mockedaudio.pause).toHaveBeenCalled();
            expect(mockedaudio.currentTime).toEqual(0);
        });        
    });

    describe('seekToAudio property', function () {
        it('will error message if args[0] does not exist', function () {
            mediaindex.seekToAudio(
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();  
        });        

        it('will error message when audio does not exist', function () {
            mediaindex.seekToAudio(
                noop,
                noop,
                {0:1}
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Audio Object has not been initialized');
        });

        it('will error message if args[1] does not exist', function () {
            mediaindex.create(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

           mediaindex.seekToAudio(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Media seek time argument not found');
        });

        it('will set audio.currentTime and call result.ok() with no error', function () {
            mediaindex.create(
                noop,
                noop, 
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

            mediaindex.seekToAudio(
                noop,
                noop, 
                {
                    0: encodeURIComponent(JSON.stringify('1337')),
                    1: encodeURIComponent(JSON.stringify('11'))
                }
            );
            expect(mockedaudio.currentTime).not.toEqual(0);
            expect(mockedPluginResult.ok).toHaveBeenCalled();
        });

        it('will call result.error when there is an error', function () {
            mediaindex.create(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

            mockedPluginResult.ok.andCallFake(function () {throw 'testerror';});

            mediaindex.seekToAudio(
                noop,
                noop,
                {
                    0: encodeURIComponent(JSON.stringify('1337')),
                    1: encodeURIComponent(JSON.stringify('11'))
                }
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Error seeking audio: testerror');
        });
    });

    describe('pausePlayingAudio property', function () {
        it('will error message if args[0] does not exist', function () {
            mediaindex.pausePlayingAudio (
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

        it('will error message when audio does not exist', function () {
            mediaindex.pausePlayingAudio(
                noop,
                noop,
                {0:1}
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Audio Object has not been initialized');
        });

        it('will call audio.pause() when args[0] and audio exists', function () {
            mediaindex.create(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

            mediaindex.pausePlayingAudio(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );
            expect(mockedaudio.pause).toHaveBeenCalled();   
        });
    });

    describe('getCurrentPositionAudio property', function () {
        it('will error message if args[0] does not exist', function () {
            mediaindex.getCurrentPositionAudio(
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

        it('will error message if audio does not exist', function () {
            mediaindex.getCurrentPositionAudio(
                noop,
                noop,
                {0:1}
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Audio Object has not been initialized');
        });

        it('will call result.ok(audio.currentTime) when audio and args[0] exists', function () {
            mediaindex.create(
                noop,
                noop, 
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

            mediaindex.getCurrentPositionAudio(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))}
           );
           expect(mockedPluginResult.ok).toHaveBeenCalledWith(mockedaudio.currentTime);
        });
    });

    describe('getDuration property', function () {
        it('will error message if args[0] does not exist', function () {
            mediaindex.getDuration(
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

        it('will error message if audio does not exist', function () {
            mediaindex.getDuration (
                noop,
                noop,
                {0:1} 
            );
            expect(mockedPluginResult.error).toHaveBeenCalledWith('Audio Object has not been initialized');
        });

        it('will call result.ok(audio.duration) when audio and args[0] exist', function () {
            mediaindex.create(
                noop,
                noop, 
                {0: encodeURIComponent(JSON.stringify('1337'))} 
            );

            mediaindex.getDuration(
                noop,
                noop, 
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );
            expect(mockedPluginResult.ok).toHaveBeenCalledWith(mockedaudio.duration); 
        });
    });

    describe('startRecordingAudio and stopRecordingAudio property', function () {        
        it('will say not supported for start recording', function () {
            mediaindex.startRecordingAudio();
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

        it('will say not supported for stop recording', function () {
            mediaindex.stopRecordingAudio();
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });
    });

    describe('release property', function () {
        it('will error message if args[0] does not exist', function () {
            mediaindex.release(
                noop,
                noop,
                {}
            );
            expect(mockedPluginResult.error).toHaveBeenCalled();
        });

        it('will set audio to be undefined', function () {
            mediaindex.create(
                noop,
                noop,   
                {0: encodeURIComponent(JSON.stringify('1337'))}
            );

            mediaindex.release(
                noop,
                noop,
                {0: encodeURIComponent(JSON.stringify('1337'))} 
            );
            expect(mockedaudio.src).not.toBeDefined();
            expect(mockedPluginResult.ok).toHaveBeenCalled();          
        });
    });
});
