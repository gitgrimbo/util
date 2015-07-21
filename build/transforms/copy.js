define([
	"../buildControl",
	"../process",
	"../fileUtils",
	"../fs",
	"dojo/has"
], function(bc, process, fileUtils, fs, has) {

	function copyFileWithUtilFs(src, dest, cb) {
		if (has("is-windows")) {
			src = fileUtils.normalize(src);
			dest = fileUtils.normalize(dest);
		}
		// Use no encoding, as the file may be text or binary.
		fs.readFile(src, undefined, function(err, contents) {
			if (err) {
				cb(err);
			} else {
				fs.writeFile(dest, contents, undefined, cb);
			}
		});
	}

	return function(resource, callback) {
		fileUtils.ensureDirectoryByFilename(resource.dest);
		var
			cb = function(code, text) {
				callback(resource, code);
			},
			errorMessage = "failed to copy file from \"" + resource.src + "\" to \"" + resource.dest + "\"",
			args = has("is-windows") ? ["cmd", "/c", "copy", fileUtils.normalize(resource.src), fileUtils.normalize(resource.dest), errorMessage, bc, cb] : ["cp", resource.src, resource.dest, errorMessage, bc, cb];

		// grimbo
		if (bc.useFsCopy) {
			copyFileWithUtilFs(resource.src, resource.dest, cb);
			return callback;
		}

		process.exec.apply(process, args);
		return callback;
	};
});
