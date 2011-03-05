(function(){
    var uki = require("uki");
    var views = uki(
	{ view: 'SplitPane',
	  init: {
	      vertical: true,
	      handleWidth: 1.5,
	  },
	  leftChildViews: [
	      { view: 'Button', label: 'left' },
	      { view: 'Button', label: 'left' },
	      { view: 'Button', label: 'left' },
	      { view: 'Button', label: 'left' },
	      { view: 'Button', label: 'left' },
	  ],
	  rightChildViews: [
	      { view: 'Button', label: 'right' },
	      { view: 'Button', label: 'right' },
	      { view: 'Button', label: 'right' },
	      { view: 'Button', label: 'right' },
	      { view: 'Button', label: 'right' },
	  ]
	}
    );
    views.attach();
})();
