var jsonSass = require("json-sass")

module.exports = function(map, fontVariable, asDefault){
  var prefix = "$" + fontVariable + ": "
  var suffix = asDefault ? " !default;" : ""
  var scss = prefix + jsonSass.convertJs(map) + suffix
  return scss
}
