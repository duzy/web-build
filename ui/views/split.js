requireCss('./split/split.css');

var fun   = require('../core/function'),
    utils = require('../core/utils'),
    view  = require('../core/view'),
    event = require('../core/event'),
    dom   = require('../core/dom'),
    build = require('../core/builder').build,

    Mustache  = require('../tool/mustache').Mustache,
    Can = require('../core/view/can').Can,
    Focusable = require('../facet/focusable').Focusable;


var Split = new Object.Class(Can, Focusable, {
    typeName: 'Split',
    init: function(initArgs) {
	this._vertical = initArgs.vertical || this._vertical;
	this._handleWidth = initArgs.handleWidth || this._handleWidth;
	this._fixed = initArgs.fixed || this._fixed;
	this._originalWidth = 0;
	this._exts = [];
    },
}),
proto = Split.prototype;

proto._throttle = 0; // do not try to render more often than every Xms
proto._handlePosition = 200;
proto._leftSpeed = 0;
proto._rightSpeed = 1;
proto._handleWidth = 1;
proto._leftMin = 100;
proto._rightMin = 100;
proto._vertical = false;
proto._fixed = false;

fun.addProps(proto, ['leftMin', 'rightMin', 'leftSpeed', 'rightSpeed', 'throttle']);
proto.topMin = proto.leftMin;
proto.bottomMin = proto.rightMin;
proto.topSpeed = proto.leftSpeed;
proto.bottomSpeed = proto.rightSpeed;

/**
* @function
* @fires event:handleMove
* @name view.Split#handlePosition
*/
fun.addProp(proto, 'handlePosition', function(val) {
    if (this._x_width()) {
        // store width after manual (drag or program) position change
        this._prevWidth = this._x_width();

        this._prevPosition = this._handlePosition = this._normalizeHandlePosition(val);
        // resize imidiately
        this.resized();
    } else {
        this._handlePosition = val;
    }
});

proto._normalizeHandlePosition = function(pos) {
    pos = Math.min(pos, this._x_width() - this.rightMin() - this.handleWidth()); // can't move to far to the right
    pos = Math.max(pos, this.leftMin()); // can't move to far to the left
    return pos;
};

proto._moveHandle = function() {
    setTimeout(function() {
	this._handle.style[this._x_leftName()] = this.handlePosition() + 'px';
    }.bind(this), 0);
};

/**
 * Positions of additional drag zones
 */
proto.extPositions = function(positions) {
    if (positions === undefined) {
        return this._exts.map(function(ext) {
            return this._styleToPos(ext.style);
        }, this);
    }

    this._exts.forEach(function(ext) {
        this._handle.removeChild(ext);
    }, this);

    this._exts = positions.map(function(pos) {
        var ext = dom.createElement('div', {
            className: 'ui-split-handle-ext'
        });
        pos = this._expandPos(pos);
        this._applyPosToStyle(pos, ext.style);
        this._handle.appendChild(ext);
        return ext;
    }, this);
    return this;
};

proto.handleWidth = function() { return this._handleWidth; };
proto.vertical = function() { return this._vertical; };

/**
 * Treat all splitPanes as vertical (pane|pane)
 * Use _x_methods to adjust to horizontal layout
 */
proto._x_width = function() {
    return this.vertical() ? this.dom().offsetWidth : this.dom().offsetHeight;
};

proto._x_widthName = function() { return this.vertical() ? 'width' : 'height'; };
proto._x_leftName = function() { return this.vertical() ? 'left' : 'top'; };
proto._x_type = function() { return this.vertical() ? 'v' : 'h'; };
proto._x_xName = function() { return this.vertical() ? 'x' : 'y'; };

