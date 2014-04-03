var mod = require("folder-tail")

var fd = process.argv[2],
ft     = mod.startTailing(fd, function(e) {
	console.log(e);
});

ft.on('line', function(line, fd) {
	console.log(fd + " grew: " + line);
});
