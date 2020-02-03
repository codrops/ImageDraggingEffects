/**
* MathUtils.js
* http://www.codrops.com
*
* Licensed under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 
* Copyright 2020, Codrops
* http://www.codrops.com
*/

// Map number x from range [a, b] to [c, d]
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

// Clamp val within min and max
const clamp = (val, min, max) => Math.max(Math.min(val, max), min);

// Random float
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

// distance between two points
const distance = (x1,y1,x2,y2) => Math.hypot(x2-x1, y2-y1);

export { map, lerp, clamp, getRandomFloat, distance };
