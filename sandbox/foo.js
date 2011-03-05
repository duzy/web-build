var OO = require("./OO.js");
var o = new OO.Foobar("foobar");
o.hi();
o.say(o.name);

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
