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
        // Image container
        this.DOM = {el: el};
        // The draggable element
        this.DOM.draggable = this.DOM.el.querySelector('.img-drag');
        // Image trails
        this.trailsTotal = 5;
        for (let i = 0; i <= this.trailsTotal - 1; ++i) {
            const el = document.createElement('div');
            el.className = 'img-trail';
            el.style.backgroundImage = this.DOM.draggable.style.backgroundImage;
            this.DOM.el.insertBefore(el, this.DOM.el.firstChild);
        }
        this.DOM.trails = [...this.DOM.el.querySelectorAll('.img-trail')];

        // Dragging position
        this.draggingPos = {
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            amt: 0.1
        };
        // Trails translations
        this.trailsTranslation = [...new Array(this.trailsTotal)].map(() => ({
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            amt: position => 0.15 + 0.05*position
        }));
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
            for (let i = 0; i <= this.trailsTotal - 1; ++i) {
                this.trailsTranslation[i].current = this.draggie.position;
            }
        };
        
        this.onPointerDown = () => {
            this.DOM.el.style.zIndex = zIndex++;
            this.DOM.draggable.style.opacity = 0.8;
            document.body.style.cursor = 'grabbing';
            this.DOM.draggable.style.cursor = 'grabbing';
        };

        this.onPointerUp = () => {
            this.DOM.draggable.style.opacity = 1;
            document.body.style.cursor = 'default';
            this.DOM.draggable.style.cursor = 'grab';
        };

        this.draggie.on('pointerDown', this.onPointerDown);
        this.draggie.on('dragStart', this.onDragStart);
        this.draggie.on('dragMove', this.onDragMove);
        this.draggie.on('pointerUp', this.onPointerUp);
    }
    render() {
        this.draggingPos.previous.x = lerp(this.draggingPos.previous.x, this.draggingPos.current.x, this.draggingPos.amt);
        this.draggingPos.previous.y = lerp(this.draggingPos.previous.y, this.draggingPos.current.y, this.draggingPos.amt);
        for (let i = 0; i <= this.trailsTotal - 1; ++i) {
            this.trailsTranslation[i].previous.x = lerp(this.trailsTranslation[i].previous.x, this.trailsTranslation[i].current.x, this.trailsTranslation[i].amt(i));
            this.trailsTranslation[i].previous.y = lerp(this.trailsTranslation[i].previous.y, this.trailsTranslation[i].current.y, this.trailsTranslation[i].amt(i));
        }
        this.layout();
        // loop
        requestAnimationFrame(() => this.render());
    }
    layout() {
        const draggingDistance = distance(this.draggingPos.previous.x, this.draggingPos.previous.y, this.draggingPos.current.x, this.draggingPos.current.y);
        
        for (let i = 0; i <= this.trailsTotal - 1; ++i) {
            const brightnessVal = clamp(map(draggingDistance, 0, 400, 100, 100+(this.trailsTotal - 1 - i)*40), 100, 100+(this.trailsTotal - 1 - i)*40);
            this.DOM.trails[i].style.filter = `brightness(${brightnessVal}%)`;
            this.DOM.trails[i].style.transform = `translate3d(${this.trailsTranslation[i].previous.x}px,${this.trailsTranslation[i].previous.y}px,0)`;
        }
    }
}

export default DraggableImage;