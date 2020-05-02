// global vars
var center_coord = {x: canv_w/2, y: canv_h/2};
var gravity = 30;
var n_simulation_steps = 1;

function sort_nums(a, b) {
    return a - b;
}

function coord_game_space(coord) {
    // adjust for global translation
    coord.x -= current_translate.x;
    coord.y -= current_translate.y;
    coord.x /= current_scale;
    coord.y /= current_scale;
    return coord;
}

function get_pos(e) {
    var x_val = e.clientX;
    var y_val = e.clientY;
    var coord = {x: x_val, y: y_val};
    return coord_game_space(coord);
}

function rad_to_degree(rad) {
    // convert radians to degree
    // i.e. 0 - 2*PI --> 0 - 360
    var unitless = rad/(2*Math.PI);
    return unitless*360;
}

function rad_to_coord(rad, distance, coord) {
    var X = coord.x + distance*Math.cos(rad);
    var Y = coord.y + distance*Math.sin(rad);
    return {x: X, y: Y};
}

function len_dir_to_vec(len, rad) {
    return {x: Math.cos(rad)*len, y: Math.sin(rad)*len};
}

function distance(pos1, pos2) {
    var xdiff = pos2.x - pos1.x;
    var ydiff = pos2.y - pos1.y;
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff);
}

function circle_overlap(circ1, circ2) {
    var dist = distance(circ1.pos, circ2.pos);
    return dist < (circ1.radius/2 + circ2.radius/2);
}

// not tested! --> sth wrong
function square_square_overlap(rect1, rect2) {
    // rect: pos (lower left), size (w || h)
    // test each corner of one rect against dimension bounds of other
    // crit: if ANY corner is inside BOTH dimensions (x, y)

    // 1. calculate each point of rect2
    var list_of_points = [];
    list_of_points.push({x: rect2.pos.x,                 y: rect2.pos.y});
    list_of_points.push({x: rect2.pos.x + rect2.size,    y: rect2.pos.y});
    list_of_points.push({x: rect2.pos.x,                 y: rect2.pos.y + rect2.size});
    list_of_points.push({x: rect2.pos.x + rect2.size,    y: rect2.pos.y + rect2.size});

    // test each point, break if any overlap
    for (let i = 0; i < list_of_points.length; i++) {
        const c = list_of_points[i];
        if ((c.x >= rect1.pos.x && c.x <= rect1.pos.x + rect1.size) 
        && ( c.y >= rect1.pos.y && c.y <= rect1.pos.y + rect1.size)) {
            return true;
        }
    }

    return false;
}

function get_square_square_overlap_amount(rect1, rect2) {
    // i.e. find two middle values for each axis
    // put up two containers, one for each axis
    var x_cont = [rect1.pos.x, rect1.pos.x + rect1.size, rect2.pos.x, rect2.pos.x + rect2.size];
    var y_cont = [rect1.pos.y, rect1.pos.y + rect1.size, rect2.pos.y, rect2.pos.y + rect2.size];
    // sort 'em
    x_cont.sort(sort_nums);
    y_cont.sort(sort_nums);
    x_overlap_len = x_cont[2] - x_cont[1];
    y_overlap_len = y_cont[2] - y_cont[1];
    return {x: x_overlap_len, y: y_overlap_len};
}

function set_color_opacity(rgb_str, alpha) {
    return rgb_str + alpha + ")";
}

function vec_add_val(vec, val) {
    return {x: vec.x + val, y: vec.y + val};
}

function vec_add_vec(vec1, vec2) {
    return {x: vec1.x + vec2.x, y: vec1.y + vec2.y};
}