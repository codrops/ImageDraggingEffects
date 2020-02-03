/**
* draggableImage.js
* http://www.codrops.com
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 
* Copyright 2020, Codrops
* http://www.codrops.com
*/
import { map, lerp, clamp, getRandomFloat, distance } from './../MathUtils';
const Draggabilly = require('draggabilly');
    
// Draggabilly: Preserve transforms by using left and top rather than transform values (see https://codepen.io/desandro/pen/dEyIg)
Draggabilly.prototype.positionDrag = Draggabilly.prototype.setLeftTop;

// Image that gets dragged gets this zIndex value which then gets incremented
let zIndex = 1;

class DraggableImage {
    constructor(el) {
        // image container (the draggable element)
        this.DOM = {el: el};
        this.boundingRect = this.DOM.el.getBoundingClientRect();
        // Dragging position
        this.draggingPos = {
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            amt: 0.13
        };
        this.pointerOffset = {x: 0,y: 0};
        // Initialize Draggabilly
        this.draggie = new Draggabilly(this.DOM.el);
        // Init/Bind events
        this.initEvents();
        // Loop
        requestAnimationFrame(() => this.render());
    }
    initEvents() {
        this.onDragStart = () => {
            this.DOM.el.style.zIndex = zIndex++;
            // Reset
            this.draggingPos.previous = {x: 0, y: 0};
        };

        this.onDragMove = (event, pointer, moveVector) => {
            this.draggingPos.current = moveVector;
        };

        this.onPointerDown = (event, pointer) => {
            this.pointerOffset = {
                x: pointer.offsetX,
                y: pointer.offsetY
            };
            document.body.style.cursor = 'grabbing';
            this.DOM.el.style.cursor = 'grabbing';
        };

        this.onPointerUp = () => {
            document.body.style.cursor = 'default';
            this.DOM.el.style.cursor = 'grab';
        };

        this.onResize = () => {
            this.boundingRect = this.DOM.el.getBoundingClientRect();
        };

        this.draggie.on('dragStart', this.onDragStart);
        this.draggie.on('dragMove', this.onDragMove);
        this.draggie.on('pointerDown', this.onPointerDown);
        this.draggie.on('pointerUp', this.onPointerUp);
        window.addEventListener('resize', this.onResize);
    }
    render() {
        this.draggingPos.previous.x = lerp(this.draggingPos.previous.x, this.draggingPos.current.x, this.draggingPos.amt);
        this.draggingPos.previous.y = lerp(this.draggingPos.previous.y, this.draggingPos.current.y, this.draggingPos.amt);

        this.layout();
        // loop
        requestAnimationFrame(() => this.render());
    }
    layout() {
        const draggingDistance = {
            x: (this.draggingPos.previous.x - this.draggingPos.current.x).toFixed(2),
            y: (this.draggingPos.previous.y - this.draggingPos.current.y).toFixed(2),
            total: distance(this.draggingPos.previous.x, this.draggingPos.previous.y, this.draggingPos.current.x, this.draggingPos.current.y)
        };
        const blurVal = clamp(map(draggingDistance.total, 0, 400, 0, 10), 0, 10);
        const brightnessVal = clamp(map(draggingDistance.total, 0, 400, 1, 1.5), 1, 1.5);

        // The draggable element transform
        const skewDirection = {
            vertical: this.pointerOffset.y > this.boundingRect.height/2 ? -1 : 1,
            horizontal: this.pointerOffset.x > this.boundingRect.width/2 ? -1 : 1
        };
        this.DOM.el.style.transform = `translate3d(${draggingDistance.x}px,${draggingDistance.y}px,0) 
                                       scale(${clamp(map(draggingDistance.total, 0, 800, 1, 0.6), 0.6, 1)}) 
                                       skewX(${skewDirection.vertical*map(draggingDistance.x, 0, 500, 0, 10)}deg) skewY(${skewDirection.horizontal*map(draggingDistance.y, 0, 500, 0, 10)}deg)`;
                                       
        // Filters
        this.DOM.el.style.filter = `blur(${blurVal.toFixed(2)}px) brightness(${brightnessVal.toFixed(2)})`;
    }
}

export default DraggableImage;