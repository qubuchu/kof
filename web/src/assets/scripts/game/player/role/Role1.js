import { Player } from '../base';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import * as Ammo from '@cocos/ammo'

//动画0 打气
//动画1 攻击
//动画2 躲闪
//动画3 倒地
//动画4 无力
//动画6 受击
//动画5 跳跃
//动画7 站立动作
//动画8 站立动作
//动画10 格斗姿态
//动画11 踢腿技能
//动画13 奔跑

export class Role1 extends Player {
    constructor(root, info) {
        super(root, info);

        this.role = new THREE.Group();
        this.mixer = null;
        this.clips = [];
        this.collider = null;
        this.rigidBody = null;
    }

    start() {
        let gltfLoader = new GLTFLoader();
        let outer = this;

        Ammo().then(() => {
            gltfLoader.load(
                "/static/model/role1/scene.gltf",
                function (gltf) {
                    gltf.scene.position.set(outer.x, outer.y, outer.z);
                    // outer.root.scene.add(gltf.scene);
                    outer.role = gltf.scene;

                    //物理相关
                    outer.createPhysicsShape();

                    //动画相关
                    outer.clips = gltf.animations;
                    outer.mixer = new THREE.AnimationMixer(outer.role);
                    if (outer.clips && outer.clips.length > 0) {
                        outer.init_animations();
                    }
                }
            )
        });
    }

    createPhysicsShape() {
        // 34min
        // 创建胶囊体碰撞体
        this.collider = new this.root.ammo.btCapsuleShape(1, 2); // 参数为半径和高度
        this.collider.setMargin(this.root.margin);

        this.createRigidBody(this.role, this.collider, 1);
    }

    createRigidBody(threeObject, physicsShape, mass) {
        // 创建刚体并将碰撞体关联起来
        const startTransform = new this.root.ammo.btTransform();
        startTransform.setIdentity();
        startTransform.setOrigin(new this.root.ammo.btVector3(this.x, this.y, this.z));
        const motionState = new this.root.ammo.btDefaultMotionState(startTransform);

        const localInertia = new this.root.ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia); // 质量设为1，惯性设为localInertia

        const rbInfo = new this.root.ammo.btRigidBodyConstructionInfo(1, motionState, physicsShape, localInertia);
        this.rigidBody = new this.root.ammo.btRigidBody(rbInfo);

        this.rigidBody.setUserIndex2(1); // 设置为第一个碰撞组

        threeObject.userData.physicsBody = this.rigidBody;

        this.root.scene.add(threeObject);

        if (mass > 0) {
            this.root.rigidBodies.push(threeObject);

            this.rigidBody.setActivationState(4);
        }

        this.root.world.addRigidBody(this.rigidBody);
    }


    init_animations() {
        let outer = this;
        this.animations.set(0, {
            action: outer.mixer.clipAction(outer.clips[10])
        })
        this.animations.set(1, {
            action: outer.mixer.clipAction(outer.clips[13])
        })
        this.animations.set(2, {
            action: outer.mixer.clipAction(outer.clips[5])
        })
        this.animations.set(3, {
            action: outer.mixer.clipAction(outer.clips[1])
        })
        this.animations.set(4, {
            action: outer.mixer.clipAction(outer.clips[11])
        })
        this.animations.set(5, {
            action: outer.mixer.clipAction(outer.clips[2])
        })
        this.animations.set(6, {
            action: outer.mixer.clipAction(outer.clips[6])
        })
        this.animations.set(7, {
            action: outer.mixer.clipAction(outer.clips[3])
        })
        for (let i = 0; i < 8; i++) {
            outer.actions[i] = this.animations.get(i).action;
        }
    }
}