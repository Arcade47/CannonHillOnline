// TODO handle browser resizing properly

var full_circ = 2*Math.PI;
var cc = {x: canvas.width/2, y: canvas.height/2}; // center coordinate
var current_mouse_pos = {x: cc.x, y: cc.y};

function set_current_mouse_pos(e) {
    // remove the scaling factor since mouse pos should be independent of transformation of ctx
    current_mouse_pos.x = e.clientX/scale_factor;
    current_mouse_pos.y = e.clientY/scale_factor;
}

// arrow keys keycodes:
//    38
// 37    39
//    40
// space: 32

function keydown(e) {
    if (e.keyCode == 37) { players[0].pipe.rot_left(); }
    if (e.keyCode == 39) { players[0].pipe.rot_right(); }
    if (e.keyCode == 38) { players[0].firing_process(); }
}

function keyup(e) {
    if (e.keyCode == 38) {
        if (players[0].boost) {
            players[0].fire_proj();
        }
    }
}

function get_random_canvas_location() {
    var randx = Math.random()*canvas.width;
    var randy = Math.random()*canvas.height;
    return {x: randx, y: randy};
}

function random_range(range) {
    var rand = Math.random(); // 0 - 1
    var range_num = range[1] - range[0];
    rand *= range_num;
    rand += range[0];
    return rand;
}

function init_terrain_line(range=[0.25*canvas.height, 0.75*canvas.height], n_points=30) {
    // do not start exactly at middle but randomly within a range
    var coords = [{x: 0, y: random_range(range)}];
    const stepsize = canvas.width/n_points;
    // with each step, add to current radians randomly but within limits
    var current_rad = 1*full_circ;
    while (coords[coords.length-1].x < canvas.width) {
        // range: 0.5 (0.75 - 1.25) --> 0.25 in each direction --> max delta rad one fifth maybe
        var rand_rad_add = (Math.random() - 0.5)*0.4;
        current_rad += rand_rad_add;
        // clamp to possible radians values
        if (current_rad < 0.75*full_circ) current_rad = 0.75*full_circ;
        if (current_rad > 1.25*full_circ) current_rad = 1.25*full_circ;
        // apply radians (for simplicity: keep the distance between points equal --> numbers of points change)
        var next_coord = coord_from_pos_angle_distance(current_rad, stepsize, coords[coords.length-1]);
        // while outside range, adjust values
        while (next_coord.y < range[0]) {
            current_rad += 0.01*full_circ;
            next_coord = coord_from_pos_angle_distance(current_rad, stepsize, coords[coords.length-1]);
        }
        while (next_coord.y > range[1]) {
            current_rad -= 0.01*full_circ;
            next_coord = coord_from_pos_angle_distance(current_rad, stepsize, coords[coords.length-1]);
        }
        coords.push(next_coord);
    }
    // output: maybe approximation of curved line with 30 points
    return coords;
}

function terrain_line_at_x(x, terrain_points, params=true) {
    var points = [];
    for (let index = terrain_points.length-1; index >= 0; index--) {
        const tp = terrain_points[index];
        if (x >= tp.x) {
            if (index < terrain_points.length-1) {
                points.push(terrain_points[index]);
                points.push(terrain_points[index + 1]);
            } else {
                points.push(terrain_points[index - 1]);
                points.push(terrain_points[index]);
            }
            break;
        }
    }
    if (params) { return get_line_params(points[0], points[1]); }
    else { return points; }
}

function terrain_line_ind_at_x(x, terrain_points) {
    for (let index = terrain_points.length-1; index >= 0; index--) {
        const tp = terrain_points[index];
        if (x >= tp.x) {
            if (index < terrain_points.length-1) {
                return index;
            } else {
                return index - 1;
            }
        }
    }
    return "no index found";
}

function get_player_init_pos(terrain, x) {
    const line_params = terrain_line_at_x(x, terrain.points);
    const m = line_params[0];
    const n = line_params[1];
    return x_line_intersection(x, m, n);
}

function get_neighbour_terrain_line(line_ind, LR, terrain) {
    // ind refers to the index of left point
    if (LR == "left" && line_ind > 0) {
        return [terrain.points[line_ind - 1], terrain.points[line_ind]];
    } else if (LR == "right" && line_ind < terrain.points.length - 2) {
        return [terrain.points[line_ind + 1], terrain.points[line_ind + 2]];
    } else {
        return [terrain.points[line_ind], terrain.points[line_ind + 1]];
    }
}