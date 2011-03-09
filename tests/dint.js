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
	      leftMin: '20%', rightMin: '80%',
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

    var rich = uki('#rich')[0];

    uki('#cmd1').on('click', function() { alert(this.text()); });
    uki('#cmd2').on('click', function() {
	//rich.bold();
	//rich.focus();
	alert(rich.html());
	alert(rich.text());
    });

    if (!(window.frames[rich.dom().name] &&
	  window.frames[rich.dom().name].document &&
	  window.frames[rich.dom().name].document.body &&
	  window.frames[rich.dom().name].document.body.contentEditable)) {
	//window.frames[rich.dom().name].document.body.contentEditable = true;
	alert("RichEdit is not editable");
    }
})();
