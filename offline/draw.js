// access canvas as variable to draw on it

var canvas = document.getElementById("main_canvas");
canvas.width = window.innerWidth;
const initial_width = window.innerWidth; // for calculating scaling factor
canvas.height = window.innerHeight;

var scale_factor = 1; // flexibly adjusted
var screen_dim_ratio = (16/9);

var ctx = canvas.getContext("2d");

function get_set_current_scale() {
    // get the scaling factor
    scale_factor = window.innerWidth/initial_width;
    // apply scaling factor
    ctx.setTransform(scale_factor,0,0,scale_factor,0,0);
}

function resize_context() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // get the scaling factor
    scale_factor = window.innerWidth/initial_width;
    // apply scaling factor
    ctx.setTransform(scale_factor,0,0,scale_factor,0,0);
}

function clear_window(color="white") {
    ctx.beginPath();
    // context transformed, but bg should be window-centered; thus remove scaling factor in this special case of bg
    ctx.rect(0,0,canvas.width/scale_factor,canvas.height/scale_factor);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function debug_text(pos, str) {
    ctx.beginPath();
    ctx.font = "10px Georgia";
    ctx.fillStyle = "black";
    ctx.fillText(str, pos.x, pos.y);
    ctx.closePath();
}

function draw_line(coords, color, thickness=5) {
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    ctx.lineTo(coords[1].x, coords[1].y);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

function draw_lines(coords, color, thickness=5) {
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let index = 1; index < coords.length; index++) {
        const c = coords[index];
        ctx.lineTo(c.x, c.y);
    }
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

function draw_circle(pos, radius, color, filled=true) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, full_circ);
    if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        // ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.closePath();
}

function draw_half_circle(pos, radius, color, filled=true) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0.5*full_circ, 0);
    if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        // ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.closePath();
}

function draw_rect(upper_left_coord, w, h, color, filled=false) {
    ctx.beginPath();
    ctx.rect(upper_left_coord.x, upper_left_coord.y, w, h);
    if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.closePath();
}

function draw_poly(coords, color) {
    // assuming filled (if more flexibility needed --> TODO)
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let index = 1; index < coords.length; index++) {
        const c = coords[index];
        ctx.lineTo(c.x, c.y);
    }
    ctx.lineTo(coords[0].x, coords[0].y);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}