// renderer, scene, camera
// input
// arrows

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

//import Background from '../public/sky.hdr';

let prev_time = 0;
let _vector = {
    zero : new THREE.Vector3(0, 0, 0),
    forward : new THREE.Vector3(0, 0, -1),
    right : new THREE.Vector3(1, 0, 0),
    up : new THREE.Vector3(0, 1, 0),
}

export class basics {
    constructor(parent) {
        this.parent = parent;
        this.canvas = document.querySelector("#c");
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this._keys = {
            forward : false,
            backward : false,
            left_turn : false,
            right_turn : false,
            up_pitch : false,
            down_pitch : false,
        };

        this._init();
    }

    _init() {
        this._set_renderer();
        this._set_scene();
        this._set_camera_and_control();
        this._set_lights();
        this._set_event_handlers();
    }

    _set_renderer() {
        const renderer= new THREE.WebGLRenderer({
            canvas : this.canvas, 
            antialias : true
        });

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.localClippingEnabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        renderer.setSize(this.width, this.height);
        this.renderer = renderer;
    }

    _set_scene() {
        const scene = new THREE.Scene();

        const loadingManager = new THREE.LoadingManager();
        const progressBar = document.querySelector('#progress-bar');
        loadingManager.onProgress = function(url, loaded, total) {
            //console.log(url);
            if (!total) total = 1;
            progressBar.value = (loaded/total)*100;
        }
        const progressBarContainer = document.querySelector('.progress-bar-container');
        loadingManager.onLoad = function() {
            progressBarContainer.style.display = 'none';
        }

        let pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        let envMap;
        new RGBELoader(loadingManager)
            .setDataType(THREE.FloatType)
            .load('/sky.hdr', (hdrmap)=>{
                envMap = pmremGenerator.fromEquirectangular(hdrmap);
                scene.background = envMap.texture;
                scene.environment = envMap.texture;
                dispatchEvent(new CustomEvent('start'));
                hdrmap.dispose();
                pmremGenerator.dispose();
            });
     
        scene.add(new THREE.AxesHelper(10));
        this.scene = scene;
    }

    _set_camera_and_control() {
        const aspect = this.width/this.height;
        const camera = new THREE.PerspectiveCamera(this.fov, aspect, .1, 1000 );
        //this.scene.add(camera);
        camera.position.set(-5, 5, 5);
        this.camera = camera;

        const control = new OrbitControls(camera, this.renderer.domElement);
        control.enableDamping = true;
        control.dampingFactor = .5;
        control.enableZoom = true;
        this.control = control;

        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    _set_lights() {
        const ambientLight = new THREE.AmbientLight(0x444444, .5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.botton = -32;
        directionalLight.shadow.camera.top = 32;
        directionalLight.shadow.camera.left = -32;
        directionalLight.shadow.camera.right = 32;
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);
    }
    _set_lights2() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.botton = -32;
        directionalLight.shadow.camera.top = 32;
        directionalLight.shadow.camera.left = -32;
        directionalLight.shadow.camera.right = 32;
        directionalLight.position.set(0, 10, -4);
        this.scene.add(directionalLight);
    }

    _set_event_handlers() {
        addEventListener('resize', (e)=>{
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            let aspect = this.width/this.height;
            this.camera.aspect=aspect;
            this.camera.updateProjectionMatrix();
            
            this.renderer.setSize(this.width, this.height);
        });

        document.addEventListener('keydown', (e)=> {this._on_keydown(e);}, false);
        document.addEventListener('keyup', (e)=>{this._on_keyup(e);}, false);
    }

    _on_keydown(e) {
        const keys = this._keys;
        switch (e.code) {
            case 'KeyW' :
                keys.forward = true;
                break;
            case 'KeyS' :
                keys.backward = true;
                break;
            case 'KeyA' :
                keys.left_turn = true;
                break;
            case 'KeyD' :
                keys.right_turn = true;
                break;

            case 'ArrowUp' :
                keys.up_pitch = true;
                break;

            case 'ArrowDown' :
                keys.down_pitch = true;
                break;
        }
    }

    _on_keyup(e) {
        const keys = this._keys;
        switch (e.code) {
            case 'KeyW' :
                keys.forward = false;
                break;
            case 'KeyS' :
                keys.backward = false;
                break;
            case 'KeyA' :
                keys.left_turn = false;
                break;
            case 'KeyD' :
                keys.right_turn = false;
                break;
            case 'ArrowUp' :
                keys.up_pitch = false;
                break;
            case 'ArrowDown' :
                keys.down_pitch = false;
                break;
        }
    }

    update(time) {
        requestAnimationFrame(this.update.bind(this));

        time *= 0.001;
        const dt = time - prev_time;

        this.stats.update();
        this.control.update();
        
        const renderer = this.renderer, scene = this.scene;
        const camera = this.camera;
        //const orthoCamera = this.orthoCamera;
     
        //renderer.setViewport(0, 0, this.width, this.height);
        renderer.render(scene, camera);
        
        this.parent.update(time, dt);
        prev_time = time;
    }

    /////////////////////////

    create_arrow(direction) {
        const arrow = new Arrow(direction);
        this.scene.add(arrow.container);

        return arrow;
    }

}


class Arrow {
    constructor(direction = _vector.up, color=0xffffff) {
        this.container = new THREE.Object3D();
        this.length = 1;

        this.make_shape(color);
        this.set_direction(direction);
    }

    make_shape(color) {
        const radius = 0.005,  division = 6 , length = this.length;
        const tip_height = 0.04;

        const mat = new THREE.MeshBasicMaterial({color,});
        const cylinder = new THREE.CylinderGeometry(radius, radius, length, division);
        const bar = new THREE.Mesh(cylinder, mat);
        //bar.castShadow = true;

        this.container.add(bar);
        this.bar = bar;

        //////////////////////////////////////////////////////

        this.cone = new THREE.ConeGeometry(Math.max(4*radius, 0.04), tip_height, division);
        const tip = new THREE.Mesh(this.cone, mat);
        //tip.castShadow = true;
        this.container.add(tip);
        this.tip = tip;
    }
    
    set_direction(dir) {
        const init_vector = new THREE.Vector3(0,1,0);
        this.direction = dir;
        this.length = dir.length();
        const _bar_length = Math.max(0.98 * this.length, 0.1);

        const axis_vector = init_vector.clone().cross(dir);
        if (axis_vector.equals( _vector.zero) ){
            this.axis_vector = new THREE.Vector3(1, 0, 0);
            this.angle = 0;
        } 
        
        this.axis_vector = axis_vector.normalize();
        this.angle = init_vector.angleTo(dir);
        
        ////////////////////////////

        this.bar.scale.set(1, _bar_length, 1);
        this.bar.quaternion.setFromAxisAngle(this.axis_vector, this.angle);
        
        const unit_vector = dir.clone().normalize();
        this.origin = unit_vector.clone().multiplyScalar(_bar_length/2);
        this.bar.position.set(...this.origin);

        //////////////////////////////

        this.tip.scale.set(1, _bar_length, 1);
        this.tip.quaternion.setFromAxisAngle(this.axis_vector, this.angle);

        const tip_origin = unit_vector.clone().multiplyScalar(_bar_length);
        this.tip.position.set(...tip_origin);
    }
    

    set_scale(t) {
        let tmp = this.origin.clone().multiplyScalar(t);
        //console.log(this.origin);
        bar.scale.set(1, t, 1);
        bar.position.set(...tmp);

        tip.position.set(...tmp.clone().multiplyScalar(2));
    }


    update(t) {

    }
}

