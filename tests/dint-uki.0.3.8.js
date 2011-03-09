var uki = require('uki.0.3.8').uki;
  
uki({ view: 'HSplitPane', rect: '0 0', anchors: 'left top right bottom',
      leftMin: 200, rightMin: 300, //handlePosition: 300, 
      leftChildViews: [
	  { view: 'Button', rect: '10 10 100 25', anchors: 'top left',
	    text: 'foo' }
      ],
      rightChildViews: [
	  { view: 'VSplitPane', rect: '0 0 300 0', vertical: true,
	    anchors: 'left top right bottom',
	    topChildViews: {
		view: 'TextField', rect: '10 10 280 24',
		anchors: 'top left', value: '0', id: 'field'
	    },
	    bottomChildViews: {
		view: 'TextField', rect: '400 500',
		anchors: 'top left', value: 'abc',
	    }
	  }
      ]
}).attachTo( window, '0 0' );
