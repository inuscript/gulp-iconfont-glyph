var sassMap = require("./map")
var sassTemplates = require("./templates")
var partialNames = require("./partials") 

var order = partialNames.map(function(p){
  return p.name
})
var allPartials = order

module.exports = function(map, includes){
  if(includes === undefined){
    includes = allPartials
  }
  var templates = sassTemplates()
  templates["map"] = map

  var scssContents = []
  return order.map(function(partial){
    return templates[partial] || null
  }).filter(function(scss){
    return scss !== null
  }).join("\n\n")
}