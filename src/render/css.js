var sassMap = require("../sass/map")
var sassBuilder = require("../sass/")

var compileScss = function(scss){
  var compiler = require("node-sass")
  return compiler.renderSync({
    data: scss
  }).css
}

module.exports = function(data, _unused){
  var map = sassMap(data, "font", true)
  var scss = sassBuilder(map)
  if(scss == ""){
    return scss
  }
  return compileScss(scss)
}
