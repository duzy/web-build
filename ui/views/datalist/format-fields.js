// -*- javascript -*-
requireCss('./format-fields.css');

var BaseFmt = require('./format-ul').DataListFormatter;

/**
 *  var fmt1 = new DataListFormatFields(function(){
 *    return [ f1, f2, f3 ];
 *  });
 *
 *  var fmt2 = new DataListFormatFields({
 *    fields: function(v) { return [ f1, f2, f3 ]; },
 *    field : function(f,i) { return '<b>' + f + '</b>'; },
 *  });
 */
exports.DataListFormatFields = new Object.Class('DataListFormatFields', BaseFmt, {
    init: function(a) {
        if (a) {
            var isf = Object.isFun;
            isf(a)
                ? ( this.fields = a )
                : ( a.fields && isf(a.fields) && ( this.fields = a.fields ),
                    a.field  && isf(a.field)  && ( this.field  = a.field ) );
        }
    },

    listClass: 'ui-list-fmt-fields',
    itemClass: 'ui-list-fmt-fields-row',

    value: function(v,row,pos) {
        var fs = this.fields(v,row,pos), s = '';
        fs.forEach(function(f,i){
            s += '<span class="ui-list-fmt-fields-cell">'
                + this.field(f,i)
                + '</span>';
        }, this);
        return s;
    },

    fields: function(v/*,row,pos*/) {
        return [v];
    },

    field: function(f,i) {
        return BaseFmt.prototype.value.call(this,f,f,i);
    },
});
