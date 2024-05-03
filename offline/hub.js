// event listeners

window.addEventListener('resize', resize_context);
window.addEventListener('mousemove', set_current_mouse_pos);
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);

// updating

var terrain = new Terrain();
var players = [];
for (let index = 0; index < n_players; index++) {
    // for now random position
    const randx = get_random_canvas_location().x;
    players.push(new Bunker(get_player_init_pos(terrain, randx)));
}

function update_all() {
    // update objects
    for (let index = 0; index < players.length; index++) {
        if (players[index].alive) {
            players[index].update();
        }
    }
    // draw the updates
    draw_all();
    // keep animation going
    requestAnimationFrame(update_all);
}
function draw_all() {
    clear_window("lightblue");
    terrain.render();
    for (let index = 0; index < players.length; index++) {
        if (players[index].alive) {
            players[index].render();
        }
    }
}

update_all(); // start the updates