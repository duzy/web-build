/**
 * A WYCIWYG editor.
 * 
 * Refs:
 *    1) http://www.w3.org/TR/html5/editing.html
 *    2) https://developer.mozilla.org/en/rich-text_editing_in_mozilla
 *    3) https://developer.mozilla.org/en/Migrate_apps_from_Internet_Explorer_to_Mozilla#Rich_text_editing
 *    4) http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html
 */
//(function(){
requireCss("./rich/rich.css");

var dom  = require('../core/dom'),
    env  = require('../core/env'),
    event= require('../core/event'),
    fun  = require('../core/function'),
    utils= require('../core/utils'),
    view = require('../core/view'),

    Base = require('../core/view/base').Base,
    Focusable = require('../facet/focusable').Focusable;

var RichEdit = new Object.Class(Base, Focusable, {}),
    proto = RichEdit.prototype;

RichEdit.guid = 1;

proto.typeName = 'RichEdit';
proto._frame = null;
proto._doc = null;

proto._createDom = function() {
    var name = 're-' + (RichEdit.guid++);
    this._dom = dom.createElement('iframe', {
	name: name, className: 'ui-richedit'
    });
    //this._dom = dom.createElement('div', {}, [this._iframe]);
}
    
proto.focusableDom = function() { return this._frame || this._dom; }

proto.resized = function() {
    var frame = this._frame = env.root.frames[this._dom.name];
    if (frame) {
	var doc = this._doc = frame.document;
	if (doc.designMode !== 'on') {
	    doc.designMode = 'on'; // on/off
	}
	/*
	if (doc.body.contentEditable &&
	    doc.body.isContentEditable) {
	    doc.body.contentEditable = true;
	}
        */

	// var f = function(e) {
	//     var s = e.mimic ? "mimic\n" : '';
	//     e.forEach(function(value,name){ s += name + ':' + value + "\n"  });
	//     this._test.innerText = s;
	//     //e.stop();
	// }.bind(this);
	// //event.on(doc, 'mousemove', f);
	// //event.on(this._iframe, 'mousemove', f);
	// //event.on(this._dom, 'mousemove', f);
	// event.on(env.doc, 'mousemove', f);
	// event.on(doc, 'mousemove', function(e) {
	//     var s = "<iframe>\n";
	//     e.forEach(function(value,name){ s += name + ':' + value + "\n"  });
	//     this._test.innerText = s;
	//     e.bubbles = false;
	//     e.stop();
	// }.bind(this));
    }
    return this;
}

fun.delegateProp(proto, 'name', '_dom');

proto._command = function(cmd, arg) {
    var doc = this._doc;
    if (doc) {
	doc.execCommand(cmd,false,arg);
    }
}

var commands = [
    'backColor',
    'bold',
    'contentReadOnly',
    'copy',
    'createLink',
    'cut',
    'decreaseFontSize',
    'delete',			
    'enableInlineTableEditing',
    'enableObjectResizing',
    'fontName',
    'fontSize',
    'foreColor',
    'formatBlock',
    'heading',
    'hiliteColor',
    'increaseFontSize',
    'indent',
    'insertBrOnReturn',
    'insertHorizontalRule',
    'insertHTML',
    'insertImage',
    'insertOrderedList',
    'insertUnorderedList',
    'insertParagraph',
    'italic',
    'justifyCenter',
    'justifyLeft',
    'justifyRight',
    'outdent',
    'paste',
    'redo',
    'removeFormat',
    'selectAll',
    'strikeThrough',
    'subscript',
    'superscript',
    'underline',
    'undo',
    'unlink',
    //'useCSS',
    'styleWithCSS'
];
commands.forEach(function(cmd,n) {
    proto[cmd] = function(arg) { this._command(cmd, arg); };
});

proto._content = function(n,v) {
    var doc = this._doc;
    if (doc) {
	if (v !== undefined) doc.body[n] = v;
	else return doc.body[n];
    }
}

proto.html = function(v) { return this._content('innerHTML',v) }
proto.text = function(v) { return this._content('innerText',v) }

exports.RichEdit = RichEdit;
//})();
