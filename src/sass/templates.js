var fs = require("fs")
var path = require("path")
var partialNames = require("./partials")

var getPath = function(partial){
  var base = path.join(__dirname, "../../", "/template/")
  return path.join(base, "/_" + partial + ".scss")
}

module.exports = function(){
  var map = {}
  partialNames.forEach(function(partial){
    if(!partial.template) return
    var path = getPath(partial.name)
    var scss = fs.readFileSync(path, "utf-8")
    map[partial.name] = scss
  })
  return map
}