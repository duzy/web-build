var doc = window.document;

function info(msg) {
    doc.write('<font color="green"><b>'+msg+'</b></font></br>');
}

function error(msg) {
    doc.write('<font color="red"><b>'+msg+'</b></font></br>');
}

function check() {
    var len = arguments.length,
        last = arguments[len - 1];

    var msg='', res;
    if (typeof arguments[0] == 'string') {
	msg = arguments[0] + " ... ";
	res = !!arguments[1];
    } else {
	res = !!arguments[0];
    }

    if (res) {
	info("OK: "+msg);
    } else {
	error(msg + last);
    }
}

function equal(a, b, msg) {
    if (a === b) {
	info("OK: "+msg);
    } else {
	error(msg + ', ' + a + ' !== ' + b);
    }
}

module.exports = {
    equal: equal,
    check: check,
    info: info,
    error: error,
}
