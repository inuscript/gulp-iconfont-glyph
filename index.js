var path = require("path")
var extend = require("extend")
var stream = require("stream")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var gutil = require("gulp-util")
var glyphsMap = require("iconfont-glyphs-map")
var jsToSassString = require('json-sass/lib/jsToSassString') // TODO: Fix if json-sass bug

var PLUGIN_NAME = "iconfont-glyph"

var svgStream = function(options){
  options.log = function(){}
  return svgicons2svgfont(options)
}

var toSass = function(glyphs, fontName, asDefault){
  var prefix = "$" + fontName + ": "
  var suffix = (!!asDefault) ? " !default;" : ""
  return prefix + jsToSassString(glyphs) + suffix
}

module.exports = function(opt){
  var svgOptions = extend({}, opt.svgOptions) // copy
  var inputStream = svgStream(svgOptions)
  var outputStream = new stream.PassThrough({ objectMode: true });
  var _glyphs = undefined;
  var options = extend({
    fontName: null,
    asDefault: true,
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
      fontName : options.svgOptions.fontName,
      fontName : options.svgOptions.fontName,
      glyphs: glyphsMap(_glyphs, true, true)
    }
    var fontName = options.fontVariable || options.svgOptions.fontName
    var sass = toSass(data, fontName, options.asDefault);
    var glyphFile = new gutil.File({
      cwd: file.cwd,
      base: file.base,
      path: path.join(file.base, svgOptions.fontName) + ".scss",
      contents: new Buffer(sass),
    })
    outputStream.push(glyphFile)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}