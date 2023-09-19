import * as THREE from 'three';
import { gsap } from "gsap";
import { basics } from './libs/graphics.js';
import { cannon} from './cannon.js';

class main {
    constructor() {
        this.basics = new basics(this);
    }

    update(t, dt) {
        //if (t < 4) console.log(this.triplet[0])
        //this.set_directions();
        this._cannon.update(t, dt)
    }

    _init() {
        const triplet = [
            new THREE.Vector3(2,0,0),
            new THREE.Vector3(2,2,2),
            new THREE.Vector3(0,0,2),
        ];
        const arrows = [this.basics.create_arrow(triplet[0]),
            this.basics.create_arrow(triplet[1]),
            this.basics.create_arrow(triplet[2])];

        this.triplet = triplet;
        this.arrows = arrows;

        ////////////////////////////

        const geo = new THREE.BoxGeometry(1,1,1);
        const loader = new THREE.TextureLoader();
        const texture = loader.load('/grid.png');
        const mat = new THREE.MeshPhongMaterial({
            color : 0xff00ff,
            map : texture,
        });
        this.m = new THREE.Matrix4(); 
        this.set_directions();

        const box = new THREE.Mesh(geo, mat);
        box.matrixAutoUpdate = false;
        box.matrix = this.m;
        console.log(box.matrix);

        this.basics.scene.add(box);
        this.box = box;

        const dur = 5;
        console.log(triplet[0]);
        gsap.to(triplet[0], { x : 4, y : 2, duration : dur, });
        gsap.to(triplet[1], { x : -dur, duration : dur });
        gsap.to(triplet[2], { x : 1, z : 6, y :1, duration : dur,});
    }

    set_directions () {
        const tri = this.triplet;
        this.m.set(  tri[0].x , tri[1].x, tri[2].x, (tri[0].x + tri[1].x + tri[2].x)/2 , 
                    tri[0].y , tri[1].y, tri[2].y, (tri[0].y + tri[1].y + tri[2].y)/2, 
                    tri[0].z , tri[1].z, tri[2].z, (tri[0].z + tri[1].z + tri[2].z)/2, 
                    0,              0,           0,            1); 
        
        this.arrows.forEach((tmp, idx)=> {
            tmp.set_direction(tri[idx]);
        });
    }

    run() {
        //this._init();
        this._cannon = new cannon(this);
        this.basics.update(0);
    }
}

const app = new main();
app.run();