class Dynamic {
    constructor() {}
    update() {}
    render() {}
}

class Static {
    constructor() {}
    render() {}
}

class GravityObject extends Dynamic {
    constructor(pos) {
        super();
        // movement vars
        // 1. pos
        this.pos = pos;
        // 2. vel
        // split strength to x y dims depending on pipe radians
        var init_vel = {x: 0, y: 0};
        this.vel = {x: init_vel.x, y: init_vel.y};
        // 3. acc
        this.acc = {x: 0, y: gravity};  
    }
    set_potential_contact_objects() {
        // TODO create pixels for collision from "solid" landscape
        // objects: half circles (players)
    }
    collision_resolution() {
        // simulation steps
        var step_x = this.vel.x / n_simulation_steps;
        var step_y = this.vel.y / n_simulation_steps;

        for (let index = 0; index < n_simulation_steps; index++) {

            // step position forward
            this.pos.x += step_x;
            this.pos.y += step_y;

            // did collision occur?
            // TODO
            // this.set_contact_points();

            for (let i = 0; i < terrainpixel.length; i++) {
                if (this.ind != i) {
                    const other_rect = terrainpixel[i];
                    if (square_square_overlap(this, other_rect)) {
                        // correct for overlap (half overlap in each axis)
                        var rect_overlap = get_square_square_overlap_amount(this, other_rect);
                        var corr_vect = {x: rect_overlap.x/16, y: rect_overlap.y/16};
                        console.log(corr_vect);
                        this.pos.x -= 0.5*corr_vect.x;
                        this.pos.y -= 0.5*corr_vect.y;
                    }
                }
            }
        }
    }
    
    update() {
        if (this.vel.y > 1500) {
            this.acc.y = 0;
        } else {
            this.acc.y = gravity;
        }
        // integrate latent movement vars
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.vel.x *= 0.95; // friction
        if (Math.abs(this.vel.x) < 0.01) this.vel.x = 0;
        this.pos.x += this.vel.x*0.01;
        this.pos.y += this.vel.y*0.01;
    }
}

class TerrainPixel extends GravityObject {
    constructor(pos, ind) {
        super(pos);
        this.ind = ind;
        this.size = 20;
        this.color = "green";
        this.lastframe_pos = {x: this.pos.x, y: this.pos.y};
    }
    update() {
        // apply gravity until collision w/ px OR lower screen border
        // test for collisions with any other pixel

        super.update();

        // test against other pixels
        this.collision_resolution();

        // block when on ground
        if (this.pos.y + this.size > canv_h) {
            this.pos = {x: this.lastframe_pos.x, y: this.lastframe_pos.y};
        }

        this.lastframe_pos = {x: this.pos.x, y: this.pos.y};
        
    }
    render() {
        draw_rect(this.color, this.pos, this.size, this.size);
    }
}

class Bullet extends GravityObject {
    constructor(pipe, strength, ind) {
        super({x: pipe.coords[1].x, y: pipe.coords[1].y});
        this.pipe = pipe;
        this.strength = strength*35;
        this.init_vel = len_dir_to_vec(this.strength, this.pipe.rad);
        this.vel = {x: this.init_vel.x, y: this.init_vel.y};
        this.ind = ind;
        this.radius = 20;
    }
    render() {
        draw_circ(this.pos, this.radius, true, "grey");
    }
}

class Pipe {
    constructor(player) {
        this.player = player;
        this.rad = 1.5*Math.PI;
        this.len = this.player.radius*1.25;
        this.reset_coords();
        this.moveleft = false;
        this.moveright = false;
    }
    reset_coords() {
        this.coords = [this.player.pos, rad_to_coord(this.rad, this.len, this.player.pos)];
    }
    update() {
        if (this.moveleft && this.player.pipe.rad > 7*Math.PI/6) this.rad -= 0.01*Math.PI;
        if (this.moveright && this.player.pipe.rad < 11*Math.PI/6) this.rad += 0.01*Math.PI;
        if (this.rad < 1*Math.PI && this.rad > 0.5*Math.PI) this.rad = 1*Math.PI;
        if (this.rad >= 0 && this.rad < 0.5*Math.PI) this.rad = 2*Math.PI;
        this.reset_coords();
    }
    render() {
        draw_line(this.player.color, this.coords);
    }
}

class Player extends GravityObject {
    constructor(pos, color_part) {
        super();
        this.pos = pos;
        this.color_part = color_part;
        this.color = set_color_opacity(color_part, 1);
        this.radius = 150;
        this.pipe = new Pipe(this);
        this.pressed_fire_prev = false;
        this.pressed_fire = false;
        this.collecting_fire_strength = false;
        this.fire_strength = 0;
        this.bullets = [];
        this.health = 100;
    }
    update() {
        // case: started pressing fire key
        if (!this.pressed_fire_prev && this.pressed_fire) {
            this.collecting_fire_strength = true;
        }
        if (this.pressed_fire_prev && !this.pressed_fire) {
            this.collecting_fire_strength = false;
            this.bullets.push(new Bullet(this.pipe, this.fire_strength));
            this.fire_strength = 0;
        }
        // collect fire strength
        if (this.collecting_fire_strength) this.fire_strength++;
        // set prev frame info
        this.pressed_fire_prev = this.pressed_fire;

        // update parts:
        // pipe
        this.pipe.update();
        // bullets
        // delete if outside screen
        // TODO delete if colliding w/ sth
        for (let bi = 0; bi < this.bullets.length; bi++) {
            this.bullets[bi].update();
            // delete tests
            // TODO take radius into account (for visuals)
            if (this.bullets[bi].pos.x < 0 || this.bullets[bi].pos.x > canv_w || this.bullets[bi].pos.y > canv_h) {
                this.bullets.splice(bi, 1);
            }
        }

        // test if hit
        for (let pi = 0; pi < players.length; pi++) {
            const player_attacker = players[pi];
            for (let bi = 0; bi < player_attacker.bullets.length; bi++) {
                const bullet = player_attacker.bullets[bi];
                for (let pi2 = 0; pi2 < players.length; pi2++) {
                    const player_pot_victim = players[pi2];
                    if (circle_overlap(bullet, player_pot_victim)) {
                        // hit --> delete bullet
                        players[pi].bullets.splice(bi, 1);
                        // also: reduce health of player who was hit
                        // TODO incorporate strength and weapon type
                        players[pi2].health -= 10;
                    }
                }
            }
        }
    }
    render() {
        // debug: draw health as brightness
        this.color = set_color_opacity(this.color_part, this.health/100);

        draw_circ(this.pos, this.radius, true, this.color, [1*Math.PI, 0]);
        // render parts:
        // pipe
        this.pipe.render();
        // bullets
        for (let bi = 0; bi < this.bullets.length; bi++) {
            this.bullets[bi].render();
        }
    }
}