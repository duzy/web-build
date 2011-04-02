// -*- javascript -*-
var
dom   = require('../../core/dom'),

formatStart = '<ul>',
formatItem = function(v,r,i) {
    return '<li>' + this.value(v,r,i) + '</li>'
    ;
},
formatValue = dom.escapeHTML,
formatEnd = '</ul>';

exports.DataListFormatter = new Object.Class('DataListFormatter', {
    //init: function(args) {
    //},

    listClass: '',  // string
    itemClass: '',  // string

    start: formatStart, // function or string
    item: formatItem, // function
    value: formatValue, // function
    end: formatEnd, // function or string
});
