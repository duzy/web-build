// -*- javascript -*-
var ui = require('ui');

ui.view(
    require('ui/views/text')
);

ui([
    { view: 'Can', style: { border: '1px solid #E11',
                            width: '80%', height: '500px',
                            //overflow: 'hidden',
                          },
      childViews: [
          { view: 'Base', style: { border: '1px solid #EAA',
                                  background: '#EEE',
                                  width: '200px', height: '600px',
                                },
          },
          { view: 'Base', style: { border: '1px solid #AAE',
                                  background: '#DED',
                                  width: '600px', height: '200px',
                                },
            left: '100px',
          },
      ],
    },
]).attach();
