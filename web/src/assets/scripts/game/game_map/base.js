import { GameObject } from "../gameobject/base";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import * as Ammo from '@cocos/ammo';

export class GameMap extends GameObject {
    constructor(root) {
        super();

        this.root = root;

        this.scene = root.scene;
    }
    // 44min
    start() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 环境光
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 方向光
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const gltfLoader = new GLTFLoader();
        let outer = this;

        Ammo().then(() => {
            gltfLoader.load(
                "/static/model/map1_gltf/scene.gltf",
                function (gltf) {
                    gltf.scene.position.set(0, 0, 0);
                    outer.root.scene.add(gltf.scene);
                }
            )
        });

    }

    update() {

    }

    render() {

    }
}