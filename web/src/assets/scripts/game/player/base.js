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
        this.is_me = false;
        this.is_0 = false;
    }

    start() {
        if (this.id === this.root.store.state.user.id)
            this.is_me = true;
        else
            this.is_me = false;
        if (this.root.store.state.user.id === this.root.players[0].id) // 自己是0号玩家
            this.is_0 = true;
        else // 自己是1号玩家
            this.is_0 = false;
    }

    //角色移动
    setOperate(ow, os, oa, od, ospace, oj, ok) {
        let w, a, s, d, space, j, k;
        if (ow > 0)
            w = true;
        if (os > 0)
            s = true;
        if (oa > 0)
            a = true;
        if (od > 0)
            d = true;
        if (ospace > 0)
            space = true;
        if (oj > 0)
            j = true;
        if (ok > 0)
            k = true;

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

    // 因为玩家只能发送与自身id相同的socket请求， 而自身id要么是A_id, 要么是B_id， 角色移动只能通过后端进行，所以玩家只能控制一个角色，
    update_control() { // 监听控制输入
        let w, a, s, d, space, j, k;

        w = this.pressed_keys.has('w');
        a = this.pressed_keys.has('a');
        s = this.pressed_keys.has('s');
        d = this.pressed_keys.has('d');
        space = this.pressed_keys.has(' ');
        j = this.pressed_keys.has('j');
        k = this.pressed_keys.has('k');

        let ow = 0, os = 0, oa = 0, od = 0, ospace = 0, oj = 0, ok = 0;
        if (w) ow = 1; else ow = -1;
        if (s) os = 1; else os = -1;
        if (a) oa = 1; else oa = -1;
        if (d) od = 1; else od = -1;
        if (space) ospace = 1; else ospace = -1;
        if (j) oj = 1; else oj = -1;
        if (k) ok = 1; else ok = -1;

        let outer = this;

        outer.root.store.state.pk.socket.send(JSON.stringify({
            event: "operate",
            ow: ow,
            os: os,
            oa: oa,
            od: od,
            ospace: ospace,
            oj: oj,
            ok: ok,
        }));
    }

    update_move() {
        let velocity = new this.root.ammo.btVector3(this.vx * this.speedxz, this.vy * this.speedy, this.vz * this.speedxz);
        this.rigidBody.setLinearVelocity(velocity);

        let id = 0;
        if (this.id == this.root.players[0].id) // 当前角色为A
            id = 0;
        else
            id = 1;
        var objThree = this.root.rigidBodies[id];
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
        if (id === 0) // 当前角色为A, 位于右边
            this.root.cube0.position.set(this.x - 0.1, this.y + 1.4, this.z);
        if (id === 1)
            this.root.cube1.position.set(this.x + 0.1, this.y + 1.4, this.z);
    }

    is_attack() { // 受到攻击
        if (this.status === 7) return;

        this.status = 6;
        this.frame_current_cnt = 0;

        this.hp = Math.max(this.hp - 20, 0);
        let id = 0;
        if (this.id == this.root.store.state.user.id)
            id = 0;
        else
            id = 1;
        if (id === 0) {
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

    is_collision(r1, r2) { // r1刚体和r2刚体是否发生碰撞发生碰撞
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

    update_attack() { // 攻击
        let you = null;
        if (this.is_0) // 如果自己是A玩家
            you = this.root.players[1];
        else
            you = this.root.players[0];
        let outer = this;

        if (this.status === 4 && this.frame_current_cnt === 40) {
            if (this.is_collision(this.rigidBody, you.rigidBody)) {
                console.log("打中了！");
                outer.root.store.state.pk.socket.send(JSON.stringify({
                    event: "fight",
                    hp: "20",
                    id: you.id,
                }));
                you.is_attack();
            }
            // this.root.destory(leg);
            this.frame_current_cnt = 0;
        }
        if (this.status === 3 && this.frame_current_cnt === 30) {
            if (this.is_collision(this.rigidBody, you.rigidBody)) {
                console.log("打中了！");
                outer.root.store.state.pk.socket.send(JSON.stringify({
                    event: "fight",
                    hp: "20",
                    id: you.id,
                }));
                you.is_attack();
            }
            this.frame_current_cnt = 0;
        }
    }

    update() {
        if (this.role && this.role.userData && this.role.userData.physicsBody) {
            // 安全地访问 objThree.userData.physicsBody
            this.frame_current_cnt++;
            this.update_move();
            this.update_control();
            this.update_attack();
            this.render();
        } else {
            console.error("对象或属性未定义。");
        }
    }

    update_action(idx) { // 播放动画
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

    render() { // 渲染
        let id = 0;
        if (this.id == this.root.store.state.user.id)
            id = 0;
        else
            id = 1;
        let role = this.root.players[id];
        const outer = this;
        if (role.clips && role.clips.length > 0) {
            outer.update_action(this.status);
        }
        if (role.mixer)
            role.mixer.update(0.02);
    }
}