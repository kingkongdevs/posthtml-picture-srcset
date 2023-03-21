# PostHTML Picture Srcset <img align="right" height="100" title="PostHTML logo" src="http://posthtml.github.io/posthtml/logo.svg">

[![NPM][npm]][npm-url]

This postHTML plugin uses rollup-images to generate webp versions of your png and jpeg images in multiple responsive sizes. It then replaces the reference to that image in your HTML with the corresponding `<picture>` tag and the corresponding `srcset` attributes.

Also includes fallback to the original image for older browsers.

Before:
``` html
<img src="bigimg.jpg" />
```

After:
``` html
<picture>
    <source data-srcset="/bigimg@640w.webp 640w, /bigimg@1300w.webp 1300w, /bigimg@1800w.webp 1800w, /bigimg.webp 1900w" type="image/webp" srcset="/bigimg@640w.webp 640w, /bigimg@1300w.webp 1300w, /bigimg@1800w.webp 1800w, /bigimg.webp 1900w">
    <source data-srcset="/bigimg.png" type="image/png" srcset="/bigimg.png">
    <img data-src="/bigimg.webp" skip width="1900" height="1200" nolazy="" alt="" src="/bigimg.webp">
</picture>
```

## Install

```bash
npm i posthtml-picture-srcset
```

## Usage

Describe how people can use this plugin. Include info about build systems if it's
necessary.

``` js
const fs = require('fs');
const posthtml = require('posthtml');
const pictureSrcset = require('posthtml-picture-srcset');

posthtml()
    .use(
      pictureSrcset({
        cwd: resolve('src/assets/images'),
        imgDir: resolve('src/assets/images'),
        imageOptions: {
          generate: true,
          dir: ['src/assets/images'],
          size: [640, 1300, 1800],
          hook: 'renderStart',
          quality: 80,
          inputFormat: ['jpg', 'jpeg', 'png'],
          outputFormat: ['webp'],
          maxParallel: 25,
          forceUpscale: false,
          skipExisting: false,
        },
    )
    .process(html/*, options */)
    .then(result => fs.writeFileSync('./after.html', result.html));


```

## Global Options

| Option      | Type | Description  |
| ----------- | ----------- |  ----------- |
| cwd         | path        | The current working directory |
| imgDir      | path        | Image folder  |
| imageOptions| object      | See image options below |

## Image Options
| Option      | Type | Description  |
| ----------- | ----------- |  ----------- |
| generate    | path        | The current working directory |
| dir         | array       | Pass in the image folder  |
| size        | array       | Array of image sizes to generate|
| hook        | string      | Rollup hook, when to generate images  |
| quality     | number      | Value between 1 and 100 for image generation quality  |
| inputFormat | array       | Image formats to run on  |
| outputFormat| array       | Image formats to generate |
| maxParallel | number      | Maximum number of images to generate on one thread  |
| forceUpscale| boolean     | Generate larger images if a file resolution is less than the largest output size  |
| skipExisting| boolean     | Skip existing images  |



### Contributing

See [PostHTML Guidelines](https://github.com/posthtml/posthtml/tree/master/docs) and [contribution guide](CONTRIBUTING.md).

[action]: https://github.com/caragammon/posthtml-picture-srcset/workflows/Actions%20Status/badge.svg
[action-url]: https://github.com/caragammon/posthtml-picture-srcset/actions?query=workflow%3A%22CI+tests%22

[npm]: https://img.shields.io/npm/v/posthtml-picture-srcset.svg
[npm-url]: https://npmjs.com/package/posthtml-picture-srcset
