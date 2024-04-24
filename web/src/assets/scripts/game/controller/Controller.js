export class Controller {
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

    // update(object) {
    //     if (this.pressed_keys.has('ArrowLeft')) {
    //         object.position.x -= 0.1;
    //     }
    //     if (this.pressed_keys.has('ArrowRight')) {
    //         object.position.x += 0.1;
    //     }
    //     if (this.pressed_keys.has('ArrowUp')) {
    //         object.position.z -= 0.1;
    //     }
    //     if (this.pressed_keys.has('ArrowDown')) {
    //         object.position.z += 0.1;
    //     }
    // }
}