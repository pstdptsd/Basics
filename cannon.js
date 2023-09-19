import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {modelURL} from '/cannon.glb';

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
  }

export class cannon {
    constructor(parent) {
        this.parent = parent;
        this.scene = parent.basics.scene;

        this._init();
    }

    _init() {
        const loader = new GLTFLoader();
        loader.load(modelURL, (gltf)=>{
            const model = gltf.scene;
            model.scale.set(.5, .5, .5);
            this.scene.add(model);
            console.log(dumpObject(model).join('\n'));

            const mixer = new THREE.AnimationMixer(gltf.scene);
            this.mixer = mixer;

            const animations = gltf.animations;
            //console.log(animations);
            const action = mixer.clipAction(animations[1]);
            action.repetition = 3;
            action.play();
        });
    }

    update(t, dt) {
        if (this.mixer) {
            //console.log(t);
            this.mixer.update(dt);
        }
    }
}