var jsToSassString = require('json-sass/lib/jsToSassString') // TODO: Fix if json-sass bug

module.exports = function(data, fontName, asDefault){
  var prefix = "$" + fontName + ": "
  var suffix = (!!asDefault) ? " !default;" : ";"
  return prefix + jsToSassString(data) + suffix
}
