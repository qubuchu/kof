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

        this.mass = 1;
    }

    start() {
        let gltfLoader = new GLTFLoader();
        let outer = this;

        Ammo().then(() => {
            gltfLoader.load(
                "/static/model/role1/scene.gltf",
                function (gltf) {
                    gltf.scene.position.set(outer.x, outer.y, outer.z);
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
        this.collider = new this.root.ammo.btCapsuleShape(0.6, 0.3); // 参数为半径和高度
        this.collider.setMargin(this.root.margin);

        this.createRigidBody(this.role, this.collider, 1);
    }

    createRigidBody(threeObject, physicsShape, mass) {
        // 创建刚体并将碰撞体关联起来
        var quat = new THREE.Quaternion();
        let a_id = this.root.players[0].id; // 右边玩家id
        let b_id = this.root.players[1].id; // 左边玩家id
        if (this.id === b_id) {
            console.log("create left");
            quat.set(0, 1, 0, Math.PI / 2);
        }
        if (this.id === a_id) {
            console.log("create right");
            quat.set(0, -1, 0, Math.PI / 2);
        }

        threeObject.quaternion.copy(quat);

        const startTransform = new this.root.ammo.btTransform();
        startTransform.setIdentity();

        startTransform.setOrigin(new this.root.ammo.btVector3(this.x, this.y, this.z));
        startTransform.setRotation(new this.root.ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        const motionState = new this.root.ammo.btDefaultMotionState(startTransform);

        const localInertia = new this.root.ammo.btVector3(0, 0, 0);
        physicsShape.calculateLocalInertia(mass, localInertia); // 质量设为1，惯性设为localInertia

        const rbInfo = new this.root.ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
        this.rigidBody = new this.root.ammo.btRigidBody(rbInfo);

        // 创建刚体的角动量因子，限制只能绕 Y 轴旋转
        const angularFactor = new this.root.ammo.btVector3(0, 0, 0); // X 轴和 Z 轴的角动量因子设置为 0，Y 轴的角动量因子设置为 1

        // 设置刚体的角动量因子
        this.rigidBody.setAngularFactor(angularFactor);

        threeObject.userData.physicsBody = this.rigidBody;

        this.root.scene.add(threeObject);

        if (mass > 0) { // A玩家的刚体存放在rigidBodyies[0]中
            let id = 0;
            if (this.id == this.root.players[0].id)// 当前角色为A
                id = 0;
            else
                id = 1;
            this.root.rigidBodies[id] = threeObject;

            this.rigidBody.setActivationState(4);
        }


        this.root.physicsWorld.addRigidBody(this.rigidBody);
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