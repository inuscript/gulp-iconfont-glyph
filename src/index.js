var path = require("path")
var stream = require("stream")

var extend = require("extend")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var gutil = require("gulp-util")
var glyphsMap = require("iconfont-glyphs-map")
var quote = require("quote")

var sassMap = require("./sass/map")
// var sassTemplates = require("./sass/templates")
var sassBuilder = require("./sass/")

var PLUGIN_NAME = "iconfont-glyph"

var svgStream = function(options){
  options.log = function(){}
  return svgicons2svgfont(options)
}

var sanitizeMap = function(data){
  return Object.keys(data).reduce(function(obj, key){
    var item = data[key]
    if(item === undefined){
      return obj
    }
    obj[key] = quote(item)
    return obj
  }, {})
}

var generateData = function(glyphs, iconPrefix, fontName, fontPath){
  var map = {
    iconPrefix: iconPrefix,
    fontName: fontName,
    fontPath: fontPath
  }
  var data = sanitizeMap(map)
  data.glyphs = glyphsMap(glyphs, true, true)
  return data
}

var generateCss = function(data){
  var map = sassMap(data, "font", true)
  var scss = sassBuilder(map)
  if(scss == "") return scss
  var compiler = require("node-sass")
  return compiler.renderSync({
    data: scss
  }).css
}
var generateSass = function(data, fontName, asDefault){
  var map = sassMap(data, fontName, asDefault)
  var scss = sassBuilder(map)
  return scss
}

module.exports = function(opt){
  var svgOptions = extend({}, opt.svgOptions) // copy
  var inputStream = svgStream(svgOptions)
  var outputStream = new stream.PassThrough({ objectMode: true });
  var _glyphs = undefined;
  var options = extend({
    output: "css",
    fontPath: undefined,
    fontName: undefined,
    iconPrefix: ".icon-",
    asDefault: true,
  }, opt)
  var extension = options.output
  inputStream.on('glyphs', function(glyphs){
    _glyphs = glyphs // memorize
  }).on('error', function(err){
    new gutil.PluginError(PLUGIN_NAME, err, {showStack: true})
  }).pipe(through2.obj(function(file, enc, cb){
    if (_glyphs === undefined) {
      return cb(null);
    }
    var fontName = options.fontName || options.svgOptions.fontName
    var data = generateData(_glyphs, options.iconPrefix, fontName, options.fontPath)
    var content = (extension === "css")
                ? generateCss(data)
                : generateSass(data, fontName, options.asDefault);
    var glyphFile = new gutil.File({
      cwd: file.cwd,
      base: file.base,
      path: path.join(file.base, svgOptions.fontName) + "." + extension,
      contents: new Buffer(content),
    })
    outputStream.push(glyphFile)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}