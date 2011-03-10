(function() {
    require('./ui/core/types');

    var core = require('./ui/core');
    var dom  = require('./ui/core/dom');
    require('./ui/facet');
    require('./ui/views');
    dom.createStylesheet(__requiredCss);
    module.exports = core;
})();
