function vec_add(v1, v2) {
    const vx = v1.x + v2.x;
    const vy = v1.y + v2.y;
    return {x: vx, y: vy};
}

function vec_subtract(v1, v2) {
    const vx = v1.x - v2.x;
    const vy = v1.y - v2.y;
    return {x: vx, y: vy};
}

function coord_from_pos_angle_distance(rad, len, pos=cc) {
    const x_val = len*Math.cos(rad) + pos.x;
    const y_val = len*Math.sin(rad) + pos.y;
    return {x: x_val, y: y_val};
}

function point_point_distance(p1, p2) {
    // Pythagoras' theorem
    const dvec = vec_subtract(p2, p1);
    return Math.sqrt(dvec.x*dvec.x + dvec.y*dvec.y);
}

function circ_circ_overlap(pos1,pos2,radius1,radius2) {
    // true if center distance smaller than sum of radii
    return point_point_distance(pos1,pos2) < (radius1 + radius2);
}

function get_line_params(p1, p2) {
    const dvec = vec_subtract(p2, p1);
    var m = dvec.y/dvec.x;
    var n = p1.y - m*p1.x;
    return [m, n];
}

function x_line_intersection(x, m, n) {
    const x_inters = x;
    const y_inters = m*x + n;
    return {x: x_inters, y: y_inters};
}

function line_line_intersection(slope1, slope2, interc1, interc2) {
    // TODO check if it works with vertical line (infinite slope)
    const a = slope1;
    const b = slope2;
    const c = interc1;
    const d = interc2;
    const x_inters = (d - c)/(a - b);
    const y_inters = a*((d - c)/(a - b)) + c;
    return {x: x_inters, y: y_inters};
}

function three_point_dir(a, b, c) {
    var val = (b.y - a.y)*(c.x - b.x) - (b.x - a.x)*(c.y - b.y);
    if (val == 0) return "collinear";
    if (val < 0) return "anti-clockwise";
    if (val > 0) return "clockwise";
}

function point_on_line(p, l) {
    // algorithm taken from https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
    // TODO check if comparison signs are incorrect
    // seems like a AABB check "only"
    if (p.x <= Math.max(l[0].x, l[1].x)
     && p.x >= Math.min(l[0].x, l[1].x)
     && p.y <= Math.max(l[0].y, l[1].y)
     && p.y >= Math.min(l[0].y, l[1].y)) {
        return true;
    }
    return false;
}

function lineseg_lineseg_intersection(l1, l2) {
    // algorithm taken from https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
    // return bool, not intersection point
    var dir1 = three_point_dir(l1[0], l1[1], l2[0]);
    var dir2 = three_point_dir(l1[0], l1[1], l2[1]);
    var dir3 = three_point_dir(l2[0], l2[1], l1[0]);
    var dir4 = three_point_dir(l2[0], l2[1], l1[1]);

    if (dir1 != dir2 && dir3 != dir4) return true;
    if (dir1 == 0 && point_on_line(l2[0], l1)) return true;
    if (dir2 == 0 && point_on_line(l2[1], l1)) return true;
    if (dir3 == 0 && point_on_line(l2[0], l2)) return true;
    if (dir4 == 0 && point_on_line(l2[1], l2)) return true;
    return false;
}

function rect_rect_intersection(AABB1, AABB2) {
    // AABB: two points, connecting points diagonally (upperleft, lowerright)
    // returns bool
    if (AABB1[0].x <= AABB2[1].x 
        && AABB1[1].x >= AABB2[0].x 
        && AABB1[0].y <= AABB2[1].y
        && AABB1[1].y >= AABB2[0].y) {
            return true;
        }
    return false;
}