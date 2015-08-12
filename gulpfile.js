var fs = require("fs")
var path = require("path")

var del = require("del")
var gulp = require("gulp")

var iconfont = require("gulp-iconfont")

var iconfontStyle = require('./');

gulp.task("clean", function(){
  del("dest")
})

var fontSetting = {
  src : ["svg/*.svg"],
  dest : "./test/dest/fonts",
  options : {
    fontName: "myFont",
    timestamp: 10
  }
}

gulp.task("iconfont", function(){
  return gulp.src(fontSetting.src)
    .pipe(iconfont(fontSetting.options))
    .pipe(gulp.dest(path.join(fontSetting.dest, "iconfont")))
})
gulp.task("iconfont-style-css", function(){
  return gulp.src(fontSetting.src)
    .pipe(iconfontStyle({
      fontPath: fontSetting.dest,
      svgOptions : fontSetting.options
    }))
    .pipe(gulp.dest(path.join(fontSetting.dest, "iconfont-style-css")))
})

gulp.task("iconfont-style-scss", function(){
  return gulp.src(fontSetting.src)
    .pipe(iconfontStyle({
      output: "scss",
      fontPath: fontSetting.dest,
      svgOptions : fontSetting.options
    }))
    .pipe(gulp.dest(path.join(fontSetting.dest, "iconfont-style-scss")))
})

gulp.task("iconfont-style", ["iconfont-style-css", "iconfont-style-scss",])
gulp.task("default", ["iconfont", "iconfont-style"])
