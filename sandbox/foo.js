var OO = require("./OO");
var o = new OO.Foobar("foobar");
o.hi();
o.say(o.name);

var prod = new OO.ConcreteProduct('foo','A');
o.say("product: ", prod.name, ", ", prod.type);

// o.name = "xxx"; // error: Cannot set property name of #<Foobar> which has only a getter

function M(name) {
    if (name) {
        this.name = name;
    }
};

M.prototype = {
    name: "xx"
};

var m = new M;
var mm = new M("mm");
o.say(m.name);
o.say(mm.name);
