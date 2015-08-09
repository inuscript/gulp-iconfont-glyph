var path = require("path")
var stream = require("stream")

var extend = require("extend")
var through2 = require("through2")
var plexer = require("plexer")
var svgicons2svgfont = require('gulp-svgicons2svgfont')
var gutil = require("gulp-util")
var glyphsMap = require("iconfont-glyphs-map")
var quote = require("quote")

var PLUGIN_NAME = "iconfont-glyph"

var svgStream = function(options){
  options.log = function(){}
  return svgicons2svgfont(options)
}

var renderFunction = function(format){
  switch(format){
    case "scss":
      return require("./render/scss")
    case "css":
    default:
      return require("./render/css")
  }
}

var generate = function(glyphs, file, options){
  var svgOptions = options.svgOptions
  var fontPath = options.fontPath
  var iconPrefix = options.iconPrefix
  var fontName = options.fontName || svgOptions.fontName
  var format = (!!options.scss) ? "scss" : "css"

  var data = generateData(glyphs, iconPrefix, fontName, fontPath)
  var renderFn = renderFunction(format)
  var content = renderFn(data, {fontName: fontName, asDefault: options.asDefault})

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
    scss: false,
    fontPath: undefined,
    fontName: undefined,
    iconPrefix: ".icon-",
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
    // var fontName = options.fontName || options.svgOptions.fontName
    // var data = generateData(_glyphs, options.iconPrefix, fontName, options.fontPath)
    // var content = renderContent(format, data, {fontName: fontName, asDefault: options.asDefault})
     //data, {fontName: fontName, asDefault: options.asDefault})

    var glyphFile = generate(_glyphs, file, options)
    outputStream.push(glyphFile)
    cb()
  }, function(){
    outputStream.end();
  }))
  var duplexStream = plexer({ objectMode: true }, inputStream, outputStream)
  return duplexStream
}