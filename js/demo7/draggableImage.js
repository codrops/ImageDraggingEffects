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
import { map, lerp, clamp, distance } from './../MathUtils';
const Draggabilly = require('draggabilly');

// Image that gets dragged gets this zIndex value which then gets incremented
let zIndex = 1;

class DraggableImage {
    constructor(el) {
        // image container (the draggable element)
        this.DOM = {el: el};
        this.DOM.svg = this.DOM.el.querySelector('svg');
        this.DOM.img = this.DOM.svg.querySelector('g > image');
        // The feDisplacementMap element
        this.DOM.feDisplacementMapEl = this.DOM.svg.querySelector('feDisplacementMap');

        // Dragging position
        this.draggingPos = {
            translation: {
                previous: {x: 0, y: 0},
                current: {x: 0, y: 0},
                amt: 0.15
            },
            displacement: {
                previous: {x: 0, y: 0},
                current: {x: 0, y: 0},
                amt: 0.08
            }
        };
        // outer Element scale
        this.outerScale = {
            previous: 1,
            current: 1,
            amt: 0.1
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
            this.draggingPos.translation.previous = {x: 0, y: 0};
            this.draggingPos.displacement.previous = {x: 0, y: 0};
        };

        this.onDragMove = (event, pointer, moveVector) => {
            this.draggingPos.translation.current = moveVector;
            this.draggingPos.displacement.current = moveVector;
        };
        
        this.onPointerDown = () => {
            this.DOM.el.style.zIndex = zIndex++;
            this.outerScale.current = 0.75;
            document.body.style.cursor = 'grabbing';
            this.DOM.el.style.cursor = 'grabbing';
        };

        this.onPointerUp = () => {
            // Reset
            this.outerScale.current = 1;
            document.body.style.cursor = 'default';
            this.DOM.el.style.cursor = 'grab';
        };

        this.draggie.on('pointerDown', this.onPointerDown);
        this.draggie.on('dragStart', this.onDragStart);
        this.draggie.on('dragMove', this.onDragMove);
        this.draggie.on('pointerUp', this.onPointerUp);
    }
    render() {
        this.draggingPos.translation.previous.x = lerp(this.draggingPos.translation.previous.x, this.draggingPos.translation.current.x, this.draggingPos.translation.amt);
        this.draggingPos.translation.previous.y = lerp(this.draggingPos.translation.previous.y, this.draggingPos.translation.current.y, this.draggingPos.translation.amt);
        this.draggingPos.displacement.previous.x = lerp(this.draggingPos.displacement.previous.x, this.draggingPos.displacement.current.x, this.draggingPos.displacement.amt);
        this.draggingPos.displacement.previous.y = lerp(this.draggingPos.displacement.previous.y, this.draggingPos.displacement.current.y, this.draggingPos.displacement.amt);
        this.outerScale.previous = lerp(this.outerScale.previous, this.outerScale.current, this.outerScale.amt);

        this.layout();
        // loop
        requestAnimationFrame(() => this.render());
    }
    layout() {
        // The svg element transform
        this.DOM.svg.style.transform = `scale3d(${this.outerScale.previous}, ${this.outerScale.previous}, 1) translate3d(${(this.draggingPos.translation.previous.x - this.draggingPos.translation.current.x).toFixed(2)}px,${(this.draggingPos.translation.previous.y - this.draggingPos.translation.current.y).toFixed(2)}px,0)`;        
        
        const draggingDistance = distance(this.draggingPos.displacement.previous.x, this.draggingPos.displacement.previous.y, this.draggingPos.displacement.current.x, this.draggingPos.displacement.current.y);
        // The displacement value
        this.DOM.feDisplacementMapEl.scale.baseVal = clamp(map(draggingDistance, 0, 400, 0, 150), 0, 150);  
    }
}

export default DraggableImage;