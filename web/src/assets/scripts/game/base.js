import { GameMap } from "./game_map/base";
import { Controller } from '@/assets/scripts/game/controller/Controller';
import * as THREE from 'three';
// import $ from 'jquery'
import { Role1 } from "./player/role/Role1";
import * as Ammo from '@cocos/ammo'

export class KOF {
    constructor(store) {

        this.store = store;
        this.camera = null;
        this.scene = null;
        this.renderer = null;
        this.textureLoader = null;
        this.clock = new THREE.Clock();
        this.cube1 = null;
        this.cube2 = null;
        this.dirction = null;

        this.gravityConstant = -200;
        this.collisionConfiguration = null;
        this.dispatcher = null;
        this.broadphase = null;
        this.solver = null;
        this.physicsWorld = null;

        this.rigidBodies = [];
        this.margin = 0.05;

        this.time = 0;

        this.loser = null;

        this.ammo = null;
        let outer = this;
        this.transformAux1 = null;
        Ammo().then((AmmoLib) => {
            outer.ammo = AmmoLib;
            outer.transformAux1 = new outer.ammo.btTransform();
            outer.init();
            this.controller = new Controller();
            this.game_map = new GameMap(this);
            function updatePlayers(callback) {
                // 假设这里进行了一些更新操作，然后调用回调函数
                // 模拟更新完成后调用回调函数
                callback();
            }

            // 定义一个回调函数，在更新完成后执行
            function callbackFunction() {
                // 在这里可以进行你想要的操作，比如访问和操作角色对象
                outer.players = [
                    new Role1(outer, {
                        id: outer.store.state.pk.a_id,
                        x: outer.store.state.pk.a_sx,
                        y: outer.store.state.pk.a_sy,
                        z: outer.store.state.pk.a_sz,
                    }),
                    new Role1(outer, {
                        id: outer.store.state.pk.b_id,
                        x: outer.store.state.pk.b_sx,
                        y: outer.store.state.pk.b_sy,
                        z: outer.store.state.pk.b_sz,
                    })
                ]
            }

            // 调用 updatePlayers，并传入回调函数作为参数
            updatePlayers(callbackFunction);
            this.initCompleteCallback();// 回调函数
        })
    }

    destroy() {
        // 移除场景中的所有对象
        console.log("destroy begin");

        let outer = this;
        this.scene.children.forEach(obj => {
            if (obj.userData && obj.userData.physicsBody) {
                // 如果对象有物理属性，先从物理引擎中移除
                this.physicsWorld.removeRigidBody(obj.userData.physicsBody);
            }
            outer.scene.remove(obj);
        });



        // 释放渲染器相关资源
        this.renderer.dispose();

        // 释放其他资源
        this.physicsWorld = null;
        this.collisionConfiguration = null;
        this.dispatcher = null;
        this.broadphase = null;
        this.solver = null;

        // 清空场景中的对象数组
        this.rigidBodies = [];

        // 清空其他变量和引用
        this.camera = null;
        this.textureLoader = null;
        this.cube1 = null;
        this.cube2 = null;
        this.dirction = null;
        this.transformAux1 = null;
        console.log("destroy over");
    }

    initCompleteCallback() {
        if (this.store.state.pk.loser != "none")
            return;
        this.animate(); // 在回调函数中执行
    }

    init() {
        this.initGraphics();

        this.initPhysics();

        this.createObjects();
    }


    start() {

    }

