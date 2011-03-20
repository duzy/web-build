// -*- javascript -*-
var cli    = require("cli");

/*var flags =*/ cli.parse({
    output:     ['o', 'Set compiled output file', 'string'],
    debug:      ['d', 'Build a "debug" version for debugging in browsers']
});

var fs     = require("fs"),
    path   = require("path"),
    sys    = require("sys");

require.paths.unshift(__dirname);
require.paths.unshift("/home/duzy/open/uki/src");

function makeHtmlCode(title, js, debugmode) {
    var code = '<!DOCTYPE html>';
    code    += '<html><head>';
    code    += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> ';
    code    += '<title>' + title + '</title>';

    if (debugmode) {
        //code+= '<script lang="javascript" src="'+ js +'"></script>';
    }

    code    += '</head>';
    code    += '<body><div id="main"></div>'

    if (!debugmode) {
        code+= '<script lang="javascript">' + js + '</script>';
    }

    code    += '</body></html>'
    return code;
}

cli.main(function(args, flags) {
    if (args.length == 0) {
	sys.error("No input file.");
	return;
    }

    var inname = args[0];
    /*
    if (!path.exists(inname)) {
        sys.error("Input file not exists: " + inname);
        return;
    }
    */

    var outname = flags.output || "a.html";
    var ext = path.extname(outname);
    var name = path.basename(outname, ext);

    var title = path.basename(inname, path.extname(inname));

    var codegen_options = {
	ascii_only: false,
	beautify: false,
	indent_level: 4,
	indent_start: 0,
	quote_keys: false,
	space_colon: false
    };

    var comp = require("compressor");
    var code = comp.compile(inname, codegen_options);
    if (!code || code == "") {
	sys.error('No code generated.');
	return;
    }

    switch (ext.toLowerCase()) {
    case ".js":
	if (outname == path.basename(args[0])) {
	    name = name + ".compiled"
	}
	break;
    case ".html":
	code = makeHtmlCode(title, code, flags.debug);
	break;
    default:
	sys.error('Unsupported extname "' + ext + '".');
	return;
    }

    fs.writeFileSync(outname, code, "utf8");
});
