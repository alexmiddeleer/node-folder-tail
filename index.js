var tailMod = require('file-tail')
,   fs = require ('fs')
,   minimatch = require ('minimatch')
,   events = require ('events')
;

module.exports.startTailing = function(fd, errCB, ext){
	ext = ext || "*";

	var folderWatcher = new events.EventEmitter()
	, tailObjs = {}
	, tailInit
	, folderInit
	, onErr
	, firstPass = true 
	;

	onErr = function(err) {
		err && errCB(err);
	};

	// -----------------------------------------------------
	// This function starts tailing a file or directory. Recursive.
	// -----------------------------------------------------
	tailInit = function(fd) {
		// console.log('in tailInit, inspecting file...' + fd);
		fs.stat(fd, function(err, stats) {
			onErr(err);
			if (stats.isDirectory()) {
				folderInit(fd + '/');
			}else{
				if (!tailObjs[fd]) {
					// console.log('in tailInit, starting to tail file...' + fd);
					var tailObj = tailMod.startTailing(fd);
					tailObjs[fd]=tailObj;
					tailObj.on('line', function(line) {
						folderWatcher.emit('line', line);
					});
					// -----------------------------------------------------
					// After the first pass new files will be emitted as
					// if they had grown from 0 bytes
					// -----------------------------------------------------
					if (!firstPass) {
						// console.log('Found a new file, not in first pass so emitting lines');
						fs.readFile(fd,function(err, data) {
							if (err) {
								console.log(err);
							} else{
								var lines = data.toString().trim().split('\n');	
								for( var i = 0; i < lines.length; i++ ){
									folderWatcher.emit('line', lines[i]);
								}
							}
						});
					}
				} else {
					// console.log("in tailInit already watching " + fd);
				}
			}
		});
	};

	// -----------------------------------------------------
	// This function starts tailing all the things in a directory. Recursive.
	// -----------------------------------------------------
	folderInit =  function(fd) {
		// console.log('in folderInit, tailing folder...' + fd);

		var i
		, fdsToTail = []
		;
		fs.readdir(fd, function(err, files) {
			onErr(err);
			if (!err) {
				for (i = 0; i < files.length; i++) {
					if(minimatch(files[i], ext)){
						fdsToTail.push(fd+"/"+files[i]);
					}
				}
				
				for (i = 0; i < fdsToTail.length; i++) {
					tailInit(fdsToTail[i]);
				}
			}
		});
	};


	// -----------------------------------------------------
	// Start watching the directory
	// -----------------------------------------------------
	var start = function() {
		folderInit(fd);
	}
	start();

	// -----------------------------------------------------
	// Every so often check for new files
	// -----------------------------------------------------
	var restart = function() {
		// console.log("restarting");
		firstPass = false;
		start();
	}
	var pulse = setInterval( restart, 1000 );

	return folderWatcher;
};
