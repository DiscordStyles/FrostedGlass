/**
 * @name BubblesBG
 * @author beanz
 * @description Overrides the Discord background with bubbles, as seen on https://www.beanz.pro. Combination plugin and theme, based on Frosted Glass, by Gibbu. Dark theme required. Works best when not used with any additional themes.
 * @version 0.0.1
 * @authorId 249922383761244161
 * @authorLink https://www.twitter.com/pro_beanz
 * @website https://www.beanz.pro
 * @source TBA
 */

const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;700&display=swap');
    @import url('https://pro-beanz.github.io/bubbles-bg/theme.css');
    @import url('https://discordstyles.github.io/Addons/windows-titlebar.css');
`

let canvas;
let ctx;
const colors = [
    [255, 255, 255],
    [19, 19, 19]
]
let borderWidth;
let cursorRadius;
let bubbles = [];
let running = false;
let ratio;

class BubblesBG {
    // Constructor
    constructor() {
        this.initialized = false;
    }

    // Load/Unload
    load() {}
    unload() {}

    // Start/Stop
    start() {
        // styles
        var styleSheet = document.createElement("style");
        styleSheet.setAttribute("id", 'bubbles-bg');
        styleSheet.type = "text/css"
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        // add canvas
        var body = document.getElementsByClassName('bg-h5JY_x')[0];
        body.insertAdjacentHTML('afterbegin', '<canvas id="bubbles-canvas"> </canvas>');
        running = true;
        
        // local canvas variable
        canvas = document.getElementById("bubbles-canvas");
        ctx = canvas.getContext("2d");
        render();
        
        for (let i = 0; i < 75; i++) { bubbles.push(new Bubble()) }
        update();
    }

    stop() {
        running = false;

        // styles
        document.head.removeChild(document.getElementById('bubbles-bg'));

        // canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var body = document.getElementsByClassName('bg-h5JY_x')[0];
        for (let i = 0; i < bubbles.length; i) bubbles.pop();
        body.removeChild(document.getElementById('bubbles-canvas'));
    };

    //  Initialize
    initialize() {
        this.initialized = true;
    }
}

class Bubble {
    constructor() {
        // respawn and randomize starting locations
        this.respawn();
        this.xPos = randRange(0, canvas.width);
        this.yPos = randRange(0, canvas.height);
    }

    respawn() {
        this.radius = randRange(0.00694 * canvas.height, 0.02431 * canvas.height);

        // reset position
        if (oneOrZero() > Math.abs(ratio)) {
            this.xPos = -this.radius;
            this.yPos = randRange(0, canvas.height);
        } else {
            this.xPos = randRange(0, canvas.width);
            this.yPos = canvas.height + this.radius;
        }

        // velocity
        this.xVelocity = randRange(0.25, .75);
        this.yVelocity = randRange(0.25, .75);

        // opacity based on velocity for parallax-like effect
        this.opacity = remap(0.25, .75, 0.05, 0.35, Math.max(this.xVelocity, this.yVelocity));

        // new color
        this.colored = oneOrZero() > 0.5;
        if (this.colored) {
            this.updateColor();
        } else {
            // grey
            this.color = this.formatColor(colors[oneOrZero()]);
        }
    }

    updateColor() {
        // 0.00019634954084936208 = w * Math.PI / 1000
        // used to time angular speed (w) to 0.0625(2^-4) rev/s
        let angle = (Date.now() - this.xPos + 2 * this.yPos) * 0.00019634954084936208 % (Math.PI / 2);
        let color = [360 + Math.sin(angle) * -360, 65, 50];

        this.color = "hsla(" + color[0] + "," + color[1] + "%," + color[2] + "%," + this.opacity + ")";
    }

    formatColor(arr) { return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + this.opacity + ")"; }

    draw() {
        if (this.colored) this.updateColor();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.xPos, this.yPos, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function render() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    ratio = canvas.height > canvas.width ? canvas.width / canvas.height : canvas.height / canvas.width;

    cursorRadius = 0.25 * canvas.height;
    borderWidth = 0.01 * canvas.width;
    window.addEventListener('resize', render, true);
}

function update() {
    if (running) requestAnimationFrame(update);

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(bubble => {
        // update position
        bubble.xPos += bubble.xVelocity;
        bubble.yPos -= bubble.yVelocity;

        // create new bubble if offscreen
        if (bubble.xPos > canvas.width + bubble.radius || bubble.yPos < -bubble.radius) {
            bubble.respawn();
        }

        bubble.draw();
    })
}

function remap(ol, oh, nl, nh, v) { return (v - ol) / (oh - ol) * (nh - nl) + nl; }
function randRange(low, high) { return remap(0, 1, low, high, Math.random()); }
function oneOrZero() { return Math.random() > 0.5 ? 1 : 0 }