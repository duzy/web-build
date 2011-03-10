// USAGE: build this into a.html

Object.prototype.extend = function(obj) {
    for (a in obj) {
	if (this[a] === undefined) {
	    this[a] = obj[a];
	}
    }
}

Object.prototype.__defineGetter__('typename', function() {
    if (this.__type) return this.__type;
    return typeof this;
});

Array.prototype.__type = 'array'; // instead of 'object'

var doc = window.document;

doc.open();

var ele = doc.createElement('div');
//for (a in ele) { doc.write("<b>"+a+"</b> = "+ele[a]+"</br>"); }

var ViewProto = function() {
    //this.__type = 'ViewProto';
    doc.write("<b>ViewProto</b>: </br>")
};
ViewProto.test = function(x) { alert("ViewProto: "+x) }
ViewProto.dom = function() { return this.prototype.prototype }

var ViewBase = function(name) {
    //this.__type = 'ViewBase';
    doc.write("<b>ViewBase</b>: <i>"+name+"</i></br>")
};

function makeView(ele) {
    ViewProto.prototype = ele;
    ViewBase.prototype = new ViewProto;
    ViewBase.prototype.extend(ViewProto);
    ViewProto.prototype = null;
    var v = new ViewBase(ele.tagName);
    return v;
}

var v = makeView(ele);

doc.write("[].typename: "+[].typename+"</br>");
doc.write("{}.typename: "+{}.typename+"</br>");
doc.write("''.typename: "+''.typename+"</br>");
doc.write("(0).typename: "+(0).typename+"</br>");
doc.write("(function(){}).typename: "+(function(){}).typename+"</br>");
doc.write("view type: "+v.typename+"</br>");
doc.write("ele.test: "+ele['test']+"</br>");
doc.write("view.test: "+v['test']+"</br>");

for(a in v) {
    doc.write("v.<b>"+a+"</b> = <u>"+v[a]+"</u>"
	      +" <i>(from ele: <b>"+(ele[a] !== undefined)+"</b>)</i></br>");
}

doc.close();