    initGraphics() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.x = 0;
        this.camera.position.y = 10;
        this.camera.position.z = 5;
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xbfd1e5);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        this.textureLoader = new THREE.TextureLoader();

        // 场景
        this.scene = new THREE.Scene();

        // 环境光
        var ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // 线性光
        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-10, 10, 5);
        light.castShadow = true;
        var d = 10;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;

        light.shadow.camera.near = 2;
        light.shadow.camera.far = 2;

        light.shadow.mapSize.x = 1024;
        light.shadow.mapSize.y = 1024;

        this.scene.add(light);

        // 创建长方体的几何体，参数分别是长、宽、高
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 1);

        // 创建材质，设置为红色
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // 创建长方体的网格对象，将几何体和材质传入构造函数
        this.cube0 = new THREE.Mesh(geometry, material);
        this.cube1 = new THREE.Mesh(geometry, material);

        this.scene.add(this.cube0);
        this.scene.add(this.cube1);

        document.body.appendChild(this.renderer.domElement);
    }

    initPhysics() {
        this.collisionConfiguration = new this.ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new this.ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new this.ammo.btDbvtBroadphase();
        this.solver = new this.ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new this.ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
        this.physicsWorld.setGravity(new this.ammo.btVector3(0, this.gravityConstant, 0));
    }

    createObjects() {
        var pos = new THREE.Vector3();
        var quat = new THREE.Quaternion();

        // 创建地面
        pos.set(0, -1, 0);
        quat.set(0, 0, 0, 1);
        var ground = this.createParallellepiped(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        ground.castShadow = true;       // 开启投影
        ground.receiveShadow = true;    // 接受阴影(可以在表面上显示阴影)
        this.textureLoader.load("/static/image/grid.png", function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(40, 40);
            ground.material.map = texture;
            ground.material.needsUpdate = texture;
        });

        pos.set(-5.7, 1, 0);
        var wall_left = this.createParallellepiped(1, 10, 10, 0, pos, quat, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
        wall_left.castShadow = false;

        pos.set(5.7, 1, 0);
        var wall_right = this.createParallellepiped(1, 10, 10, 0, pos, quat, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
        wall_right.castShadow = false;

        pos.set(0, 1, -5.7);
        var wall_top = this.createParallellepiped(10, 10, 1, 0, pos, quat, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
        wall_top.castShadow = false;

        pos.set(0, 1, 5.7);
        var wall_down = this.createParallellepiped(10, 10, 1, 0, pos, quat, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
        wall_down.castShadow = false;
    }


    createParallellepiped(sx, sy, sz, mass, pos, quat, material) {
        var threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
        var shape = new this.ammo.btBoxShape(new this.ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
        shape.setMargin(this.margin);

        this.createRigidBody(threeObject, shape, mass, pos, quat);

        return threeObject;
    }

    createRigidBody(threeObject, physicsShape, mass, pos, quat) {
        threeObject.position.copy(pos);
        threeObject.quaternion.copy(quat);

        var transform = new this.ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new this.ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new this.ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        var motionState = new this.ammo.btDefaultMotionState(transform);

        var localInertia = new this.ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia);

        var rbInfo = new this.ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        var body = new this.ammo.btRigidBody(rbInfo);

        threeObject.userData.physicsBody = body;

        this.scene.add(threeObject);

        if (mass > 0) {
            this.rigidBodies.push(threeObject);

            // Disable deactivation
            // 防止物体弹力过快消失

            // this.ammo.DISABLE_DEACTIVATION = 4
            body.setActivationState(4);
        } else {
            body.setFriction(0);
            body.setRestitution(0);
        }

        this.physicsWorld.addRigidBody(body);

        return body;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.render();
    }

    render() {
        var deltaTime = this.clock.getDelta();

        this.updatePhysics(deltaTime);

        this.renderer.render(this.scene, this.camera);

        this.time += deltaTime;
    }

    updatePhysics(deltaTime) {
        this.physicsWorld.stepSimulation(deltaTime);

        // 更新物体位置
        for (var i = 0, iL = this.rigidBodies.length; i < iL; i++) {
            if (this.players[0] && this.players[1]) {
                var objThree = this.rigidBodies[i];
                var objPhys = objThree.userData.physicsBody;
                var ms = objPhys.getMotionState();
                if (ms) {
                    ms.getWorldTransform(this.transformAux1);
                    var p = this.transformAux1.getOrigin();
                    var q = this.transformAux1.getRotation();
                    objThree.position.set(p.x(), p.y(), p.z());
                    objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                }
            }
        }
    }
}