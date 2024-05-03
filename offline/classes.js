class Pipe {
    constructor(pos, bunker) {
        this.rad = 0.75*full_circ; // i.e. 12 o'clock
        this.bunker = bunker;
        this.len = this.bunker.radius*2; // times 2 because else pipe occluded entirely
        this.color = this.bunker.color;
        this.pos = pos;
        this.set_endpoint();
    }
    set_endpoint() {
        // derive endpoint from angle and center
        this.endpoint = coord_from_pos_angle_distance(this.rad, this.len, this.pos);
    }
    rot_left() {
        if (this.rad >= 0.5*full_circ && this.rad <= full_circ) this.rad -= 0.05;
        // move back to acceptable range
        if (this.rad < 0.5*full_circ) { this.rad = 0.5*full_circ; }
    }
    rot_right() {
        if (this.rad >= 0.5*full_circ && this.rad <= full_circ) this.rad += 0.05;
        // move back to acceptable range
        if (this.rad < 0.5*full_circ || this.rad > full_circ) { this.rad = full_circ; }
    }
    update() {
        this.pos = this.bunker.pos; // TODO find more elegant way to bind these properties together? (maybe not necessary since linked already --> try)
        this.set_endpoint();
    }
    render() {
        draw_line([this.pos, this.endpoint], this.color);
    }
}

class Bunker {
    constructor(pos, color="red") {
        this.pos = pos;
        this.color = color;
        this.radius = 30; // TODO think of more suitable hardcoded value
        this.pipe = new Pipe(this.pos, this);
        this.boost = false; // i.e. if spacebar is held --> firing force collected
        this.potential_force = 0;
        this.projs = [];
        this.health = 100;
        this.alive = true;
    }
    firing_process() {
        if (!this.boost) {
            this.boost = true;
        } else {
            if (this.potential_force < 100) {
                this.potential_force += 2;
            }
        }
    }
    fire_proj() {
        const next_ind = this.projs.length;
        this.projs.push(new Projectile(this.pipe.endpoint, this.pipe.rad, next_ind, this, this.potential_force));
        // reset
        this.potential_force = 0;
        this.boost = false;
    }
    remove_proj(i) {
        // update the indices of all projs occuring later in list
        // TODO possible index error if no rightward projs?
        for (let index = i + 1; index < this.projs.length; index++) {
            this.projs[index].ind -= 1;
        }
        this.projs.splice(i, 1);
    }
    update() {
        // components: self, pipe and projectiles (if any)
        this.pipe.update();
        for (let index = 0; index < this.projs.length; index++) {
            this.projs[index].update();
        }
        // remove itself if no health left
        if (this.health <= 0) {
            this.alive = false;
        }
    }
    render() {
        // components: self, pipe and projectiles (if any), force box (if boosting)
        draw_half_circle(this.pos, this.radius, this.color);
        this.pipe.render();
        for (let index = 0; index < this.projs.length; index++) {
            this.projs[index].render();
        }
        if (this.boost) {
            // box
            draw_rect({x: this.pos.x + 2*this.radius, y: this.pos.y - this.radius*2}, 20, this.radius*2, "black");
            // energy level
            var r,g,b;
            if (this.potential_force <= 50) {
                r = this.potential_force*2;
                r /= 100;
                g = 1;
                b = 0;
            } else {
                r = 1
                g = 100 - ((this.potential_force - 50)*2);
                g /= 100;
                b = 0;
            }
            r *= 255;
            g *= 255;
            b *= 255;
            draw_rect({x: this.pos.x + 2*this.radius, y: this.pos.y - this.radius*2*(this.potential_force/100)}, 20, this.radius*2*(this.potential_force/100), 
                "rgba("+String(r)+","+String(g)+","+String(b)+",1)", true);
        }
        // debug: health view as text
        debug_text(this.pos, String(this.health));
    }
}

