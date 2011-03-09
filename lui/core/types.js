(function() {

    var proto;

    proto = Object.prototype;

    proto.forEach = proto.forEach || function(action, context) {
	var name;
	for(name in this) {
	    if (!name || this[name] === undefined ||
		!this.hasOwnProperty(name)) {
		continue;
	    }
	    if (action.call(context || object[name], object[name],
			    name) === false) { break; }
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
