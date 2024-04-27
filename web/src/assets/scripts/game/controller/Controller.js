export class Controller { // 当set里的值， 发生改变， 说明有按键操作
    constructor() {
        this.pressed_keys = new Set();//存放不重复的值
        this.start();
    }

    start() {
        let outer = this;
        document.addEventListener('keydown', (event) => {
            outer.pressed_keys.add(event.key)
        })
        document.addEventListener('keyup', (event) => {
            outer.pressed_keys.delete(event.key)
        })
    }
}