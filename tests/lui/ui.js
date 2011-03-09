var ui = require('lui');

try {
    var root = ui([
	{ view: 'SplitPane', pos: 'l:0 t:0 r:0 b:0',
	  init: {
	      vertical: true,
	      //handleWidth: 1.5,
	      leftMin: '20%', rightMin: '80%',
	  },
	  leftChildViews: [
	      { view: 'Container',
		childViews: [
		    { view: 'Flow', horizontal: true,
		      childViews: [
			  { view: 'Button', label: 'test', id:'cmd' },
		      ]
		    },
		    { view: 'Text', html: requireText('../dinthelp.html') }
		]
	      }
	  ],
	  rightChildViews: [
	      { view: 'Container', pos: 'l:5px t:5px r:0 b:0',
		addClass: 'scrollable',
		childViews: [
		    { view: 'Header', text: 'Post', size: 'small',
		      pos: 'l:0 t:0 w:100% h:25px',
		    },
		    { view: 'RichEdit', id: 'rich', name: 'rich',
		      pos: 'l:0 t:26px w:95% h:90%',
		    },
		    { view: 'Button', text: 'Publish',
		      pos: 'l:0 t:95% w:1 h:25px',
		    },
		]
	      },
	  ]
	}
    ]).attach();

    ui('#cmd').on('click', function() { alert('LiteUI '+ui.version); });
} catch(e) {
    alert(e);
}
