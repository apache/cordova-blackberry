/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var childProcess = require('child_process'),
    flag = false,
    helpFunc,
    codeCompare;

function executeScript(shellCommand) {
    helpFunc = childProcess.exec(shellCommand, function (error, stdout, stderr) {
    	if (error) {
        	codeCompare = error.code;
    	}
    }); 
    helpFunc.on('exit', function (exitCode) {
        codeCompare = exitCode; 
		flag = true;
    });
}

describe('start check_reqs tests', function () {
    it ('test output if QNX_HOST,_TARGET exists', function () {
		executeScript('source /Applications/bbndk/bbndk-env.sh; bin/check_reqs');
		waitsFor(function () {
            return flag;
        });
    	runs(function () {
        	flag = false;
			expect(codeCompare).toEqual(0);
    	});
	});

	it('test output if QNX_HOST,_TARGET does not exist', function () {
		executeScript('unset QNX_HOST; unset QNX_TARGET; bin/check_reqs');
		waitsFor(function () {
			return flag;
		});
		runs(function (){
			flag = false;
			expect(codeCompare).toEqual(255);
		});
	});
});
