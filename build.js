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

function makeHtmlCode(title, js) {
    var code = '<!DOCTYPE html>';
    code    += '<html><head>';
    code    += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> ';
    code    += '<title>' + title + '</title>';
    code    += '</head>';
    code    += '<body><div id="main"></div>'
    code    += '<script lang="javascript">' + js + '</script>';
    code    += '</body></html>'
    return code;
}

function makeDebugHtmlCode(title, state) {
    var code = '<!DOCTYPE html>';
    code    += '<html><head>';
    code    += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> ';
    code    += '<title>' + title + '</title>';
    code    += '</head>';
    code    += '<body>' + "\n";

    var mpaths = '', paths = state.requiredModulePaths;
    paths.forEach(function(m){
        mpaths += "mpaths['" + m[0] + "'] = '" + m[1] + "';\n";
    });

    code += '<script lang="javascript">'
        + 'var module = {}, exports = module.exports = {}, mpaths = {};' + "\n"
        + mpaths
        + 'function requireCss() {};'
        + 'function requireText() {};'
        + 'function require(id) { if (mpaths[id])'
        +    'return require.cache[mpaths[id]].exports;'
        + '};'
        + 'require.cache = [];'
        + 'require.init = function(p) {'
        +    'module.name = p;'
        +    'require.cache[p] = { exports: {} };'
        +    'exports = module.exports = require.cache[p].exports;'
        +    ''
        + '};'
        + '</script>' + "\n";

    var mids = state.requiredModules;
    mids.forEach(function(p){
        code += '<script lang="javascript">'
            + 'require.init("' + p + '");'
            + '</script>' + "\n";
        code += '<script lang="javascript" src="file://'+ p +'"></script>' + "\n";
    });
    
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

    if (flags.debug) {
        var code = makeDebugHtmlCode(title, comp.state);
        sys.print(code);
        fs.writeFileSync(name + '.html', code, "utf8");
        return;
    }

    switch (ext.toLowerCase()) {
    case ".js":
	if (outname == path.basename(args[0])) {
	    name = name + ".compiled"
	}
	break;
    case ".html":
	code = makeHtmlCode(title, code);
	break;
    default:
	sys.error('Unsupported extname "' + ext + '".');
	return;
    }

    fs.writeFileSync(outname, code, "utf8");
});
