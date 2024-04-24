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

        //添加世界坐标辅助器
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);


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
            // outer.createObjects();
        });

    }

    createObjects() {
        var pos = new THREE.Vector3();
        var quat = new THREE.Quaternion();

        pos.set(0, 0, 0);
        quat.set(0, 0, 0, 1);
        var ground = this.createParallelepiped(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        ground.castShadow = true;
        ground.receiveShadow = true;
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load('/static/image/grid.png', function (textuer) {
            textuer.wrapS = THREE.RepeatWrapping;
            textuer.wrapT = THREE.RepeatWrapping;
            textuer.repeat.set(40, 40);
            ground.material.map = textuer;
            ground.material.needsUpdate = textuer;
        })
    }

    createParallelepiped(sx, sy, sz, mass, pos, quat, material) {
        var threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
        var shape = new this.root.ammo.btBoxShape(new this.root.ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(0.05);

        this.createRigidBody(threeObject, shape, 1, pos, quat);

        return threeObject;
    }

    createRigidBody(threeObject, physicsShape, mass, pos, quat) {
        threeObject.position.copy(pos);
        threeObject.quaternion.copy(quat);

        // 创建刚体并将碰撞体关联起来
        var transform = new this.root.ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new this.root.ammo.btVector3(this.x, this.y, this.z));
        transform.setRotation(new this.root.ammo.btDefaultMotionState(quat.x, quat.y, quat.z, quat.w));
        const motionState = new this.root.ammo.btDefaultMotionState(transform);

        const localInertia = new this.root.ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia); // 质量设为1，惯性设为localInertia

        var rbInfo = new this.root.ammo.btRigidBodyConstructionInfo(1, motionState, physicsShape, localInertia);
        var body = new this.root.ammo.btRigidBody(rbInfo);

        threeObject.userData.physicsBody = body;

        this.root.scene.add(threeObject);

        if (mass > 0) {
            this.root.rigidBodies.push(threeObject);

            body.setActivationState(4);
        }

        this.root.world.addRigidBody(body);

        return body;
    }

    update() {

    }

    render() {

    }
}