(function(){
    var uki = require("uki");

    /*
    var data = uki.map(uki.range(1, 1000), function(n) {
	return 'row #' + i;
    });
    */
    var data = [];
    for (n=1; n < 30000; ++n) { data.push('row #' + n) };
    
    var views = uki([
	{ view: 'SplitPane', pos: 'l:0 t:0 r:0 b:0',
	  init: {
	      vertical: true,
	      //handleWidth: 1.5,
	  },
	  leftChildViews: [
	      { view: 'Container',
		childViews: [
		    { view: 'Flow', horizontal: true,
		      childViews: [
			  { view: 'Button', label: 'command', id:'cmd1' },
			  { view: 'Button', label: 'command', id:'cmd2' }
		      ]
		    },
		    { view: 'Text', html: requireText('./dinthelp.html') }
		]
	      }
	  ],
	  rightChildViews: [
	      { view: 'Container', pos: 'l:0 t:0 r:0 b:0', addClass: 'scrollable',
		childViews: [
		    { view: 'Header', text: 'list', size: 'small' },
		    { view: 'DataList', pos: 'l:0 t:20px r:0 b:0', id:'list',
		      data: data
		    }
		]
	      },
	  ]
	}
    ]).attach();

    uki('#cmd1').on('click', function() { alert(this.text()); });
    uki('#cmd2').on('click', function() {
	alert(uki('#list').data);
    });
})();
