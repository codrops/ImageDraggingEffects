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
import { map, lerp, clamp, distance, getRandomFloat } from './../MathUtils';
const Draggabilly = require('draggabilly');

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
        this.boundingRect = this.DOM.draggable.getBoundingClientRect();
        // Image trails
        this.DOM.trails = [...this.DOM.el.querySelectorAll('.img-trail')];
        this.trailsTotal = this.DOM.trails.length;

        // Dragging position
        this.draggingPos = {
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            amt: 0.13
        };
        // outer Element scale
        this.outerScale = {
            previous: 1,
            current: 1,
            amt: 0.1
        };
        // Trails translations
        this.trailsTranslation = [...new Array(this.trailsTotal)].map(() => ({
            previous: {x: 0, y: 0},
            current: {x: 0, y: 0},
            random: {x: 0, y: 0},
            amt: getRandomFloat(0.07,0.11)
        }));
        // Trails scales
        this.trailsScale = [...new Array(this.trailsTotal)].map(() => ({
            previous: 0,
            current: 0,
            amt: 0.1
        }));
        // Trails rotations
        this.trailsRotation = [...new Array(this.trailsTotal)].map(() => ({
            previous: 0,
            current: 0,
            amt: 0.1
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
                this.trailsTranslation[i].current.x = this.draggie.position.x - parseFloat(this.trailsTranslation[i].random.x);
                this.trailsTranslation[i].current.y = this.draggie.position.y - parseFloat(this.trailsTranslation[i].random.y);
            }
        };
        
        this.onPointerDown = () => {
            this.DOM.el.style.zIndex = zIndex++;
            this.outerScale.current = 0.8;
            const radius = (this.boundingRect.width + this.boundingRect.height)/2.5;
            for (let i = 0; i <= this.trailsTotal - 1; ++i) {
                this.trailsTranslation[i].random = {
                    //x: getRandomFloat(-this.boundingRect.width*.85,this.boundingRect.width*.85), 
                    x: Math.round(radius * Math.cos(2*(i+1)*Math.PI/this.trailsTotal)),
                    //y: getRandomFloat(-this.boundingRect.height*.85,this.boundingRect.height*.85)
                    y: Math.round(radius * Math.sin(2*(i+1)*Math.PI/this.trailsTotal))
                };
                this.trailsTranslation[i].current.x = this.draggie.position.x - parseFloat(this.trailsTranslation[i].random.x);
                this.trailsTranslation[i].current.y = this.draggie.position.y - parseFloat(this.trailsTranslation[i].random.y);
                this.trailsScale[i].current = 0.5;
                this.trailsRotation[i].current = getRandomFloat(-10,10);
            }
            document.body.style.cursor = 'grabbing';
            this.DOM.draggable.style.cursor = 'grabbing';
        };

        this.onPointerUp = () => {
            this.outerScale.current = 1;
            for (let i = 0; i <= this.trailsTotal - 1; ++i) {
                this.trailsTranslation[i].current = {x: this.draggie.position.x, y: this.draggie.position.y};
                this.trailsScale[i].current = 0;
                this.trailsRotation[i].current = 0;
            }
            document.body.style.cursor = 'default';
            this.DOM.draggable.style.cursor = 'grab';
        };

        this.onResize = () => {
            this.boundingRect = this.DOM.el.getBoundingClientRect();
        };

        this.draggie.on('pointerDown', this.onPointerDown);
        this.draggie.on('dragStart', this.onDragStart);
        this.draggie.on('dragMove', this.onDragMove);
        this.draggie.on('pointerUp', this.onPointerUp);
        window.addEventListener('resize', this.onResize);
    }
    render() {
        this.draggingPos.previous.x = lerp(this.draggingPos.previous.x, this.draggingPos.current.x, this.draggingPos.amt);
        this.draggingPos.previous.y = lerp(this.draggingPos.previous.y, this.draggingPos.current.y, this.draggingPos.amt);
        this.outerScale.previous = lerp(this.outerScale.previous, this.outerScale.current, this.outerScale.amt);
        
        for (let i = 0; i <= this.trailsTotal - 1; ++i) {
            this.trailsTranslation[i].previous.x = lerp(this.trailsTranslation[i].previous.x, this.trailsTranslation[i].current.x, this.trailsTranslation[i].amt);
            this.trailsTranslation[i].previous.y = lerp(this.trailsTranslation[i].previous.y, this.trailsTranslation[i].current.y, this.trailsTranslation[i].amt);
            this.trailsScale[i].previous = lerp(this.trailsScale[i].previous, this.trailsScale[i].current, this.trailsScale[i].amt);
            this.trailsRotation[i].previous = lerp(this.trailsRotation[i].previous, this.trailsRotation[i].current, this.trailsRotation[i].amt);
        }
        this.layout();
        // loop
        requestAnimationFrame(() => this.render());
    }
    layout() {
        const draggingDistance = distance(this.draggingPos.previous.x, this.draggingPos.previous.y, this.draggingPos.current.x, this.draggingPos.current.y);
        
        for (let i = 0; i <= this.trailsTotal - 1; ++i) {
            const blurVal = clamp(map(draggingDistance, 0, 400, 0, 20), 0, 20);
            this.DOM.trails[i].style.filter = `blur(${blurVal}px`;
            this.DOM.trails[i].style.transform = `translate3d(${this.trailsTranslation[i].previous.x}px,${this.trailsTranslation[i].previous.y}px,0) scale3d(${this.trailsScale[i].previous},${this.trailsScale[i].previous},1) rotate3d(0,0,1,${this.trailsRotation[i].previous}deg)`;
        }

        this.DOM.draggable.style.transform = `translate3d(${(this.draggingPos.previous.x - this.draggingPos.current.x).toFixed(2)}px,${(this.draggingPos.previous.y - this.draggingPos.current.y).toFixed(2)}px,0) scale3d(${this.outerScale.previous}, ${this.outerScale.previous}, 1)`;
    }
}

export default DraggableImage;