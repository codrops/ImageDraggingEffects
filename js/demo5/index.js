/**
* index.js
* http://www.codrops.com
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 
* Copyright 2020, Codrops
* http://www.codrops.com
*/
import DraggableImage from "./draggableImage";
const imagesLoaded = require('imagesloaded');

// Preload images
const preloadImages = () => {
    return new Promise((resolve, reject) => {
        imagesLoaded(document.querySelectorAll('.img-drag__inner, img'), {background: true}, resolve);
    });
};

// Preload fonts
const preloadFonts = () => {
    return new Promise((resolve, reject) => {
        WebFont.load({
            typekit: {
                id: 'sth6zmv'
            },
            active: resolve
        });
    });
};

Promise.all([
    preloadImages(),
    preloadFonts()  
]).then(() => {
    [...document.querySelectorAll('.img-wrap')].forEach((element) => new DraggableImage(element));
    document.body.classList.remove('loading');
});


