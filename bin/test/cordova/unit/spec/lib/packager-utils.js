/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var testData = require("./test-data"),
    utils = require(testData.libPath + "/packager-utils"),
    fs = require("fs"),
    path = require("path"),
    asciiFile = path.resolve("bin/test/cordova/unit/data/ascii_text.txt"),
    utf8File = path.resolve("bin/test/cordova/unit/data/utf8_text.txt"),
    ucs2beFile = path.resolve("bin/test/cordova/unit/data/ucs2be_text.txt"),
    ucs2leFile = path.resolve("bin/test/cordova/unit/data/ucs2le_text.txt"),
    helloWorld = "Hello World";

describe("Encoded Buffer data to String", function () {
    it("Ascii text to String", function () {
        // Read text file encoded in ascii
        var fileData = fs.readFileSync(asciiFile);
        expect(utils.bufferToString(fileData)).toEqual(helloWorld);
    });

    it("Utf8 text to String", function () {
        // Read text file encoded in utf8
        var fileData = fs.readFileSync(utf8File);
        expect(utils.bufferToString(fileData)).toEqual(helloWorld);
    });

    it("Ucs2BE text to String", function () {
        // Read text file encoded in 2 byte Unicode big endian
        var fileData = fs.readFileSync(ucs2beFile);
        expect(utils.bufferToString(fileData)).toEqual(helloWorld);
    });

    it("Ucs2LE text to String", function () {
        // Read text file encoded in 2 byte Unicode little endian
        var fileData = fs.readFileSync(ucs2leFile);
        expect(utils.bufferToString(fileData)).toEqual(helloWorld);
    });
});

describe("property wrapper", function () {
    it("wraps a property of an object in an array", function () {
        var obj = {
            prop: "value"
        };

        utils.wrapPropertyInArray(obj, "prop");
        expect(obj.prop[0]).toEqual("value");
    });

    it("does not wrap an array object in an array", function () {
        var obj = {
            prop: ["value"]
        };

        utils.wrapPropertyInArray(obj, "prop");
        expect(obj.prop[0][0]).not.toEqual("value");
        expect(obj.prop[0]).toEqual("value");
    });

    it("does not wrap a property that doesn't exist in the object", function () {
        var obj = {
            prop: "value"
        };

        utils.wrapPropertyInArray(obj, "secondValue");
        expect(obj.secondValue).not.toBeDefined();
    });
});
