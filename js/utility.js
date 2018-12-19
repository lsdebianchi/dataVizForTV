var randomProperty = function(obj) {
  var keys = Object.keys(obj);
  var prop = keys[(keys.length * Math.random()) << 0];
  var val = obj[prop];
  return [prop, val];
};

function map_val(val, a1, a2, b1, b2) {
  var v = ((val - a1) / (a2 - a1)) * (b2 - b1) + b1;
  if (v < b1) v = b1;
  if (v > b2) v = b2;
  return v;
}
