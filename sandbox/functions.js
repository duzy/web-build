var sys = require('sys');

var args = ['a', 'b', 'c'];

(function() {
    sys.print("call: "+this, "\n");
}).call("foo");

(function(a,b,c) {
    sys.print("apply: "+this+"(" + a+","+b+","+c + ")", "\n")
}).apply("foo", args)

args.test = function(a,b,c) {
    sys.print("apply: ["+this+"].test("+a+","+b+","+c+")", "\n");
}

args['test'].apply(args, args);
