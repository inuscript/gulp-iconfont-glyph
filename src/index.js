var path = require("path")
var stream = require("stream")

var extend = require("extend")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var gutil = require("gulp-util")
var iconfontStyle = require("iconfont-sass-style")
var quote = require("quote")

var PLUGIN_NAME = "iconfont-glyph"

var svgStream = function(options){
  options.log = function(){}
  return svgicons2svgfont(options)
}

var compileSass = function(scss){
  var compiler = require("node-sass") 
  var css = compiler.renderSync({
    data: scss
  }).css.toString()
  return css
}
var generate = function(glyphs, file, options){
  var svgOptions = options.svgOptions
  var fontPath = options.fontPath
  var iconPrefix = options.iconPrefix
  var fontName = options.fontName || svgOptions.fontName
  var format = (options.output === "scss") ? "scss" : "css"

  var content = iconfontStyle(glyphs, fontName, fontPath, {asDefault: options.asDefault})
  if(format === "css"){
    content = compileSass(content)
  }
  return new gutil.File({
    cwd: file.cwd,
    base: file.base,
    path: path.join(file.base, svgOptions.fontName) + "." + format,
    contents: new Buffer(content),
  })
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
  }, opt)
  inputStream.on('glyphs', function(glyphs){
    _glyphs = glyphs // memorize
  }).on('error', function(err){
    new gutil.PluginError(PLUGIN_NAME, err, {showStack: true})
  }).pipe(through2.obj(function(file, enc, cb){
    if (_glyphs === undefined) {
      return cb(null);
    }
    var glyphFile = generate(_glyphs, file, options)
    outputStream.push(glyphFile)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}