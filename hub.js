var current_mouse_pos = {x: 0, y: 0}; // keeping track of current mouse position

// add event listeners
document.addEventListener('mousedown', mousedown);
document.addEventListener('mousemove', mousemove);
document.addEventListener("keydown", keydown);
document.addEventListener('keyup', keyup);

var static_obj  = [];
var dynamic_obj = [];
var players = [];
var players_bottomlines = []; // for gravity applying
var terrainpixel = [];

/*
for (let index = 0; index < 100; index++) {
    // randomly generate pixels
    var x_rand = Math.floor(Math.random() * canv_w);
    var y_rand = Math.floor(Math.random() * canv_h);
    const coord = {x: x_rand, y: y_rand};
    terrainpixel.push(new TerrainPixel(coord, index));
}
*/

// test: add half circle to static obj
players.push(new Player(center_coord, "rgba(255,0,0,"));
// players.push(new Player({x: 700, y: 1200}, "rgba(0,0,255,"));

// global functions

function update() {
    // debug
    // read out and set physics values from user input
    gravity =       document.getElementById("grav").value;
    vel_factor =    document.getElementById("velf").value;
    str_factor =    document.getElementById("strf").value;
    friction =      document.getElementById("fric").value;

    console.log(gravity)

    for (let index = 0; index < dynamic_obj.length; index++) {
        const dyn_o = dynamic_obj[index];
        dyn_o.update();
    }
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        player.update();
    }
    for (let index = 0; index < terrainpixel.length; index++) {
        const tp = terrainpixel[index];
        tp.update();
    }
    render();
    requestAnimationFrame(update);
}

function render() {
    clear_canvas("lightblue");
    for (let index = 0; index < static_obj.length; index++) {
        const static_o = static_obj[index];
        static_o.render();
    }
    for (let index = 0; index < dynamic_obj.length; index++) {
        const dyn_o = dynamic_obj[index];
        dyn_o.render();
    }
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        player.render();
    }
    for (let index = 0; index < terrainpixel.length; index++) {
        const tp = terrainpixel[index];
        tp.render();
    }
}

// listener functions
function mousedown(e) {
    if (e.button == 0) {
        // LMB
    }
}

function mousemove(e) {
    // adjust current position
    current_mouse_pos = get_pos(e);
}

function keydown(e) {

    if (e.keyCode == 13) {
        // Enter
    }
    if (e.keyCode == 37) {
        players[0].pipe.moveleft = true;
    } // LEFT
    if (e.keyCode == 39) {
        players[0].pipe.moveright = true;
    } // RIGHT
    if (e.keyCode == 38) {
        players[0].pressed_fire = true;
    } // UP
    if (e.keyCode == 40) {} // DOWN
    // other key codes:
    // 27 ESC 32 SPACE 18 ALT 16 SHIFT 17 CTRL
    // for letters use e.code, e.g. e.code == "KeyJ":

}

function keyup(e) {
    if (e.keyCode == 13) {
        // Enter
    }
    if (e.keyCode == 37) {
        players[0].pipe.moveleft = false;
    } // LEFT
    if (e.keyCode == 39) {
        players[0].pipe.moveright = false;
    } // RIGHT
    if (e.keyCode == 38) {
        players[0].pressed_fire = false;
    } // UP
    if (e.keyCode == 40) {} // DOWN
}

update();