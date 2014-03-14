var tailMod = require('file-tail')
,   fs = require ('fs')
,   minimatch = require ('minimatch')
,   eventEmitter = require ('events')
;

module.exports.startTailing = function(fd, ext){
	ext = ext || "*"

	var folderWatcher = new events.EventEmitter()
	, fdsToTail = []
	, tailObjs = []
	, tailInit
	, folderInit
	, onErr
	;

	onErr = function(err) {
		err && folderWatcher.emit('error', err);
	};

	// -----------------------------------------------------
	// This function starts tailing a file or directory. Recursive.
	// -----------------------------------------------------
	tailInit = function(fd) {
		fs.stat(fd, function(err, stats) {
			onErr(err);
			if (stats.isDirectory) {
				folderInit(fd)
			}else{
				var tailObj = tailMod.startTailing(fd);
				tailObjs.push(tailObj);
				tailObj.on('line', function(line) {
					folderWatcher.emit('line', line);
				});
			}
		});
	};

	// -----------------------------------------------------
	// This function starts tailing a directory.  Recursive.
	// -----------------------------------------------------
	folderInit =  function(fd) {
		fs.readdir(fd, function(err, files) {
			onErr(err)
			for (var i = 0; i < files.length; i++) {
				if(minimatch(files[i], ext)){
					fdsToTail.push(files[i]);
				}
			}
			
			for (var i = 0; i < fdsToTail.length; i++) {
				tailInit(fdsToTail[i]);
			}
		});
	}

	folderInit(fd);

	folderWatcher.tails = tailObjs; // intentionally exposed
	return folderWatcher;
};

function tailInit (argument) {
	// body...
}
