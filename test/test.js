var mod = require("../index.js")
, fs = require('fs')
, testFiles = [
	'./test/testdir/test1',
	'./test/testdir/test2',
	'./test/testdir/test3',
	'./test/testdir/testdir2/test4',
	'./test/testdir/test5',
	'./test/testdir/testdir2/test6'
]
, notDone
;

fs.appendFileSync(testFiles[0],'a');
fs.appendFileSync(testFiles[1],'b');
fs.appendFileSync(testFiles[2],'c');
fs.appendFileSync(testFiles[3],'d');

var watcher = mod.startTailing('./test/testdir/',"*");

describe('Basic tests', function() {

	it('should detect four changes',function(done) {
		console.log("Starting test 1");
		notDone = 4;
		setTimeout(function() {
			if(!notDone) throw "too slow";
		}, 2000);
		
		watcher.on('line', function(line) {
			console.log('saw a line: ' + line);
			notDone--;
			if (!notDone) {
				watcher.removeAllListeners();
				console.log("listeners removed");
				done();
			}
		});

		// Wait a moment to make sure watcher is fully initialized
		setTimeout(function() {
			fs.appendFile(testFiles[0],'a');
			fs.appendFile(testFiles[1],'b');
			fs.appendFile(testFiles[2],'c');
			fs.appendFile(testFiles[3],'d');
		}, 100);
	});

	it('should detect a change in a new file',function(done) {
		console.log("Starting test 2");
		notDone = 2;
		setTimeout(function() {
			if(!notDone) throw "too slow";
		}, 2000);
		
		watcher.on('line', function(line) {
			console.log('saw a line: ' + line);
			notDone--;
			if (!notDone) {
				watcher.removeAllListeners();
				console.log("listeners removed");
				done();
			}
		});

		// Wait a moment to let things settle...
		setTimeout(function() {
			fs.appendFile(testFiles[4],'xyz');
			fs.appendFile(testFiles[5],'xyz');
		}, 100);
	});
});

after(function() {
	for (var i = 0; i < testFiles.length; i++) {
		fs.unlink(testFiles[i]);
	}
});
