// -*- javascript -*-
(function() {
    var jsp  = require('uglify-js').parser,
        pro  = require('uglify-js').uglify,
        fs   = require('fs'),
        path = require('path'),
        util = require('util'),
        cssom = require('cssom'),
        mime = require('mime'),
        url = require('url'),
        mod = require('module');

    var REQUIRE = 'require';
    var REQUIRE_TEXT = 'requireText'; // uki defined
    var REQUIRE_CSS  = 'requireCss'; // uki defined
    var TO_DATA_URI  = 'toDataUri'; // uki defined
    var PREFIX  = '__module_'; // uki defined

    function compressor() {
    }

    var proto = compressor.prototype = {
        required: {},
        requiredCount: 0,
        requiredAsts: [],
        
        requiredCss: {},
        requiredCssFiles: [],
        requiredCssUsed: false,
        
        currentPath: '',
        searchPaths: [],
        options: {}
    };

    var sate = exports.state = null;
    
    var walker = pro.ast_walker(),
        walkers = {
        "call": function(expr, args) {
            if (expr[0] === 'name' && expr[1] === REQUIRE) {
                var file = resolvePath(args[0][1]);
                   
                if (!state.required[file]) {
                    addFileToAstList(file, true);
                }
                return [this[0], expr, [['num', state.required[file]]] ];
            } else if (expr[0] === 'name' && expr[1] === REQUIRE_TEXT) {
                var file = resolvePath(args[0][1]);
                return ['string', fs.readFileSync(file, 'utf8')];
            } else if (expr[0] === 'name' && expr[1] === REQUIRE_CSS) {
                var file = resolvePath(args[0][1]);
                if (!state.requiredCss[file]) {
                    state.requiredCss[file] = true;
                    state.requiredCssFiles.push(file);
                }
                return ['num', 1];
            }
            return null;
        },
        "name": function(name) {
            if (name === "__dirname") {
                return ['string', path.dirname(state.currentPath)];
            } else if (name === '__filename') {
                return ['string', state.currentPath];
            } else if (name === '__requiredCss') {
                state.requiredCssUsed = true;
                return null;
            }
            return null;
        }
    };
    
    function imagePathToDataUri (filePath) {
        var contentType = mime.lookup( path.extname(filePath) ),
            buffer = fs.readFileSync(filePath);
        return 'data:' + contentType + ';base64,' + buffer.toString('base64');
    }

    function absoluteImagePath (filePath) {
        return filePath.substring(state.options.rootPath.length);
    }
    
    function dataUriCssImages (cssPath, string) {
        return string.replace(/url\(([^)]+)\)/, function(_, filePath) {
            var imagePath = path.join( path.dirname(cssPath), filePath );
            return 'url(' + imagePathToDataUri(imagePath) + ')';
        });
    }

    function addIEBackground (cssPath, style, sourceValue) {
        if (style['*background-image']) return;
        var filePath = sourceValue.match(/url\(([^)]+)\)/)[1],
        url = path.join( path.dirname(cssPath), filePath );
        
        style.setProperty('*background-image', 'url(' + absoluteImagePath(url) + ')');
    }

    function processCssIncludes (cssPath) {
	var code = fs.readFileSync(cssPath, 'utf8');
	var styleSheet = cssom.parse(code);
	styleSheet.cssRules.forEach(function(rule) {
            var style = rule.style;
            if (style.background) {
                var newBg = dataUriCssImages(cssPath, style.background);
                if (newBg != style.background) {
                    addIEBackground(cssPath, style, style.background);
                    style.background = newBg;
                }
            }
            if (style['background-image']) {
                var newBg = dataUriCssImages(cssPath, style['background-image']);
                if (newBg != style['background-image']) {
                    addIEBackground(cssPath, stle, style['background-image']);
                    style['background-image'] = newBg;
                };
            }
        });
	return styleSheet + '';
    }
    
    function resolvePath (filePath) {
	var resolvedPath = mod._findPath(filePath, 
            [path.dirname(state.currentPath)].concat(state.options.searchPaths));
	if (!resolvedPath) throw new Error('Path ' + filePath + ' not found.');
	return fs.realpathSync(resolvedPath);
    }

    function addFileToAstList (filePath, wrap) {
	state.required[filePath] = state.requiredCount++;
	var oldPath = state.currentPath;
	state.currentPath = filePath;
	var text = fs.readFileSync(filePath, 'utf8');
	// remove shebang
	text = text.replace(/^\#\!.*/, '');
	if (wrap) {
            text = '(function(global, module) {var exports = this;' + text + '})';
	}
	var ast = jsp.parse(text);
	var newAst = walker.with_walkers(walkers, function() {
            return walker.walk(ast);
	});
	state.currentPath = oldPath;
	state.requiredAsts[state.required[filePath]] = newAst;
    }

    exports.parse = function(filePath, options) {
	state = exports.state = new compressor();
	filePath = fs.realpathSync(filePath);
	state.currentPath = filePath;
	var newOptions = {};
	options = Object.create(options || {});
	
	options.searchPaths = options.searchPaths ? options.searchPaths : [];
	options.searchPaths = [path.dirname(state.currentPath)]
	    .concat(options.searchPaths);
    
	options.rootPath = options.rootPath ? 
            fs.realpathSync(options.rootPath) : 
            path.dirname(filePath);
        
	state.options = options;
        
	state.requiredAsts = [];
    
	addFileToAstList(filePath, true);
    
	var code = 'var global = this;';
	code    += 'function require(index) { if (!require.cache[index]) {var module = require.cache[index] = {exports: {}}; require.modules[index].call(module.exports, global, module);} return require.cache[index].exports; }\n';
	code    += 'var require_modules = require.modules = []; require.cache = [];';
	var body = jsp.parse(code)[1];
        
	if (state.requiredCssUsed) {
            var code = state.requiredCssFiles.map(function(filePath) {
		return processCssIncludes(filePath);
            }).join('\n');
            body.push( ['var', [['__requiredCss', ['string', code]]]] );
	}

	for (var i=0; i < state.requiredCount; i++) {
            body[body.length] =
		[ 'stat', 
                  ['assign', 
                   true,
                   ['sub',
                    ['name', 'require_modules'],
                    ['num', i]
                   ],
                   state.requiredAsts[i][1][0][1]
                  ]
		];
	};

	body.push(['stat', ['call', ['name', 'require'], [['num', '0']]]]);

	return [ 'toplevel',
		 [
		     [ 'stat',
                       [ 'call',
			 [ 'function', null, [], body ],
			 [ ]
                       ]
		     ]
		 ]
               ];
    }

    exports.compile = function(filePath, options) {
	try {
	    var parseOptions = {
		searchPaths: require.paths
	    };

            var ast = exports.parse(filePath, parseOptions);

            if (true) {
		ast = pro.ast_mangle(ast);
		ast = pro.ast_squeeze(ast);
		ast = pro.ast_squeeze_more(ast);
            }

            var code = pro.gen_code(ast, options);
	} catch (e) {
	    var msg = e.message + ' (in ' + exports.state.currentPath + ')';
            var code = 'alert(' + JSON.stringify(msg) + ')';
	}
	//while (code === undefined) {} // wait for code
	return code;
    };
})();
