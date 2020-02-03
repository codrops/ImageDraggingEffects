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
import { map, lerp, clamp } from './../MathUtils';
const Draggabilly = require('draggabilly');
import { gsap, Power2 } from 'gsap';

// Draggabilly: Preserve transforms by using left and top rather than transform values (see https://codepen.io/desandro/pen/dEyIg)
Draggabilly.prototype.positionDrag = Draggabilly.prototype.setLeftTop;

// Image that gets dragged gets this zIndex value which then gets incremented
let zIndex = 1;

class DraggableImage {
    constructor(el) {
        // image container (the draggable element)
        this.DOM = {el: el};
        // image element
        this.DOM.innerEl = this.DOM.el.querySelector('.img-drag__inner');
        // css --overflow value 
        // this will define how much the innerEl can move inside the parent without getting cut off
        this.overflowVal = parseInt(getComputedStyle(this.DOM.innerEl).getPropertyValue('--overflow'),10);
        // Dragging position
        this.draggingPos = {
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            amt: 0.1
        };
        // Inner Element scale
        this.innerScale = {
            previous: 1,
            current: 1,
            amt: 0.15
        };
        // outer Element scale
        this.outerScale = {
            previous: 1,
            current: 1,
            amt: 0.15
        };
        // Initialize Draggabilly
        this.draggie = new Draggabilly(this.DOM.el);
        // Init/Bind events
        this.initEvents();
        // Loop
        requestAnimationFrame(() => this.render());
    }
    initEvents() {
        this.onDragStart = () => {
            // Reset
            this.draggingPos.previous = {x: 0, y: 0};
        };

        this.onDragMove = (event, pointer, moveVector) => {
            this.draggingPos.current = moveVector;
        };
        
        this.onPointerDown = () => {
            this.DOM.el.style.zIndex = zIndex++;

            this.innerScale.current = 1;
            this.outerScale.current = 1.2;

            gsap.to(document.body, {duration: 0.5, ease: Power2.easeOut, backgroundColor: '#588186'});
            
            document.body.style.cursor = 'grabbing';
            this.DOM.el.style.cursor = 'grabbing';
        };

        this.onPointerUp = () => {
            // Reset
            this.innerScale.current = 1;
            this.outerScale.current = 1;

            gsap.to(document.body, {duration: 0.5, ease: Power2.easeOut, backgroundColor: '#a1e0e7'});

            document.body.style.cursor = 'default';
            this.DOM.el.style.cursor = 'grab';
        };

        this.onMouseEnter = () => {
            if ( this.DOM.el.classList.contains('is-dragging') ) return;
            this.innerScale.current = 1.2;
            this.outerScale.current = 1.1;
        };

        this.onMouseLeave = () => {
            if ( this.DOM.el.classList.contains('is-dragging') ) return;
            // Reset
            this.innerScale.current = 1;
            this.outerScale.current = 1;
        };
        
        this.draggie.on('pointerDown', this.onPointerDown);
        this.draggie.on('dragStart', this.onDragStart);
        this.draggie.on('dragMove', this.onDragMove);
        this.draggie.on('pointerUp', this.onPointerUp);
        this.DOM.el.addEventListener('mouseenter', this.onMouseEnter);
        this.DOM.el.addEventListener('mouseleave', this.onMouseLeave);
    }
    render() {
        this.draggingPos.previous.x = lerp(this.draggingPos.previous.x, this.draggingPos.current.x, this.draggingPos.amt);
        this.draggingPos.previous.y = lerp(this.draggingPos.previous.y, this.draggingPos.current.y, this.draggingPos.amt);
        this.innerScale.previous = lerp(this.innerScale.previous, this.innerScale.current, this.innerScale.amt);
        this.outerScale.previous = lerp(this.outerScale.previous, this.outerScale.current, this.outerScale.amt);

        this.layout();
        // loop
        requestAnimationFrame(() => this.render());
    }
    layout() {
        // The inner element transform
        this.DOM.innerEl.style.transform = `translate3d(${this.getInnerTranslation('x')}px,${this.getInnerTranslation('y')}px,0) scale3d(${this.innerScale.previous}, ${this.innerScale.previous}, 1) rotate3d(1,1,1,0.1deg)`;
        // The draggable element transform
        this.DOM.el.style.transform = `translate3d(${(this.draggingPos.previous.x - this.draggingPos.current.x).toFixed(2)}px,${(this.draggingPos.previous.y - this.draggingPos.current.y).toFixed(2)}px,0) scale3d(${this.outerScale.previous}, ${this.outerScale.previous}, 1) rotate3d(1,1,1,0.1deg)`;
    }
    // Calculate how much to translate the inner element
    getInnerTranslation(axis) {
        const distance = this.draggingPos.previous[axis] - this.draggingPos.current[axis];
        const boundaries = {
            distance: {min: 0, max: 400},
            translation: {min: 0, max: this.overflowVal/2*this.innerScale.previous/this.outerScale.previous}
        };

        let translationVal = map(Math.abs(distance), boundaries.distance.min, boundaries.distance.max, boundaries.translation.min, boundaries.translation.max);
        translationVal = clamp(translationVal, boundaries.translation.min, boundaries.translation.max);
        
        return distance > 0 ? translationVal : -1*translationVal;
    }
}

export default DraggableImage;