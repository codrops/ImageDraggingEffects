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
import { lerp, clamp, distance } from './../MathUtils';
const Draggabilly = require('draggabilly');
import { gsap, Power1 } from 'gsap';

// Draggabilly: Preserve transforms by using left and top rather than transform values (see https://codepen.io/desandro/pen/dEyIg)
Draggabilly.prototype.positionDrag = Draggabilly.prototype.setLeftTop;

// Image that gets dragged gets this zIndex value which then gets incremented
let zIndex = 1;

class DraggableImage {
    constructor(el) {
        // Image container
        this.DOM = {el: el};
        // The draggable element
        this.DOM.draggable = this.DOM.el.querySelector('.img-drag');
        // image element
        this.DOM.innerEl = this.DOM.el.querySelector('.img-drag__inner');
        // Image trails
        this.trailsTotal = 10;
        for (let i = 0; i <= this.trailsTotal - 1; ++i) {
            const el = document.createElement('img');
            el.className = 'img-trail';
            el.alt = 'A decorative image';
            el.src = this.DOM.innerEl.style.backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
            this.DOM.el.insertBefore(el, this.DOM.el.firstChild);
        }
        this.DOM.trails = [...this.DOM.el.querySelectorAll('.img-trail')];

        // Dragging position
        this.draggingPos = {
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0}
        };
        // Inner Element scale
        this.innerScale = {
            previous: 1,
            current: 1,
            amt: 0.2
        };
        // outer Element scale
        this.outerScale = {
            previous: 1,
            current: 1,
            amt: 0.2
        };
        
        // mouse distance required to show the first trail image
        this.threshold = 30;
        this.trailPosition = 0;

        // Initialize Draggabilly
        this.draggie = new Draggabilly(this.DOM.draggable);
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
            this.innerScale.current = 1.5;
            this.outerScale.current = 0.8;
            document.body.style.cursor = 'grabbing';
            this.DOM.draggable.style.cursor = 'grabbing';
        };

        this.onPointerUp = () => {
            // Reset
            this.innerScale.current = 1;
            this.outerScale.current = 1;
            document.body.style.cursor = 'default';
            this.DOM.draggable.style.cursor = 'grab';
        };

        this.draggie.on('pointerDown', this.onPointerDown);
        this.draggie.on('dragStart', this.onDragStart);
        this.draggie.on('dragMove', this.onDragMove);
        this.draggie.on('pointerUp', this.onPointerUp);
    }
    render() {
        this.innerScale.previous = lerp(this.innerScale.previous, this.innerScale.current, this.innerScale.amt);
        this.outerScale.previous = lerp(this.outerScale.previous, this.outerScale.current, this.outerScale.amt);

        this.layout();
        // loop
        requestAnimationFrame(() => this.render());
    }
    layout() {
        const draggingDistance = distance(this.draggingPos.previous.x, this.draggingPos.previous.y, this.draggingPos.current.x, this.draggingPos.current.y);
        
        // The inner element transform
        this.DOM.innerEl.style.transform = `scale3d(${this.innerScale.previous}, ${this.innerScale.previous}, 1)`;
        // The draggable element transform
        this.DOM.draggable.style.transform = `scale3d(${this.outerScale.previous}, ${this.outerScale.previous}, 1)`;

        // If the mouse moved more than [this.threshold] then show the next image
        if ( draggingDistance > this.threshold ) {
            this.showNextTrailImage();
            this.trailPosition = this.trailPosition < this.trailsTotal-1 ? this.trailPosition+1 : 0;
            this.draggingPos.previous = this.draggingPos.current;
        }
    }
    showNextTrailImage() {
        const trailEl = this.DOM.trails[this.trailPosition];
        // Kill any tween on the trail
        gsap.killTweensOf(trailEl);
        gsap.timeline({onComplete: () => this.resetTrail(trailEl)})
            // show the image
            .set(trailEl, {
                startAt: {opacity: 0},
                opacity: 1,
                scale: this.outerScale.previous,
                x: this.draggie.position.x,
                y: this.draggie.position.y
            }, 0)
            // then make it disappear
            .to(trailEl, 0.3, {
                ease: Power1.easeOut,
                opacity: 0,
                scale: () => this.outerScale.previous
            }, 0.1);
    }
    resetTrail(trailEl) {
        gsap.set(trailEl, {
            opacity: 0,
            scale: 1,
            x: this.draggie.position.x,
            y: this.draggie.position.y
        });
    }
}

export default DraggableImage;