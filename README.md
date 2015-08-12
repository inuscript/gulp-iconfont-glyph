# gulp-iconfont-style
Stylesheet generator for [gulp-iconfont](https://github.com/nfroidure/gulp-iconfont/).

# Usage Example

```js
var fontSetting = {
  src : ["test/svg/*.svg"],
  dest : "./dest/",
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
```
# API
## options.svgOptions
Pass your svg option.
`options.svgOptions.fontName` is required.
See more options: [gulp-svgicon2svgfont](https://github.com/nfroidure/gulp-svgicons2svgfont)

## options.fontPath
Set your font path.

## options.output
default: `css` 
You can set `css` or `scss`.
If you set `scss`, you can get raw scss file.

## options.styleOptions
Pass options to [iconfont-sass-style](https://github.com/inuscript/iconfont-sass-style)

# Motivation
- `gulp-iconfont-css` depends old version's gulp-iconfont
  - Cannot output as `glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase()`
- Enable raw sass file.
- More customizable sass output.