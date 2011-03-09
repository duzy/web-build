requireCss('./views/uki.css');

var view = require('./core/view.js'),
    utils = require('./core/utils.js');

utils.extend(
    view,
    
    require('./facet/focusable.js'),
    require('./facet/selectable.js')

    //require('./views/button.js'),
    //require('./views/flow.js'),
    //require('./views/nativeControl.js'),
    //require('./views/text.js'),
    //require('./views/splitPane.js'),
    //require('./views/dataList.js'),

    //require('./views/rich.js')
);

view.extend = function(v) { utils.extend(view, v); }

module.exports = view;
