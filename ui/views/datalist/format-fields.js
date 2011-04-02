// -*- javascript -*-
requireCss('./format-fields.css');

var BaseFmt = require('./format-ul').DataListFormatter;

exports.DataListFormatFields = new Object.Class('DataListFormatFields', BaseFmt, {
    init: function(f) {
        f && ( this.fields = f );
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

    fields: function(v,row,pos) {
        return [v];
    },

    field: function(f,i) {
        return BaseFmt.prototype.value.call(this,f,f,i);
    },
});
