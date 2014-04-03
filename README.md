node-folder-tail
================

Recursive Tail -F on a directory. Automatically detects and tails new files.

###Usage

```js
	var mod = require("folder-tail"),
	fd      = "aFolder",
	ft      = mod.startTailing(fd, function(e) {
		console.log(e);
	});
	
	ft.on('line', function(line) {
		console.log(fd + " grew: " + line);
	});
```

###Details

Requiring the module returns an object with one method:

`startTailing(fd, onErr, [ext, interval])`

 * `fd`: A file descriptor for the folder
 * `onErr`: error handler function. Is passed an error object.  Is called every time an error is encountered.
 * `ext` (optional): A string used to filter files (e.g. `'*.log'`  to filter out log files).  You can use any glob expression (see the npm module minimatch for more details).  Defaults to `'*'`.
 * `interval` (optional): Milliseconds to wait before looking for new files.  Defaults to 1000.
 
This method returns an eventEmitter that emits the following events (besides `'error'`)

* `'line'`: passes two strings to listeners; the new line and its associated file descriptor

###Notes

Error handling is not yet finalized/formalized.  Please listen for error events and be careful.

Code contributions, bug reports, etc. are welcome. Just use the normal Github channels.
