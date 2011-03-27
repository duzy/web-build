// -*- javascript -*-
var ui = require('ui');

ui([
    { view: 'Can', style: { border: '1px solid #E11',
                            //width: '80%', height: '500px',
                            //overflow: 'hidden',
                          },
      id: 'main',
      left: '10px', top: '10px', right: '50%', bottom: '10px',
      childViews: [
          { view: 'Base', style: { border: '1px solid #EAA',
                                   background: '#EEE',
                                   width: '200px', height: '600px',
                                },
            id: 'view1',
          },
          { view: 'Base', style: { border: '1px solid #AAE',
                                   background: '#DED',
                                   //width: '600px',
                                   //height: '200px',
                                 },
            id: 'view2',
            left: '100px', top: '100px',
            width: '300px', height: '200px',
          },
      ],
    },
]).attach();

var main  = ui('#main')[0];
var view1 = ui('#view1')[0];
var view2 = ui('#view2')[0];

/*
main.left = '10px';
main.top = '10px';
main.right = '50%';
main.bottom ='10px';
*/
view1.html = 'rect: '
    + main.left.typename + ', '
    + main.top + ', '
    + main.right + ', '
    + main.bottom + ';'
;

var r = view2.clientRect();
view2.html += '<br/>rect: '
    + r.left + ', '
    + r.top + ', '
    + r.width + ', '
    + r.height
    + ' (' + view2.left + ', ' + view2.top + ', ' +
    view2.width + ',' + view2.height + ')'
;

view2.text = view2.className;
view2.alt = 'alt...';
view2.title = 'blah ...';

