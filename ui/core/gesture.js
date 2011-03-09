//(function(){
    var utils = require('./utils'),
        env = require('./env'),
        event = require('./event');

    var gesture = {
        draggable: null,
        position: null,
        cursor: null
    };

    var handlers = {},
        mark = '__draggesturebound';

    // add single drag set of drag events for an element
    // regardless of the number of listeners
    var addDraggestures = {
        setup: function(el) {
            if (el[mark]) {
                el[mark]++;
            } else {
                el[mark] = 1;
                event.on(el, 'mousedown', dragGestureStart);
            }
        },
        teardown: function(el) {
            el[mark]--;
            if (!el[mark]) {
                event.removeListener(el, 'mousedown', dragGestureStart);
            }
        }
    };

    // drag gestures
    utils.extend(event.special, {
        draggesturestart: addDraggestures,
        draggestureend: addDraggestures,
        draggesture: addDraggestures
    });
    
    function startGesture (el, e) {
        if (gesture.draggable) return;
        gesture.draggable = e.draggable || el;
        if (e.cursor) {
            gesture.cursor = env.doc.body.style.cursor;
            env.doc.body.style.cursor = e.cursor;
        }
        event.on(env.doc, 'mousemove scroll', dragGesture);
        event.on(env.doc, 'mouseup dragend', dragGestureEnd);
        event.on(env.doc, 'selectstart mousedown', event.preventDefaultHandler);
    }

    function stopGesture () {
        gesture.draggable = null;
        env.doc.body.style.cursor = gesture.cursor;
        gesture.cursor = null;
        event.removeListener(env.doc, 'mousemove scroll', dragGesture);
        event.removeListener(env.doc, 'mouseup dragend', dragGestureEnd);
        event.removeListener(env.doc, 'selectstart mousedown', event.preventDefaultHandler);
    }

    function dragGestureStart (e) {
        e = event.createEvent(e, {type:'draggesturestart'});
        event.trigger.call(this, e);
        if (!e.isDefaultPrevented()) {
            gesture.position = { x: e.pageX, y: e.pageY };
            startGesture(this, e);
        }
    }

    function dragGesture (e) {
        e = event.createEvent(e, {type:'draggesture'});
        e.dragOffset = {
            x: e.pageX - gesture.position.x,
            y: e.pageY - gesture.position.y
        };
        event.trigger.call(gesture.draggable, e);
	
        if (e.isDefaultPrevented()) stopGesture(gesture.draggable);
    }

    function dragGestureEnd (e) {
        e = event.createEvent(e, {type:'draggestureend'});
        e.dragOffset = {
            x: e.pageX - gesture.position.x,
            y: e.pageY - gesture.position.y
        };
        event.trigger.call(gesture.draggable, e);
	
        stopGesture(gesture.draggable);
    }

    module.exports = gesture;
//})();