class Projectile {
    constructor(startpos, rad, ind_in_list, bunker, force=5, damage=50) {
        this.ind = ind_in_list;
        this.bunker = bunker;
        this.damage = damage;
        this.pos = startpos;
        this.radius = 5;
        this.force = force/4; // TODO tweak (criterium: should stretch over entire map with any angle potentially)
        this.rad = rad;
        // vectors to integrate
        this.acc = {x: 0, y: 0};
        this.vel = coord_from_pos_angle_distance(this.rad, this.force, {x: 0, y: 0});
        // this.prev_pos = startpos;
        this.next_pos = {x: this.pos.x, y: this.pos.y};
        this.potential_impact_point = {x: 0, y: 0};

        // debug draw
        this.mvmnt_vec_p = get_line_params(this.next_pos, this.pos);
        this.terrain_line_p = terrain_line_at_x(this.pos.x, terrain.points);

    }
    player_collisions() {
        // (for now) simplified viewed as complete sphere since players cannot be hit from below (?)
        for (let index = 0; index < players.length; index++) {
            const p = players[index];
            if (p.alive) {
                if (circ_circ_overlap(this.pos,p.pos,this.radius,p.radius)) {
                    // add damage to player
                    players[index].health -= this.damage;
                    return true;
                }
            }
        }
        return false;
    }
    terrain_collisions() {
        // line line intersection
        this.mvmnt_vec = get_line_params(this.next_pos, this.pos);
        this.mvmnt_vec_p = [this.pos, this.next_pos];
        // get relevant terrain line
        const middle_x = (this.next_pos.x + this.pos.x)/2;
        // this.terrain_line = terrain_line_at_x(middle_x, terrain.points);
        var terrain_line_ind_mid = terrain_line_ind_at_x(middle_x, terrain.points);
        var check_lines = [];
        // check three lines to catch rounding errors or similar
        check_lines.push(get_neighbour_terrain_line(terrain_line_ind_mid, "left", terrain));
        check_lines.push(get_neighbour_terrain_line(terrain_line_ind_mid, "mid", terrain));
        check_lines.push(get_neighbour_terrain_line(terrain_line_ind_mid, "right", terrain));

        this.terrain_line_p = check_lines[1]; // middle line
        // add some buffer so that proj can't escape through edges
        this.terrain_line_p = [{x: this.terrain_line_p[0].x - 2, y: this.terrain_line_p[0].y}, {x: this.terrain_line_p[1].x + 2, y: this.terrain_line_p[1].y}];

        // TODO simplify calculations by considering bounding boxes first!!

        // get intersection point
        // const inters_point = line_line_intersection(mvmnt_vec[0], terrain_line[0], mvmnt_vec[1], terrain_line[1]);
        // check if line SEGMENTS intersect:
        for (let index = 0; index < check_lines.length; index++) {
            var check_line = check_lines[index];
            // if (check_line[0].y < check_line[1].y) {
            //     check_line[0].y = canvas.height;
            // } else {
            //     check_line[1].y = canvas.height;
            // }
            if (rect_rect_intersection(check_line, this.mvmnt_vec_p)) {
                return true;
            }
        }

        return false; // not collided

    }
    update() {

        // apply gravity
        this.acc = vec_add(this.acc, gravity);
        // integrate acceleration
        this.vel = vec_add(this.vel, this.acc);
        // apply air friction (both upwards and downwards!)
        if (this.vel.y < -air_resistance) {
            this.vel.y = -air_resistance;
        }
        if (this.vel.y > air_resistance) {
            this.vel.y = air_resistance;
        }
        
        this.next_pos = vec_add(this.pos, this.vel);
        var player_collision = false;
        var terrain_collision = false;

        // check for collisions
        player_collision = this.player_collisions();
        if (!player_collision) terrain_collision = this.terrain_collisions();

        // only apply new position if not collided
        if (!player_collision && !terrain_collision) {
            this.pos = {x: this.next_pos.x, y: this.next_pos.y};
        } else {
            // remove itself
            this.bunker.remove_proj(this.ind);
            return;
        }

        // remove if too far away
        if (this.pos.x < 0 || this.pos.x > canvas.width || this.pos.y > canvas.height) {
            this.bunker.remove_proj(this.ind);
            return; // make sure no further updates are calculated
        }
        if (Math.abs(this.pos.x) > 10000 || Math.abs(this.pos.y) > 10000) {
            this.bunker.remove_proj(this.ind);
            return; // make sure no further updates are calculated
        }
        
    }
    render() {
        // TODO render as different kinds
        draw_circle(this.pos, this.radius, "grey");

        // debug draw
        draw_line(this.mvmnt_vec_p, "orange", 10);
        draw_line(this.terrain_line_p, "orange", 10);
        draw_circle(this.potential_impact_point, 7, "orange");
    }
}

class Terrain {
    constructor() {
        this.points = init_terrain_line([0.5*canvas.height, 0.75*canvas.height]);
    }
    render() {
        var poly_coords = this.points;
        poly_coords.unshift({x: 0, y: canvas.height});
        poly_coords.push({x: canvas.width, y: canvas.height});
        draw_poly(poly_coords, "green", 2);
    }
}