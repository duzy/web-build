// -*- javascript -*-
var ui = require('ui');

ui.view(
    require('ui/views/listview')
);

var s = 'abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890';
s = s + s + s + s + s + s + s + s + s + s + s + s + s + s + s;

var data = s.split('');

ui([
    { view: 'Can', style: { width: '100%', height: '300px',
                            'overflow-y': 'auto', 'overflow-x': 'hidden',
                          },
      childViews: [
          { view: 'ListView', style: { 'border': '1px solid #E11',
                                       width: '99.9%', height: '500px',
                                     },
          },
      ],
    },
]).attach();
