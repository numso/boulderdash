var keys = {};

$(document).keydown(function (e){
  keys[e.keyCode] = true;
});

$(document).keyup(function (e){
  keys[e.keyCode] = false;
});

exports.left  = function () { return keys[65] || keys[37]; };
exports.right = function () { return keys[68] || keys[39]; };
exports.up    = function () { return keys[87] || keys[38]; };
exports.down  = function () { return keys[83] || keys[40]; };

exports.resetKeys = function () {
  for (var key in keys) {
    keys[key] = false;
  }
}
