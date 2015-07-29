var jsonSass = require("json-sass")

var getSassContent = function(map, fontVariable, asDefault){
  var prefix = "$" + fontVariable + ": "
  var suffix = asDefault ? " !default;" : ""
  var scss = prefix + jsonSass.convertJs(map) + suffix
  return scss
}
