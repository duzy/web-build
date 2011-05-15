/**                                                        -*- javascript -*-
 * A WYCIWYG editor.
 * 
 * Refs:
 *    1) http://www.w3.org/TR/html5/editing.html
 *    2) https://developer.mozilla.org/en/rich-text_editing_in_mozilla
 *    3) https://developer.mozilla.org/en/Migrate_apps_from_Internet_Explorer_to_Mozilla#Rich_text_editing
 *    4) http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html
 */
requireCss("./rich/rich.css");

var uki = require('uki'),
env = require('uki-core/env'),
view = require('uki-core/view'),
dom = require('uki-core/dom'),
event = require('uki-core/event'),
fun = require('uki-core/function'),
RichEdit = exports.RichEdit = view.newClass('RichEdit', view.Base, view.Focusable, {
    _doc: null,
    _frame: null,

    _createDom: function() {
        var name = 're-' + (RichEdit.guid++);
        this._iframe = dom.createElement('iframe', { name: name });
        this._dom = dom.createElement('span', {
            className: 'ui-richedit'
        }, [this._iframe]);
    },

    _initPlaceholder: function() {
        if (this._placeholderDom) return;
        var d = this._placeholderDom = dom.createElement('span', {
	    name: 'placeholder' });
        this.dom().insertBefore(d, this.dom().firstChild);

        event.on(d, 'click', fun.bindOnce(function() { this.focus(); }, this));
    },

    focusableDom: function() { return this._frame || this._iframe; },

    _layout: function() {
        // TODO: using _frame.contentWindow.document or _frame.contentDocument
        var frame = this._frame = this._frame || env.root.frames[this._iframe.name];
        if (frame) {
	    var doc = this._doc = frame.document, placeholder = this._placeholderDom;
	    if (doc.designMode !== 'on') {
	        doc.designMode = 'on'; // on/off
	    }
	    /*
	      if (doc.body.contentEditable &&
	      doc.body.isContentEditable) {
	      doc.body.contentEditable = true;
	      }
            */
            
            if (!placeholder) return;
            
            event.on(frame, 'focus blur change keyup', fun.bindOnce(function(e) {
                placeholder.style.display = (e.type !== 'blur')
                    || doc.body.firstChild ? 'none' : '';
            }, this));
            
            with (placeholder.style) {
                //border = '1px solid #E00';
                position = 'absolute';
                color = '#888';
                padding = '5px';
                //padding = this._iframe.style.padding;
                //padding = frame.style.padding;
            }
        }
        return this;
    },
    
    _command: function(cmd, arg) {
        var doc = this._doc;
        if (doc) {
	    doc.execCommand(cmd,false,arg);
        }
    },

    html: function(n,v) {
        var doc = this._doc;
        if (doc) {
            if (v !== undefined) doc.body.innerHTML = v;
            return doc.body.innerHTML;
        }
    },

    text: function(n,v) {
        var doc = this._doc;
        if (doc) {
            if (v !== undefined) doc.body.innerText = v;
            return doc.body.innerText;
        }
    },

    placeholder: function(v) {
        this._placeholder = v;
        this._initPlaceholder();
        this._placeholderDom.innerHTML = v;
    },
}),
proto = RichEdit.prototype;

RichEdit.guid = 1;

fun.delegateProp(proto, 'name', '_iframe');

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
