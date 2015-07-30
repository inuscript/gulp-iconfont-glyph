var extend = require("extend")
var stream = require("stream")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var gutil = require("gulp-util")
var quote = require("quote")
var empty = function(s){ return s }
var PLUGIN_NAME = "iconfont-glyph"

var svgStream = function(options){
  options.log = function(){}
  return svgicons2svgfont(options)
}

var glyphsMap = function(glyphs, withQuote, withBackslash){
  var bs = withBackslash ? "\\" : ""
  var fn = withQuote ? quote : empty

  return glyphs.reduce(function(obj, glyph){
    glyphs.forEach(function(glyph){
      // var code = "\\" + glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
      var code = glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()
      obj[glyph.name] = fn(bs + code)
    })
    return obj
  }, {})
}



module.exports = function(opt){
  var svgOptions = extend({}, opt.svgOptions) // copy
  var inputStream = svgStream(svgOptions)
  var outputStream = new stream.PassThrough({ objectMode: true });
  var _glyphs = undefined;
  var options = extend({
    withQuote: false, 
    backslash: true
  }, opt)
  inputStream.on('glyphs', function(glyphs){
    _glyphs = glyphs // memorize
  }).on('error', function(err){
    new gutil.PluginError(PLUGIN_NAME, err, {showStack: true})
  }).pipe(through2.obj(function(file, enc, cb){
    if (_glyphs === undefined) {
      return cb(null);
    }
    var data = {
      glyphs: glyphsMap(_glyphs, options.withQuote, options.withBackslash)
    }
    var glyphFile = new gutil.File({
      path: gutil.replaceExtension(file.path),
      extension: "json",
      contents: new Buffer(JSON.stringify(data)),
      data: data // gulp-data compability
    })
    outputStream.push(glyphFile)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}