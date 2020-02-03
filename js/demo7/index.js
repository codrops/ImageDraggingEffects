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

// Preload fonts
const preloadFonts = () => {
    return new Promise((resolve, reject) => {
        WebFont.load({
            typekit: {
                id: 'mto6dlj'
            },
            active: resolve
        });
    });
};

Promise.all([
    preloadFonts()  
]).then(() => {
    [...document.querySelectorAll('.img-drag')].forEach((draggableEl) => new DraggableImage(draggableEl));
    document.body.classList.remove('loading');
});