proto._createHandle = function() {
    var handle = dom.fromHTML(Mustache.to_html(
        requireText('split/handle.html'),
        { type: this._x_type() }
    ));

    if (this.handleWidth() > 1) {
        handle.style[this._x_widthName()] = this.handleWidth() + 'px';
    } else {
        handle.className += ' ' + 'ui-split-handle_thin';
    }

    if (this._fixed) {
	handle.style['cursor'] = 'default';
    } else {
	handle.style['cursor'] = this.vertical() ? 'col-resize' : 'row-resize';
	[
	    'draggesturestart', 'draggesture', 'draggestureend'
	].forEach(function(name) {
	    event.on(handle, name, this['_' + name].bind(this));
	}, this);
    }

    return handle;
};

proto._createDom = function() {
    this._dom = dom.createElement('div', { className: 'splitPane' });

    build([
        { view: 'Can', addClass: 'ui-split-container ui-split-container_left' },
        { view: 'Can', addClass: 'ui-split-container ui-split-container_right' }
    ]).appendTo(this);

    this._dom.appendChild(this._handle = this._createHandle());
};

proto._scheduleChildResize = function() {
    setTimeout(function(){ this._resizeChildViews(); }.bind(this), 0);
};

proto._resizeSelf = function() {
    this._moveHandle();

    if (!this._prevWidth) {
        // store and forget
        this._prevWidth = this._x_width();
        this._prevPosition = this.handlePosition();
    } else {
        this._handlePosition = this._normalizeHandlePosition(this._calcDesiredPosition());
        this._moveHandle();
        this._scheduleChildResize();
    }
};

proto._calcDesiredPosition = function() {
    var newWidth = this._x_width(),
        diff = newWidth - this._prevWidth,
        totalSpeed = this.leftSpeed() + this.rightSpeed(),
        leftDiff = this.leftSpeed()/(totalSpeed || 1)*diff;

    return this._prevPosition + leftDiff;
};

proto._draggesturestart = function(e) {
    e.cursor = dom.computedStyle(this._handle, null).cursor;
    this._positionBeforeDrag = this.handlePosition();
};

proto._draggesture = function(e) {
    this._updatePositionOnDrag(e);
};

proto._draggestureend = function(e) {
    this._updatePositionOnDrag(e, true);
    // use new position as a base for next resize
    this._prevPosition = this.handlePosition();
    this._prevWidth = this._x_width();
};

proto._updatePositionOnDrag = function(e, stop) {
    var pos = this._positionBeforeDrag + e.dragOffset[this._x_xName()];
    this._handlePosition = this._normalizeHandlePosition(pos);

    this._moveHandle();
    this._scheduleChildResize();
    // setTimeout(function(){
    // 	this._moveHandle();
    // 	this._scheduleChildResize();
    // }.bind(this), 0);

    this.trigger({
        type: stop ? 'handleStop' : 'handleMove',
        target: this,
        handlePosition: this._handlePosition,
        dragPosition: pos
    });
};


/**
* @function
* @name view.Split#topChildViews
*/
/**
* @function
* @name view.Split#leftChildViews
*/
proto.topChildViews = proto.leftChildViews = function(views) {
    return this._childViewsAt(0, views);
};

/**
 * @function
 * @name view.Split#rightChildViews
 */
/**
 * @function
 * @name view.Split#bottomChildViews
 */
proto.bottomChildViews = proto.rightChildViews = function(views) {
    return this._childViewsAt(1, views);
};

proto._childViewsAt = function(i, views) {
    if (views === undefined) return this._childViews[i].childViews();
    this._childViews[i].childViews(views);
    return this;
};

proto._leftPos = function() {
    var pos = { left: '0px', top: '0px' };
    pos[this._x_widthName()] = this.handlePosition() + 'px';
    pos[this.vertical() ? 'bottom' : 'right'] = '0px';
    return pos;
};

proto._rightPos = function() {
    var pos = { bottom: '0px', right: '0px' };
    pos[this._x_leftName()] = this.handlePosition() + this.handleWidth() + 'px';
    pos[this.vertical() ? 'top' : 'left'] = '0px';
    return pos;
};

proto._resizeChildViews = function() {
    this._childViews[0].pos(this._leftPos()).resized();
    this._childViews[1].pos(this._rightPos()).resized();
};

exports.Split = Split;
