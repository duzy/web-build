try {

    var ui = require('ui');

    /*
    // for dragging support:
    require('ui/core/gesture');
    */

    ui.view(
	require('ui/views/button'),
	require('ui/views/flow'),
	require('ui/views/list'),
	require('ui/views/rich'),
	require('ui/views/split'),
	require('ui/views/text')
    );

    var root = ui([
	{ view: 'Split', pos: 'l:0 t:0 r:0 b:0', 
	  init: {
	      vertical: true,
	      //handleWidth: 1.5,
	      leftMin: '20%', rightMin: '80%',
	  },
	  leftChildViews: [
	      { view: 'Can',
		childViews: [
		    { view: 'Flow', horizontal: true,
		      childViews: [
			  { view: 'Button', label: 'test', id:'cmd' },
		      ]
		    },
		    { view: 'P', html: '<b>LiteUI</b>, '+ui.version },
		    { view: 'Can', addClass: 'scrollable',
		      childViews: [
			  { view: 'Button', label: 'fooooooooooooooooooooo', },
			  { view: 'List', id:'list', data: 
			    "abcdefghijklmnopqrstuvwxyz0123456789".split('') },
		      ]
		    }
		]
	      }
	  ],
	  rightChildViews: [
	      { view: 'Can', pos: 'l:5px t:5px r:0 b:0',
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

    // var selector = require('ui/tool/selector');
    // selector.find('Button[text^=Publish]').on('click', function() {
    // 	alert('LiteUI');
    // });
} catch(e) {
    alert(e);
}
