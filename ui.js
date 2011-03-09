(function() {
    var core = require('./ui/core');
    var view = require('./ui/views');
    module.exports = core;
    module.exports.createStylesheet(__requiredCss);
})();
