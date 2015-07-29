var extend = require("extend")
var stream = require("stream")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var quote = require("quote")
var jsonSass = require("json-sass")
var gutil = require("gulp-util")

var PLUGIN_NAME = "iconfont-sass-map"

var svgStream = function(options){
  var svgOption = extend({}, options)
  svgOption.log = function(){}
  return svgicons2svgfont(svgOption)
}

var glyphsMap = function(glyphs){
  return glyphs.reduce(function(obj, glyph){
    glyphs.forEach(function(glyph){
      obj[glyph.name] = quote("\\" + glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase())
    })
    return obj
  }, {})
}

var getSassMapVaue = function(glyphs, appendMap){
  var value = {
    glyphs : glyphsMap(glyphs)
  }
  return extend(value, appendMap)
}

var getSassContent = function(map, fontVariable, asDefault){
  var prefix = "$" + fontVariable + ": "
  var suffix = asDefault ? " !default;" : ""
  var scss = prefix + jsonSass.convertJs(map) + suffix
  return scss
}

module.exports = function(opt){
  var inputStream = svgStream(opt)
  var outputStream = new stream.PassThrough({ objectMode: true });
  var options = extend({
    asDefault : true,
    fontVariable : "font",
    appendMap : {}
  }, opt)

  var _glyphs = undefined;

  inputStream.on('glyphs', function(glyphs){
    _glyphs = glyphs // memorize
  }).on('error', function(err){
    new gutil.PluginError(PLUGIN_NAME, err, {showStack: true})
  }).pipe(through2.obj(function(file, enc, cb){
    if (file.isNull() || _glyphs === undefined) {
      return cb(null, file);
    }
    var mapValue = getSassMapVaue(_glyphs, options.appendMap)
    var scss = getSassContent(mapValue, options.fontVariable, options.asDefault)
    file.path = gutil.replaceExtension(file.path, ".scss")
    file.contents = new Buffer(scss)
    outputStream.push(file)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}