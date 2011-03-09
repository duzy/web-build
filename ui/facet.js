var view = require('./core/view.js'),
    utils = require('./core/utils.js');

utils.extend(
    view,
    require('./facet/focusable.js'),
    require('./facet/selectable.js')
);

//module.exports = view;
