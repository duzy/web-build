(function() {

    var proto = Object.prototype;
    var hasOwnProperty = proto.hasOwnProperty;

    proto.forEach = proto.forEach || function(action, context) {
	var name;
	for(name in this) {
	    if (hasOwnProperty.call(this, name)) {
		action.call(context, this[name], name, this);
	    }
	}
    };

    proto = Array.prototype;

    proto.forEach = proto.forEach || function(action,context) {
	for (var i=0, n = this.length; i < n; i++) {
	    if (i in this) {
		action.call(context, this[i], i, this);
	    }
	}
    };

})();
