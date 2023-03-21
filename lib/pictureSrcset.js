const path = require('path')
const fs = require('fs')
const parser = require('posthtml-parser')
const match = require('posthtml/lib/api').match
const sizeOf = require('image-size')
import { generateAll } from './inc/rollup-images.js'

module.exports = function (options) {
  const cwd = options.cwd || process.cwd()
  const imageOptions = options.imageOptions || {}

  if (!options) {
    options = {}
  }

  if (imageOptions.size === undefined) {
    imageOptions.size = [320, 640, 1024];
  }

  if (options.imgDir === undefined) {
    options.imgDir = './dist/assets'
  }

  if (options.format === undefined) {
    options.format = '.webp'
  }

  const getAssets = (imageDir) => {
    return fs.readdirSync(imageDir) // Read the contents of the assets folder
  }

  const getPicture = async (img, src) => {

    // If the image is referencing an external url, skip it
    if (img.attrs.src.startsWith('http://') || img.attrs.src.startsWith('https://')) {
      return img
    }

    // If the image has a skip flag, skip it
    if(img.attrs['skip'] == true) {
      return img
    }

    // Loop through the different set sizes and check if an image exists for that size
    let srcset = []
    var dimensions = sizeOf(src)
    var relativeSrc = src.split('src')[1]
    img.content = [];

    if (src.indexOf('.gif') != -1) {
      img['attrs']['src'] = relativeSrc
      return img
    }
    

    if(typeof(img['attrs']['fullsize']) == "undefined"){
      // Loop through the assets folder and see if each size exists in webp format
      for (var i = 0; i < imageOptions.size.length; i++) {
        var size = imageOptions.size[i]
        var suffix =  '@' + size + 'w';
        var image =
          relativeSrc.replace(/\.(\w+)$/, suffix + options.format) +
          ' ' +
          size +
          'w'

        if(!(size > dimensions.width)) {
          srcset.push(image)
        }
      }
    }

    // add full size to images array
    srcset.push(relativeSrc.replace(/\.(\w+)$/, options.format+' '+dimensions.width+'w'));

    // Generate the picture tag with the <source> elements + the <img> element
    img.tag = 'picture'
    delete img['attrs']['src'];

    // Add an alt tag if it's left empty
    if(img['attrs']['alt'] === undefined) {
      img['attrs']['alt'] = ''
    }


    if(img['attrs']['nolazy'] !== undefined) {
      img['attrs']['src'] = relativeSrc.replace(/\.(\w+)$/, options.format)
    } else {
      if(typeof(img['attrs']['class']) == 'undefined'){
        img['attrs']['class'] = '';
      }

      img['attrs']['class'] += ' lazyload';
    }

    // Set the srcset <source> tags
    let srcsetTag = {
      tag: 'source',
      attrs: {
        "data-srcset": srcset.join(', '),
        type: 'image/webp'
      },
    };


    // Set the fallback image

    let fallbackType = relativeSrc.split('.')[1];
    if(fallbackType == 'jpg'){
      fallbackType = 'jpeg';
    }

    let defaultSrc =  {
      tag: 'source',
      attrs: {
        "data-srcset": relativeSrc,
        type: 'image/'+ fallbackType
      },
    };

    if(img['attrs']['nolazy'] !== undefined) {
      defaultSrc['attrs']['srcset'] = defaultSrc['attrs']['data-srcset'];
      srcsetTag['attrs']['srcset'] = srcsetTag['attrs']['data-srcset'];
    }

    img.content.push([
      srcsetTag,
      defaultSrc,
    ]);
  
    img.content.push([
      {
        tag: 'img',
        attrs: {
          "data-src": relativeSrc.replace(/\.(\w+)$/, '.webp'),
          skip: true,
          width: dimensions.width,
          height: dimensions.height,
          ...img['attrs']
        },
      },
    ]);

    if (imageOptions.generate == false) {
      img['attrs']['src'] = relativeSrc
      img.content = [
        {
          tag: 'img',
          attrs: {
            "data-src": relativeSrc,
            skip: true,
            width: dimensions.width,
            height: dimensions.height,
           ...img['attrs']
          },
        },
      ]
    }

    delete img['attrs'];
    return img
  }

  /**
   * Ease of use function to generate all the images + sizes
   */
  const generateImages = async () => {
    if (imageOptions.generate) {
      return await generateAll(imageOptions)
    }
  }

  return (tree) =>
    new Promise((resolve, reject) => {
      // generates the required image files
      generateImages()

      const promises = []
      if (!tree.promises) tree.parser = parser
      if (!tree.match) tree.match = match

      tree.match({ tag: 'img' }, (node) => {
        if (!node.attrs['skip'] && !node.attrs.src?.includes('.svg')) {
          promises.push(
            new Promise(async (resolve, reject) => {
              try {
                var src = node.attrs['src']
                if (src) {
                  var imgSrc = path.resolve(cwd, src)
                  // Get the picture tag and assign it
                  node = await getPicture(node, imgSrc)
                }
                resolve()
              } catch (err) {
                reject(err)
              }
            })
          )
        }
        return node
      })
      Promise.all(promises)
        .then(() => resolve(tree))
        .catch(reject)
    })
}
