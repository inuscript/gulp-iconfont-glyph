var sassMap = require("../sass/map")
var sassBuilder = require("../sass/")

module.exports = function(data, options){
  var map = sassMap(data, options.fontName, options.asDefault)
  var scss = sassBuilder(map)
  return scss
}