(function() {
    var core = require('./ui/core');
    require('./ui/facet');
    require('./ui/views');
    module.exports = core;
    module.exports.createStylesheet(__requiredCss);
})();
