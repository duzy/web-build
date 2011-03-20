// -*- javascript -*-
//try {
    var ui = require('ui');

    ui.view(
	require('ui/views/button')
    );

    var root = ui([
	// BUG: selector.find needs a 'Can' 
	{ view: 'Can', childViews: [
	    { view: 'Button', id:'cmd', label: 'label' },
	    { view: 'Button', id:'pub', text: 'text' },
            { view: 'Button', iconSrc: '../button/settings.png' },
	]}
    ]).attach();

    var cmd_clicked = 0, pub_clicked = 0;
    
    ui('#cmd').on('click', function() { ++cmd_clicked });

    var selector = require('ui/tool/selector'), pub;
    (pub = selector.find('#pub',root)).on('click', function() { ++pub_clicked });
    //'Button[text^=Publish]'

    var doc = window.document, ele;
    if (ele = doc.getElementById('cmd')) ele.click();
    if (ele = doc.getElementById('pub')) ele.click();

    function check(cond, msg) {
	if (cond) { doc.write("<font color=green>OK: </font>"+msg+"</br>") }
	else {	    doc.write("<font color=red>FAILED: </font>"+msg+"</br>") }
    }

/*
    setTimeout(function(){
	check(cmd_clicked == 1, "#cmd click(): "+cmd_clicked);
	check(pub !== undefined, "#pub");
	check(pub && pub.length == 1, "#pub count: "+pub.length);
	check(pub_clicked == 1, "#pub click(): "+pub_clicked);
    }, 1000);
*/
// } catch(e) {
//     alert(e);
// }
