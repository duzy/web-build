// -*- javascript -*-
var ui = require('ui');
requireCss('../data-list/datalist.css');

ui.view(
    //require('ui/views/list'),
    require('ui/views/datalist'),
    require('ui/views/split'),
    require('ui/views/text')
);

var s = 'abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890';
s = s + s + s + s + s + s + s + s + s + s + s + s + s + s + s;
s = s + s + s + s + s + s + s + s + s + s + s + s + s + s + s;
s = s + s + s + s + s + s + s + s + s + s + s + s + s + s + s;
var data = s.split('');

ui([
    { view: 'Split', pos: 'l:0 t:0 r:0 b:0',
      init: {
	  vertical: true,
	  //handleWidth: 1.5,
	  leftMin: '20%', rightMin: '80%',
      },
      childViews: [
	  { view: 'Can', pos: 't:10px l:10px w:150px b:10px', addClass: 'scrollable',
	    childViews: [
		{ view: 'Header', text: 'Base Data List', size: 'small' },
		{ view: 'DataList', pos: 't:20px r:0 b:0 l:0', id: 'll',
                  data: data, formatter: {
                      start: '<div width="100%">',
                      item: function(k, r, i) {
                          return '<span class="ui-list-row'
                              + ((i & 1) ? ' ui-list-row-odd' : '')
                              +'">'
                              + this.value(k, r, i)
                              + '</span>';
                      },
                      value: function(k) {
                          return '<b>' + k + '</b>'
                      },
                      end: '</div>',
                  },
                },
	    ]
	  },
	  
	  { view: 'Can', pos: 't:10px l:190px w:150px b:10px', addClass: 'scrollable',
	    childViews: [
		{ view: 'Header', text: 'Multiselect Data List', size: 'small' },
		{ view: 'Text', addClass: 'help', html:
		  requireText('../data-list/multiselecthelp.html') },
		{ view: 'DataList', pos: 't:100px r:0 b:0 l:0', data: data,
		  multiselect: true }
	    ]
	  }
      ]
    }
]).attach();

//ui('#ll')[0].formatter = formatRow;
//alert(ui('#ll')[0].formatter);
//alert(ui('#ll')[0].packSize);
