// user parameters
var hori_ratio          = 1920/1080;    // fixed to realistic value

// init of global vars
var current_scale       = 1;            // keeping track of scale
var current_translate   = {x: 0, y: 0}; // keeping track of translation
var canv_w;
var canv_h;
var smaller_dim;
var larger_dim; 
var prev_orient;

var canvas = document.getElementById("GameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight*0.5;
canv_w = window.innerWidth;
canv_h = window.innerHeight*0.5;
var ctx = canvas.getContext("2d");

// init_initial_ctx_dims
function reset_ctx_dims() {
    if (window.innerWidth/window.innerHeight > 1) { // 1920/1080
        canv_h = window.innerHeight; // fitting dimension
        canv_w = hori_ratio*canv_h; // derived dimension
        prev_orient = "h";
    } else {
        canv_w = window.innerWidth; // fitting dimension
        canv_h = hori_ratio*canv_w; // derived dimension
        prev_orient = "v";
    }
    smaller_dim = Math.min(canv_w, canv_h);
    larger_dim  = Math.max(canv_w, canv_h);
}

/*
function resize() {
    // keep ratio of 1920:1080
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // TODO replace with function that just checks for orientation change
    reset_ctx_dims();

    current_translate.x = 0;
    current_translate.y = 0;

    if (window.innerWidth/window.innerHeight > 1) {
        // WINDOW IS WIDER
        if (window.innerWidth/window.innerHeight > hori_ratio) {
            current_scale = canvas.height / canv_h;
            current_translate.x = (window.innerWidth - canv_w*current_scale)/2;
        } else {
            current_scale = canvas.width / canv_w;
            current_translate.y = (window.innerHeight - canv_h*current_scale)/2;
        }
    } else {
        // WINDOW IS TALLER
        if (window.innerHeight/window.innerWidth > hori_ratio) {
            current_scale = canvas.width / canv_w;
            current_translate.y = (window.innerHeight - canv_h*current_scale)/2;
        } else {
            current_scale = canvas.height / canv_h;
            current_translate.x = (window.innerWidth - canv_w*current_scale)/2;
        }
    }
	ctx.setTransform(current_scale, 0, 0, current_scale, current_translate.x, current_translate.y);
}
*/

// call resize once, then set the fixed canv_w, canv_h again
// resize();



// functions

function clear_canvas(color) {
    ctx.beginPath();
    ctx.rect(0, 0, canv_w, canv_h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    /*
    var start_w = -current_translate.x/current_scale;
    var start_h = -current_translate.y/current_scale;
    ctx.clearRect(start_w, start_h, window.innerWidth/current_scale, window.innerHeight/current_scale);
    */
}

function draw_circ(pos, size, filled, color, rads=[0, 2*Math.PI]) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size/2, rads[0], rads[1]);
    if (filled) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.fill();
    } else {
        ctx.lineWidth = 5*(canv_h/1080);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    ctx.closePath();
}

function draw_line(color, coords) {
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    ctx.lineTo(coords[1].x, coords[1].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();
}

function draw_rect(color, pos, w, h) {
    ctx.beginPath();
    ctx.rect(pos.x, pos.y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}