(function main() {
    //var uki = require("uki");
    var sys = require("sys");

    function Foobar(name) {
        if (name) {
            this._name = name;
        }
    }

    /* ========== Setter and Getter ========== */
    // ref: https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Working_with_Objects#Defining_Getters_and_Setters

    var proto = Foobar.prototype = {
        _name: null,
        get name() { return this._name },
        //set name(v) { this._name = v }
    };
    //proto.__defineGetter__("name", function(){ return this._name })

    /* ========== Methods ========== */
    proto.hi = function() {
        sys.print("hi, ", this._name, "\n");
    };

    proto.say = function() {
        for (n = 0; n < arguments.length; ++n) {
            process.stdout.write(arguments[n]);
        }
        process.stdout.write("\n");
    };

    exports.Foobar = Foobar;
})();


// == Inheritance ==================================
(function(){

    // Base
    function NamedObject(name) {
        this.name = name;
    }

    // Intermedia Base
    function Product(name, type) {
	NamedObject.call(this, name);
        this.type = type;
    }
    Product.prototype = new NamedObject();

    // Concrete Class
    function ConcreteProduct(name,type) {
	Product.apply(this, arguments);
    }
    ConcreteProduct.prototype = new Product();

    exports.ConcreteProduct = ConcreteProduct;
})();
