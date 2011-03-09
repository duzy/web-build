var sys = require('sys');

function Fun() {}

Fun.prototype.foo = function() {}
Fun.prototype.bar = function() {}
Fun.prototype.name = "foo";

var fun = new Fun;

sys.print("fun instanceof Fun: ", fun instanceof Fun, "\n");
sys.print("typeof fun: ", typeof fun, "\n");

for(a in fun) {
    sys.print("fun.", a, " = ", fun[a], "\n");
}

sys.print("\nFields in Object: \n");
for (a in Object) {
    sys.print("Object.", a, " -> ", typeof Object[a], "\n");
}

sys.print("\nFields in module: \n");
for (a in module) {
    sys.print("module.", a, " -> ", typeof module[a], "\n");
}

sys.print("\nFields in 'sys': \n");
for (a in sys) {
    sys.print("sys.", a, " -> ", typeof sys[a], "\n");
}

