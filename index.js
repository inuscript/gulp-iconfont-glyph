var extend = require("extend")
var stream = require("stream")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var quote = require("quote")
var gutil = require("gulp-util")

var PLUGIN_NAME = "iconfont-glyph"

var svgStream = function(options){
  var svgOption = extend({}, options)
  svgOption.log = function(){}
  return svgicons2svgfont(svgOption)
}

var glyphsMap = function(glyphs){
  return glyphs.reduce(function(obj, glyph){
    glyphs.forEach(function(glyph){
      var code = "\\" + glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
      obj[glyph.name] = code
    })
    return obj
  }, {})
}

var getMapValue = function(glyphs, appendMap){
  var value = {
    glyphs : glyphsMap(glyphs)
  }
  return extend(value, appendMap)
}


module.exports = function(opt){
  var inputStream = svgStream(opt)
  var outputStream = new stream.PassThrough({ objectMode: true });
  var _glyphs = undefined;

  inputStream.on('glyphs', function(glyphs){
    _glyphs = glyphs // memorize
  }).on('error', function(err){
    new gutil.PluginError(PLUGIN_NAME, err, {showStack: true})
  }).pipe(through2.obj(function(file, enc, cb){
    if (file.isNull() || _glyphs === undefined) {
      return cb(null);
    }
    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }
    var mapValue = getMapValue(_glyphs)
    var glyphFile = new gutil.File({
      path: gutil.replaceExtension(file.path),
      extension: "json",
      contents: new Buffer(JSON.stringify(mapValue))
    })
    outputStream.push(glyphFile)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}