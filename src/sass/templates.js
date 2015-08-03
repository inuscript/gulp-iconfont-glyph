var fs = require("fs")
var path = require("path")

var partialNames = ["charset", "mixins", "loader"] // const

var getPath = function(partial){
  var base = path.join(__dirname, "../../", "/template/")
  return path.join(base, "/_" + partial + ".scss")
}

module.exports.partialNames = partialNames
module.exports = function(){
  var map = new Map()
  partialNames.forEach(function(partial){
    var path = getPath(partial)
    var scss = fs.readFileSync(path, "utf-8")
    map.set(partial, scss)
  })
  return map
}