// -*- javascript -*-
//(function(){
// high level browser objects
exports.root    = window;
exports.doc     = window.document || {};
exports.docElem = exports.doc.documentElement;
exports.nav     = navigator;
exports.ua      = exports.nav.userAgent;
exports.isIE    = exports.ua.match(/MSIE 6|7/);

exports.guid = 1;
exports.expando = 'ui' + (+new Date);
//})();
