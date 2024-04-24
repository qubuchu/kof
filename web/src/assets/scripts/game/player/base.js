import { GameObject } from "../gameobject/base";
// import * as Ammo from '@cocos/ammo'
// import { AmmoPhysics } from 'three/examples/jsm/physics/AmmoPhysics.js'; // 导入 AmmoPhysics 以使用物理引擎


export class Player extends GameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.z = info.z;

        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        this.speedxz = 20;
        this.speedy = -40;

        this.gravity = 2;

        this.pressed_keys = this.root.controller.pressed_keys;

        this.status = 2; //人物状态机 0: 站立 1: 奔跑 2: 跳跃 3: 攻击1 4: 攻击2 5: 闪避 6: 被打 7: 死亡 
        this.animations = new Map();
        this.actions = [];
        this.frame_current_cnt = 0;

        this.hp = 100;

        this.collider = null;//碰撞体对象
        this.rigidBody = null;//刚体对象
    }


    update_control() {
        let w, a, s, d, space, j, k;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            s = this.pressed_keys.has('s');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
            j = this.pressed_keys.has('j');
            k = this.pressed_keys.has('k');
        }

        if (this.status === 0 || this.status === 1 || this.status === 3 || this.status === 4) {
            if (j) {
                this.status = 3;
                this.vx = this.vz = 0;
                this.frame_current_cnt = 0;
            }
            else if (k) {
                this.status = 4;
                this.vx = this.vz = 0;
                this.frame_current_cnt = 0;
            }
            else if (space) {
                if (w) {
                    this.vz = -this.speedxz;
                    if (a) {
                        this.vx = -this.speedxz;
                    }
                    else if (d) {
                        this.vx = this.speedxz;
                    }
                    else {
                        this.vx = 0;
                    }
                }
                else if (s) {
                    this.vz = this.speedxz;
                    if (a) {
                        this.vx = -this.speedxz;
                    }
                    else if (d) {
                        this.vx = this.speedxz;
                    }
                    else {
                        this.vx = 0;
                    }
                }
                else if (a) {
                    this.vx = -this.speedxz;
                    if (w) {
                        this.vz = -this.speedxz;
                    }
                    else if (s) {
                        this.vz = this.speedxz;
                    }
                    else {
                        this.vz = 0;
                    }
                }
                else if (d) {
                    this.vx = this.speedxz;
                    if (w) {
                        this.vz = -this.speedxz;
                    }
                    else if (s) {
                        this.vz = this.speedxz;
                    }
                    else {
                        this.vz = 0;
                    }
                }
                else {
                    this.vx = 0;
                    this.vz = 0;
                }
                this.vy = this.speedy;
                this.status = 2;
                this.frame_current_cnt = 0;
            }
            else if (w) {
                this.vz = -this.speedxz;
                if (a) {
                    this.vx = -this.speedxz;
                }
                else if (d) {
                    this.vx = this.speedxz;
                }
                else {
                    this.vx = 0;
                }
                this.status = 1;
            }
            else if (s) {
                this.vz = this.speedxz;
                if (a) {
                    this.vx = -this.speedxz;
                }
                else if (d) {
                    this.vx = this.speedxz;
                }
                else {
                    this.vx = 0;
                }
                this.status = 1;
            }
            else if (a) {
                this.vx = -this.speedxz;
                this.status = 1;
            }
            else if (d) {
                this.vx = this.speedxz;
                this.status = 1;
            }
            else {
                this.vx = 0;
                this.vz = 0;
                this.status = 0;
            }
        }
    }

    update_move() {
        if (!this.rigidBody) {
            console.error("刚体对象为空，无法更新移动。");
            return;
        }

        // this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 10000;
        this.y -= this.vy * this.timedelta / 10000;
        this.z += this.vz * this.timedelta / 10000;

        if (this.y < 0.35) {
            this.y = 0.35;
            this.vy = 0;

            if (this.status === 2) this.status = 0;
        }

        if (this.x > 5) {
            this.x = 5;
        } else if (this.x < -5) {
            this.x = -5;
        }

        if (this.z > 5) {
            this.z = 5;
        } else if (this.z < -5) {
            this.z = -5;
        }

        // this.root.players[this.id].role.position.x = this.x;
        // this.root.players[this.id].role.position.y = this.y;
        // this.root.players[this.id].role.position.z = this.z;

        if (this.rigidBody) {
            const transform = new this.root.ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new this.root.ammo.btVector3(this.x, this.y, this.z));
            this.rigidBody.setCenterOfMassTransform(transform);
        } else {
            console.error("刚体对象为空，无法设置位置。");
        }

        if (this.root.players[this.id] && this.root.players[this.id].role) {
            this.root.players[this.id].role.position.x = this.x;
            this.root.players[this.id].role.position.y = this.y;
            this.root.players[this.id].role.position.z = this.z;
        } else {
            console.error("角色或角色对象为空，无法更新位置。");
        }
    }

    checkCollisions() {
        const numObjects = this.root.rigidBodies.length;
        for (let i = 0; i < numObjects; i++) {
            for (let j = i + 1; j < numObjects; j++) {
                const bodyA = this.root.rigidBodies[i];
                const bodyB = this.root.rigidBodies[j];
                const collision = this.checkCollision(bodyA, bodyB);
                if (collision) {
                    console.log("碰撞发生!");
                    // 在这里处理碰撞事件
                }
            }
        }
    }

    checkCollision(bodyA, bodyB) {
        // 检查两个物体是否发生了碰撞
        // 这里是你实现的碰撞检测逻辑
        console.log(bodyA, bodyB);
        return false; // 返回true表示发生了碰撞
    }

    is_attack() {
        if (this.status === 0) return;

        this.status = 6;
        this.frame_current_cnt = 0;

        this.hp = Math.max(this.hp - 20, 0);

        if (this.hp <= 0) {
            this.status = 7;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    update_attack() {
        this.checkCollision(this.root.players[0], this.root.players[1]);
    }

    update() {
        // Ammo().then(() => {
        //     this.update_move();
        //     this.update_control();
        //     this.update_attack();

        //     this.render();
        // })
    }

    update_action(idx) {
        for (let i = 0; i < 8; i++) {
            if (i != idx)
                this.actions[i].stop();
            else
                this.actions[i].play();
        }
    }

    render() {
        let role = this.root.players[this.id];
        const outer = this;
        if (role.clips && role.clips.length > 0) {
            outer.update_action(this.status);
        }
        if (role.mixer)
            role.mixer.update(0.02);
    }
}