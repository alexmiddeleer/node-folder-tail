var mod = require("../index.js")
, fs = require('fs')
, testFiles = [
	'./test/testdir/test1',
	'./test/testdir/test2',
	'./test/testdir/test3',
	'./test/testdir/testdir2/test4'
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
		notDone = 3;
		setTimeout(function() {
			if(!notDone) throw "too slow";
		}, 1000);
		
		watcher.on('line', function(line) {
			console.log('saw a line: ' + line);
			notDone--;
			if (!notDone) {done();}
		});

		fs.appendFile(testFiles[0],'a');
		fs.appendFile(testFiles[1],'b');
		fs.appendFile(testFiles[2],'c');
	});
});

after(function() {
	for (var i = 0; i < testFiles.length; i++) {
		fs.unlink(testFiles[i]);
	}
});
