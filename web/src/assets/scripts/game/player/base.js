import { GameObject } from "../gameobject/base";
// import { AmmoPhysics } from 'three/examples/jsm/physics/AmmoPhysics.js'; // 导入 AmmoPhysics 以使用物理引擎


export class Player extends GameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.z = info.z;

        // 1 表示正方向 0 表示静止 -1 表示负方向
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        this.speedxz = 5; // 水平移动速度
        this.speedy = 10; // 跳跃速度

        this.pressed_keys = this.root.controller.pressed_keys;

        this.status = 2; //人物状态机 0: 站立 1: 奔跑 2: 跳跃 3: 攻击1 4: 攻击2 5: 闪避 6: 被打 7: 死亡 
        this.animations = new Map();
        this.actions = [];
        this.frame_current_cnt = 0;// 当前动画播放了多少秒

        this.hp = 100;

        this.collider = null;//碰撞体对象
        this.rigidBody = null;//刚体对象
        this.body = null;

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
            let flag = this.status;
            if (j) {
                this.status = 3;
                this.vx = this.vz = 0;
                if (flag != 3)
                    this.frame_current_cnt = 0;
            }
            else if (k) {
                this.status = 4;
                this.vx = this.vz = 0;
                if (flag != 4)
                    this.frame_current_cnt = 0;
            }
            else if (space) {
                if (w) {
                    this.vz = -1;
                    if (a) {
                        this.vx = -1;
                    }
                    else if (d) {
                        this.vx = 1;
                    }
                    else {
                        this.vx = 0;
                    }
                }
                else if (s) {
                    this.vz = 1;
                    if (a) {
                        this.vx = -1;
                    }
                    else if (d) {
                        this.vx = 1;
                    }
                    else {
                        this.vx = 0;
                    }
                }
                else if (a) {
                    this.vx = -1;
                    if (w) {
                        this.vz = -1;
                    }
                    else if (s) {
                        this.vz = 1;
                    }
                    else {
                        this.vz = 0;
                    }
                }
                else if (d) {
                    this.vx = 1;
                    if (w) {
                        this.vz = -1;
                    }
                    else if (s) {
                        this.vz = 1;
                    }
                    else {
                        this.vz = 0;
                    }
                }
                else {
                    this.vx = 0;
                    this.vz = 0;
                }
                this.vy = 1;
                this.status = 2;
                this.frame_current_cnt = 0;
            }
            else if (w) {
                this.vz = -1;
                if (a) {
                    this.vx = -1;
                }
                else if (d) {
                    this.vx = 1;
                }
                else {
                    this.vx = 0;
                }
                this.status = 1;
                this.frame_current_cnt = 0;
            }
            else if (s) {
                this.vz = 1;
                if (a) {
                    this.vx = -1;
                }
                else if (d) {
                    this.vx = 1;
                }
                else {
                    this.vx = 0;
                }
                this.status = 1;
                this.frame_current_cnt = 0;
            }
            else if (a) {
                this.vx = -1;
                this.status = 1;
                this.frame_current_cnt = 0;
            }
            else if (d) {
                this.vx = 1;
                this.status = 1;
                this.frame_current_cnt = 0;
            }
            else {
                this.vx = 0;
                this.vz = 0;
                this.status = 0;
                this.frame_current_cnt = 0;
            }
        }
    }

    update_move() {
        let velocity = new this.root.ammo.btVector3(this.vx * this.speedxz, this.vy * this.speedy, this.vz * this.speedxz);
        this.rigidBody.setLinearVelocity(velocity);

        var objThree = this.root.rigidBodies[this.id];
        var objPhys = objThree.userData.physicsBody;
        var ms = objPhys.getMotionState();
        if (ms) {
            ms.getWorldTransform(this.root.transformAux1);
            var p = this.root.transformAux1.getOrigin();
            objThree.position.set(p.x(), p.y(), p.z());
            this.x = p.x();
            this.y = p.y();
            this.z = p.z();
            if (p.y() < 0.3 && p.y() > 0) {
                this.vy = 0;

                if (this.status === 2) {
                    this.status = 0;
                    this.frame_current_cnt = 0;
                }
            }
            if (p.y() > 1.5) {
                this.vy = 0;
            }

            if (p.x() > 5) {
                this.vx = 0;
            } else if (p.x() < -5) {
                this.vx = 0;
            }

            if (p.z() > 5) {
                objThree.position.set(p.x(), p.y(), 5);
            } else if (p.z() < -5) {
                objThree.position.set(p.x(), p.y(), -5);
            }
        }

        if (this.id === 0)
            this.root.cube0.position.set(this.x - 0.1, this.y + 1.4, this.z);
        if (this.id === 1)
            this.root.cube1.position.set(this.x + 0.1, this.y + 1.4, this.z);
    }

    is_attack() {
        if (this.status === 7) return;

        this.status = 6;
        this.frame_current_cnt = 0;

        this.hp = Math.max(this.hp - 20, 0);
        if (this.id === 0) {
            this.root.cube0.scale.set(1, 1, this.hp / 100);
            if (this.hp <= 0) {
                this.root.cube0.scale.set(0, 0, 0);
            }
        } else {
            this.root.cube1.scale.set(1, 1, this.hp / 100);
            if (this.hp <= 0) {
                this.root.cube1.scale.set(0, 0, 0);
            }
        }

        if (this.hp <= 0) {
            this.status = 7;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    is_collision(r1, r2) {
        const numManifolds = this.root.dispatcher.getNumManifolds();

        for (let i = 0; i < numManifolds; i++) {
            const contactManifold = this.root.dispatcher.getManifoldByIndexInternal(i);
            const numContacts = contactManifold.getNumContacts();

            if (numContacts > 0) {
                const objectA = contactManifold.getBody0();
                const objectB = contactManifold.getBody1();

                if (objectA['Il'] === r1['Il'] && objectB['Il'] === r2['Il']) {
                    return true;
                }
            }
        }


        return false;
    }

    update_attack() {
        let you = this.root.players[1 - this.id];
        if (this.is_collision(this, you)) {
            console.log("发生碰撞！");
        }
        if (this.status === 4 && this.frame_current_cnt === 40) {
            if (this.is_collision(this.rigidBody, you.rigidBody)) {
                console.log("打中了！");
                you.is_attack();
            }
            // this.root.destory(leg);
            this.frame_current_cnt = 0;
        }
        if (this.status === 3 && this.frame_current_cnt === 30) {
            if (this.is_collision(this.rigidBody, you.rigidBody)) {
                console.log("打中了！");
                you.is_attack();
            }
            this.frame_current_cnt = 0;
        }
    }

    update() {
        this.frame_current_cnt++;
        if (!this.rigidBody) {
            // console.error("刚体对象为空，无法更新移动。");
            return;
        }
        this.update_move();
        this.update_control();
        this.update_attack();
        this.render();
    }

    update_action(idx) {
        if (idx === 6 && this.frame_current_cnt === 20) {
            this.status = 0;
            this.frame_current_cnt == 0;
        }
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