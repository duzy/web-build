// -*- javascript -*-
//try {

var ui = require('ui');
requireCss('./complex.css');

ui.view(
    require('ui/views/button'),
    require('ui/views/flow'),
    require('ui/views/list'),
    require('ui/views/native'),
    require('ui/views/rich'),
    require('ui/views/split'),
    require('ui/views/text')
);

var root = ui([
    { view: 'Split', pos: 'l:0 t:0 r:0 b:0', 
      init: {
	  vertical: true, fixed: false,
	  //handleWidth: 1.5,
	  leftMin: '20%', rightMin: '80%',
      },
      leftChildViews: [
	  { view: 'Flow',
	    childViews: [
	      	{ view: 'Flow', horizontal: true,
	      	  childViews: [
	      	      { view: 'Button', label: 'test', id:'cmd' },
	      	  ]
	      	},
	      	{ view: 'P', html: '<b>LiteUI</b>, '+ui.version },
	      	{ view: 'Can', addClass: 'scrollable-y',
		  pos: 't:60px l:0 r:0 b:5px', 
	      	  childViews: [
	      	      { view: 'Button', label: 'fooooooooooooooooooooo', },
	      	      { view: 'List', id:'list', multiselect: true,
			//addClass: 'scrollable-y', pos: 't:0 l:0 r:0 b:0',
			data: "abcdefghijklmnopqrstuvwxyz0123456789".split('') },
	      	  ]
	      	}
	    ]
	  }
      ],
      rightChildViews: [
	  { view: 'Can', pos: 'l:5px t:5px r:0 b:0', addClass: 'scrollable',
	    childViews: [
		{ view: 'Header', text: 'Post', size: 'small',
		  pos: 'l:0 t:0 w:100% h:25px',
		},
		{ view: 'native.Text', 
		  pos: 'l:0 t:25 w:95% h:25px',
		},
		{ view: 'RichEdit', id: 'rich', name: 'rich',
		  pos: 'l:0 t:50px w:95% h:90%',
		},
		{ view: 'Button', text: 'Publish', id: 'pub',
		  pos: 'l:0 t:95% w:200 h:25px',
		},
	    ]
	  },
      ]
    }
]).attach();

ui('#cmd').on('click l', function() { alert('LiteUI '+ui.version); });

if (!(ui('#cmd')[0])) { alert("ui('#cmd') not found") }

var selector = require('ui/tool/selector');
selector.find('#pub',root).on('click', function() {
    alert('LiteUI');
});
//'Button[text^=Publish]'
// } catch(e) {
//     alert(e);
// }
