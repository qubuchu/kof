import { GameMap } from "./game_map/base";
import { Controller } from '@/assets/scripts/game/controller/Controller';
import * as THREE from 'three';
// import $ from 'jquery'
import { Role1 } from "./player/role/Role1";
import * as Ammo from '@cocos/ammo'

export class KOF {
    constructor(id) {
        // this.$kof = $('#' + id);
        // this.id = id;
        console.log(id);

        this.clock = new THREE.Clock();

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,//宽高比
            0.1,
            1000);

        this.camera.position.z = 10;
        this.camera.position.x = 0;
        this.camera.position.y = 5;
        this.camera.lookAt(0, 0, 0);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement)

        // 三维场景
        this.scene = new THREE.Scene();
        this.controller = new Controller();
        this.game_map = new GameMap(this);

        let outer = this;

        // 物理
        //26min
        this.margin = 0.05; //碰撞范围
        this.ammo = null;
        this.world = null; // 物理世界
        this.rigidBodies = []; // 刚体物体
        this.transformAux1 = null; // 初始化 transformAux1

        Ammo().then((AmmoLib) => {
            outer.ammo = AmmoLib;
            // const transform = new AmmoLib.btTransform();
            outer.initPhysics();
            this.transformAux1 = new this.ammo.btTransform();
            this.players = [
                new Role1(this, {
                    id: 0,
                    x: -2,
                    y: 3,
                    z: 2
                }),
                new Role1(this, {
                    id: 1,
                    x: 2,
                    y: 5,
                    z: 2
                })
            ]
            animate();
        });

        function animate() {
            requestAnimationFrame(animate);

            // 更新三维世界
            outer.render();

            // 更新物理世界
            if (outer.world) {
                outer.world.stepSimulation(1 / 60, 10);
                for (let i = 0; i <= 1; i++) {
                    if (outer.players[i] && outer.players[i].rigidBody) {
                        // const transform = new outer.ammo.btTransform();
                        // transform.setIdentity();
                        // transform.setOrigin(new outer.ammo.btVector3(outer.players[i].x, outer.players[i].y, outer.players[i].z));
                        // outer.players[i].rigidBody.setCenterOfMassTransform(transform);

                        // // 其他代码
                        // outer.players[i].rigidBody.getMotionState().getWorldTransform(transform);
                        // const position = transform.getOrigin();
                        // console.log('刚体位置信息:', i, position.x(), position.y(), position.z());

                        var objThree = outer.rigidBodies[i];
                        var objPhys = objThree.userData.physicsBody;
                        var ms = objPhys.getMotionState();
                        if (ms && outer.transformAux1) {
                            ms.getWorldTransform(outer.transformAux1);
                            var p = outer.transformAux1.getOrigin();
                            var q = outer.transformAux1.getRotation();
                            objThree.position.set(p.x(), p.y(), p.z());
                            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                        }


                    } else {
                        console.error("物体或刚体对象不存在或为null。");
                    }
                }
            }
        }

    }

    start() {

    }

    render() {
        // var deltaTime = this.clock.getDelta();

        this.renderer.render(this.scene, this.camera);
        // this.updatePhysics(deltaTime);
    }

    initPhysics() {
        const collisionConfiguration = new this.ammo.btDefaultCollisionConfiguration();
        const dispatcher = new this.ammo.btCollisionDispatcher(collisionConfiguration);
        const overlappingPairCache = new this.ammo.btDbvtBroadphase();
        const solver = new this.ammo.btSequentialImpulseConstraintSolver();
        this.world = new this.ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.world.setGravity(new this.ammo.btVector3(0, -9.8, 0));
    }
}