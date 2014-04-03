var tailMod = require('file-tail')
,   fs = require ('fs')
,   minimatch = require ('minimatch')
,   events = require ('events')
,   path = require ('path')
;

module.exports.startTailing = function(fd, errCB, ext, interval){
	ext = ext || "*";
	interval = interval || 1000;

	var folderWatcher = new events.EventEmitter()
	, tailObjs = {}
	, tailInit
	, folderInit
	, onErr
	, firstPass = true 
	, start
	, restart
	, pulse
	;

	onErr = function(err) {
		err && errCB(err);
	};

	// -----------------------------------------------------
	// This function starts tailing a file or directory. Recursive.
	// -----------------------------------------------------
	tailInit = function(fd) {
		fs.stat(fd, function(err, stats) {
			onErr(err);
			if (stats.isDirectory()) {
				folderInit(fd + '/');
			}else{
				if (!tailObjs[fd]) {
					var tailObj = tailMod.startTailing(fd);
					tailObjs[fd]=tailObj;
					tailObj.on('line', function(line) {
						folderWatcher.emit('line', line, path.normalize(fd));
					});
					
					// -----------------------------------------------------
					// After the first pass new files will be emitted as
					// if they had grown from 0 bytes
					// -----------------------------------------------------
					if (!firstPass) {
						fs.readFile(fd,function(err, data) {
							if (err) {
								console.log(err);
							} else{
								var lines = data.toString().trim().split('\n');	
								for ( var i = 0; i < lines.length; i++ ){
									folderWatcher.emit('line', lines[i], path.normalize(fd));
								}
							}
						});
					}
				} else {
				}
			}
		});
	};

	// -----------------------------------------------------
	// This function starts tailing all the things in a directory. Recursive.
	// -----------------------------------------------------
	folderInit =  function(fd) {
		var i
		, fdsToTail = []
		;

		fs.readdir(fd, function(err, files) {
			if (!err) {
				for (i = 0; i < files.length; i++) {
					if(minimatch(files[i], ext)){
						fdsToTail.push(fd+"/"+files[i]);
					}
				}
				
				for ( i = 0; i < fdsToTail.length; i++ ) {
					tailInit(fdsToTail[i]);
				}
			}else{
				onErr(err);
			}
		});
	};


	// -----------------------------------------------------
	// Start watching the directory
	// -----------------------------------------------------
	start = function() {
		folderInit(fd);
	}
	start();

	// -----------------------------------------------------
	// Every so often check for new files
	// -----------------------------------------------------
	restart = function() {
		firstPass = false;
		start();
	}
	pulse = setInterval( restart, interval );

	return folderWatcher;
};
