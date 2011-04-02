// -*- javascript -*-
//(function() {
requireCss('./datalist/list.css');

var env   = require('../core/env'),
    fun   = require('../core/function'),
    utils = require('../core/utils'),
    dom   = require('../core/dom'),
    event = require('../core/event'),
    build = require('../core/builder').build,

    //Mustache   = require('../tool/mustache').Mustache,
    Base       = require('../core/view/base').Base,
    Focusable  = require('../facet/focusable').Focusable,
    Selectable = require('../facet/selectable').Selectable;
    
var DataList = exports.DataList = new Object.Class(
    'DataList', Base, Focusable, Selectable, {
    init: function(args) {
	this._data = [];
	this._packs = {};
    
	this._packSize  = args.packSize || this._packSize;
    },

    _throttle: 0,
    _debounce: 0,

    //_template: requireText('list/list.html'),
    _formatter: dom.escapeHTML,
    _packSize: 100,
    _renderMoreRows: 60, // Render 60-rows more than the visible zone
    _rowHeight: 0,

    _key: null,
    _changeOnKeys: [],

    $: {
        'formatter packSize renderMoreRows rowHeight key changeOnKeys lastClickIndex'
        : fun.setterN(),

        /**
         * throttle: Do not redraw more often then in value ms
         * debounce: Do redraw only after value ms after last scroll/update
         */
        'debounce throttle': function(name,v) {
            this['_'+name] = v;
            if (v > 0) {
                this._visChanged = fun[name](this._originalVisChanged, this['_'+name]);
            } else {
                this._visChanged = this._originalVisChanged;
            }
        }._, // getterized

        /**
         * Data to render. Data should provide one of the following simple API's:
         * 1. Sync: #slice(from, to) and #length. Any native JS array can do this.
         * 2. Async: #loadRange(from, to, callback), and length. 
         *    Please note that syncronous data fetching like selectedRow will use
         *    #slice(from, to) anyway. So it might be worth to provide #slice to.
         * 
         * Data may also provide #sampleRow property. It will be used to calculate
         * row hight if rowHeight is not provided. 
         * If there's no sampleRow slice(0, 1)[0] will be used.
         */
        data: function(d) {
            this._data = d;
            this._reset();
        }._,

        /**
         * Bind representation to colleciton.
         * #TBD
         */
        binding: function(val) {
            if (this._binding) this._binding.destroy();
            this._binding = val && new require('./list/binding').Binding(this, val.model, utils.extend({ viewEvent: 'change.item' }, val));
            if (val) this.data = val.model;
        }._,

        /**
         * Either a view or view description of the row inline editor. 
         * See view.dataList.Editor for example.
         * 
         * @function
         * @name editor
         */
        editor: function(e) { this._editor = build(e)[0]; }._,
    },

    /**
     * Actual row selected.
     * 
     * Warning! This method will use #slice even for async data
     * @function
     */
    selectedRow: function() {
        var index = this.selectedIndex();
        return index > -1 && this._data.slice(index, index+1)[0];
    },

    /**
     * Array of the the rows selected
     * 
     * Warning! This method will use #slice even for async data
     * @function
     */
    selectedRows: function() {
        var result = [];
        for (var i=0, indexes = this.selectedIndexes(), l = indexes.length; i < l; i++) {
	    var item = this._data.slice(indexes[i], indexes[i]+1)[0];
	    if (item) result.push(item);
        };
        return result;
    },

    /**
     * Redraws the row under the index imideately. If you do not want to redraw the 
     * whole pack this method may provide performance benefit. On the other hand if
     * you change all the data calling #resized might be faster.
     * 
     * Warning! This method will use #slice even for async data
     * @function
     */
    redrawRow: function(index) {
        var item = this._itemAt(index);
        if (!item) return this;
        var pack = this._renderPack(this._data.slice(index, index+1));
        item.parentNode.replaceChild(this._itemWithinPack(pack, 0), item);
        if (this.isSelected(index)) this._setSelected(index, true);
        return this;
    },

    /**
     * Scroll the parent so row at position gets into view
     * 
     * @function
     */
    scrollToPosition: function(position) {
        var pxs  = this._visiblePixels(),
        maxY = (position+1)*this._rowHeight,
        minY = position*this._rowHeight;
        
        if (maxY >= pxs[1]) {
	    this._scrollableParent().scroll(
	        0, maxY - pxs[1] +
		    // hackish overflow to compensate for bottom scroll bar
		    (position === this.data.length - 1 ? 100 : 0)
	    );
        } else if (minY < pxs[0]) {
	    this._scrollableParent().scroll(0, minY - pxs[0]);
        }
        this._visChanged();
        return this;
    },

    /**
     * #TBD
     * Answers if the row should be redraw on the key change
     * @function
     * @name shouldRedrawOnPropChange
     */
    shouldRedrawOnPropChange: function(key) {
        return this.key === key || utils.indexOf(this.changeOnKeys, key) > -1;
    },
    
    /* --------------- Inline editing -------------- */

    /**
     * Is editor open right now?
     * 
     * @function
     * @name editor
     */
    editing: function() {
        return this.editor && this.editor.parent();
    },

    /**
     * Trigger inline editing on the first selected row
     * 
     * @function
     * @name editSelected
     */
    editSelected: function() {
        if (!this.editor) return this;
        this._editorBlur();
    
        var t = this.selectedIndex() * this.rowHeight;
    
        this.dom.appendChild(this.editor.dom);
    
        this.editor
	    .on('finishEdit', this._editorBlur.bindOnce(this))
	    .on('move', this._editorMove.bindOnce(this))
	    .pos({ top: t+'px', left: 0+'px',
	           right: 0+'px', height: this.rowHeight + 'px'
	         })
	    .$visible(true)
	    .parent(this)
	    .edit({ model: this.selectedRow(), modelProp: this.key });
        
        this.lastClickIndex = this.selectedIndex();
        return this;
    },

    /* --------------- Protected API -------------- */
    resized: function() {
        if (this._firstResize()) {
	    this._originalVisChanged();
        } else {
	    this._visChanged();
        }
        return this;
    },

    _reset: function() {
        this._packs.forEach(dom.removeElement);
        this._packs = [];
        this.clearSelection();
        this._allreadyResized = false;
        if (this._scrollableParent())
	    this._scrollableParent().removeListener(
                'scroll', this._scroll.bindOnce(this));
    },

    _createDom: function(args) {
        this._dom = dom.createElement('div', { className: 'ui-list ui-list-blured' });
        this.tabIndex(1);
        this._initSelectable();
        
        // prevent dragging of selection
        this.on('selectstart dragstart', event.preventDefaultHandler);
    },

    triggerSelection: function() {
        this._triggerSelection(true);
        return this;
    },

    _selectionEdit: function(e) {
        this.editSelected();
    },

    _editorBlur: function(e) {
        if (this.editor && this.editor.parent()) {
	    this.editor
	        .parent(null)
	        .removeListener('move', this._editorMove.bindOnce(this))
	        .removeListener('finishEdit', this._editorBlur.bindOnce(this));
	    
	    dom.removeElement(this.editor.dom);
	    if (e && e.remainFocused) this.focus();
        }
    },

    _editorMove: function(e) {
        e.vertical = e.vertical || e.horizontal;
        if (this.moveSelectedIndex(e.vertical)) {
	    this.scrollToPosition(this.selectedIndex());
	    this.triggerSelection();
	    this.editSelected();
        }
    },

    _dataForClipboard: function() {
        return { 'text/plain': this.selectedRows().join("\n") };
    },

    _firstResize: function() {
        if (this._allreadyResized) return false;
        this._calcRowHeight();
        if (this.rowHeight) {
	    this._allreadyResized = true;
	    this._scrollableParent().on('scroll', this._scroll.bindOnce(this));
	    this._updateHeight();
        }
        return true;
    },

    _calcRowHeight: function() {
        if (!this.data.length) {
	    this._rowHeight = 0;
        } else {
	    var sample = utils.prop(this.data, 'sampleRow')
	        || (this.data.slice && this.data.slice(0, 1)[0]) || '',
	    p = this._renderPack([sample]);
	
	    this.dom.appendChild(p);
	    this._rowHeight = p.offsetHeight;
	    this.dom.removeChild(p);
        }
    },

    _updateHeight: function() {
        this.dom.style.height = this.data.length * this.rowHeight + 'px';
        // setTimeout(function(){
        // 	this.dom.style.height = this.data.length * this.rowHeight + 'px';
        // }.bind(this), 0);
    },

    _scroll: function() {
        //setTimeout(function() { this._visChanged(); }.bind(this), 0);
        this._visChanged();
    },

    // you may want to overwrite this for complex scenarios
    _scrollableParent: function() {
        return this.parent();
    },

    _visiblePixels: function() {
        if (!this._scrollableParent()) return [0, 0];
    
        var rect = this.clientRect(true),
        parentRect = this._scrollableParent().clientRect(true),
    
        topOffset = rect.top - parentRect.top,
        height = parentRect.height - Math.max(0, topOffset),
        top = -Math.min(0, topOffset);
    
        return [top, top + height];
    },

    _visibleRows: function() {
        var pxs = this._visiblePixels();
    
        return [
	    pxs[0] / this.rowHeight << 0,
            pxs[1] / this.rowHeight + 0.5 << 0
        ];
    },

    _packsToRender: function() {
        var rows = this._visibleRows();
        return [
            Math.max(0, rows[0] - this._renderMoreRows)
	        / this.packSize << 0,
            Math.min(this.data.length, rows[1] + this._renderMoreRows)
	        / this.packSize << 0
        ];
    },

    _schedulePackRender: function(packN, revision) {
        //setTimeout(function(){
        var from = packN * this.packSize;

        if (this.data.loadRange) {
	    this.data.loadRange(
	        from, this.packSize + from,
	        this._updatePack.bind(this, packN, revision)
	    );
        } else {
	    this._updatePack(packN, revision,
			     this.data.slice(from, from + this.packSize));
        }
        //}.bind(this), 0);
    },
    
    _removePack: function(packN) {
        var pack = this._packs[packN];
        delete this._packs[packN];
        dom.removeElement(pack);
    },

    _formatList: function(rows) {
        var str = '<ul class="ui-list-pack">';
        rows.forEach(function(r, i) {
            str += '<li class="ui-list-row'
                + ((i & 1) ? ' ui-list-row-odd' : '')
                + '">'
                + this._formatRow(r, i)
                + '</li>';
        }, this);
        str += '</ul>';
        return str;
    },

    _formatRow: function(row, pos) {
        return this._formatter(this._key ? utils.prop(row, this._key) : row,
                               row, pos);
    },

    _updatePack: function(packN, revision, rows) {
        this._removePack(packN);
        this._packs[packN] = this._renderPack(rows);
        this._packs[packN].style.top =
	    packN * this.rowHeight * this.packSize + 'px';
        this._packs[packN].__revision = revision;
        this.dom.appendChild(this._packs[packN]);
        this._restorePackSelection(packN);
    },

    _renderPack: function(rows) {
        /*
        var formated = rows.map(function(r, i) {
            return { value: this._formatRow(r, i), index: i, even: i & 1 };
        }, this);

        return dom.fromHTML(Mustache.to_html(
            this._template,
            { rows: formated }
        )); */
        return dom.fromHTML(this._formatList(rows));
    },
    
    _restorePackSelection: function(packN) {
        var indexes = this._selectedIndexes,
        from = packN * this.packSize,
        to   = from + this.packSize;

        var currentSelection = utils.binarySearch(from, indexes);
        currentSelection = Math.max(currentSelection, 0);

        while(indexes[currentSelection] !== null && indexes[currentSelection] < to) {
            var position = indexes[currentSelection];
            this._setSelected(position, true);
            currentSelection++;
        }
    },

    /** Selectable API */
    _selectionFocus: function(e) {
        this.removeClass('ui-list-blured');
        Selectable._selectionFocus.call(this, e);
    },

    _selectionBlur: function(e) {
        this.addClass('ui-list-blured');
        Selectable._selectionBlur.call(this, e);
    },

    _setSelected: function(position, state) {
        var item = this._itemAt(position);
        if (item) {
            dom.toggleClass(item, 'ui-list-row-selected', state);
        }
    },

    _itemAt: function(position) {
        var packN = (position / this.packSize) << 0,
        pack = this._packs[packN];
    
        if (!pack) return null;
        return this._itemWithinPack(pack, position - this.packSize * packN);
    },

    _itemWithinPack: function(pack, packPos) {
        return pack.childNodes[packPos];
    },

    _visChanged: function() {
        var packNs = this._packsToRender(),
        revision = env.guid++;
    
        for (var packN=packNs[0]; packN <= packNs[1]; packN++) {
            if (!this._packs[packN]) {
                this._schedulePackRender(packN, revision);
            } else {
                this._packs[packN].__revision = revision;
            }
        }

        this._packs.forEach(function(p, packN) {
            if (p.__revision != revision) this._removePack(packN);
        }, this);
    },

    domForEvent: function(type) {
        return Focusable._domForEvent.call(this, type) ||
            Base.prototype.domForEvent.call(this, type);
    },
}),
proto = DataList.prototype;
    
// store original version function so we can instance override
// _visChanged in throttle and debounce and then revert back
proto._originalVisChanged = proto._visChanged;
//})();
