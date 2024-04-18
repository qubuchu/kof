<template>
  <div id="container">
  </div>
</template>
 
<script>
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
 

export default {
  name: "MyScene",
  mounted() {//挂载后
    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,//宽高比
      0.1,
      1000);

    // 设置相机位置
    camera.position.z = 5;
    camera.position.x = 2;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement)

    // // 创建一个立方体并添加到场景中
    // //创建几何体
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // //创建材质
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // //创建网络
    // const cube = new THREE.Mesh(geometry, material);
    // //将网络添加到场景中
    // scene.add(cube);

    // 实例化加载器gltf
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      "/static/model/chunli/chunli.gltf",//加载默认在public下
      (gltf) => {
        console.log(gltf);
        scene.add(gltf.scene);
      }
    )

    //添加世界坐标辅助器
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    //添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);

    // 渲染循环
    const animate = () => {
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();

    // 监听窗口变化
    window.addEventListener("resize", () => {
      // 重置渲染器宽高比
      renderer.setSize(window.innerWidth, window.innerHeight);
      // 重置相机宽高变化
      camera.aspect = window.innerWidth / window.innerHeight;
      // 更新相机投影矩阵
      camera.updateProjectionMatrix();
    })
}

};
</script>

<style scoped>
.container {
  
}
</style>