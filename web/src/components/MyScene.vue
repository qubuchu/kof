<template>
  <div id="container">
  </div>
</template>
 
<script>
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

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

    //创建灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 环境光
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 方向光
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

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
    // const fbxLoader = new FBXLoader();

    //实例化加载器draco
    const dracoLoader = new DRACOLoader();
    //设置draco路径
    dracoLoader.setDecoderPath("./draco/");
    //设置gltf加载器draco解码器
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      "/static/model/fight_gltf/scene.gltf",
      (gltf) => {
        console.log(gltf);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.scale.set(0.01, 0.01, 0.01);
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load("/static/model/fight_gltf/textures/Material_42_diffuse.jpeg",(texture) => {
            // 创建材质并设置纹理
            const material = new THREE.MeshStandardMaterial({ map: texture }); // 使用标准材质，并设置纹理
            if(child.name === 'Object_9')
              child.material = material;
            })
            textureLoader.load("/static/model/fight_gltf/textures/Material_44_diffuse.jpeg",(texture) => {
            // 创建材质并设置纹理
            const material = new THREE.MeshStandardMaterial({ map: texture }); // 使用标准材质，并设置纹理
            if(child.name === 'Object_7')
              child.material = material;
            })
            textureLoader.load("/static/model/fight_gltf/textures/pomostbamp_diffuse.png",(texture) => {
            // 创建材质并设置纹理
            const material = new THREE.MeshStandardMaterial({ map: texture }); // 使用标准材质，并设置纹理
            if(child.name === 'Object002_pomost+bamp_0')
              child.material = material;
            })
          }
        });
        scene.add(gltf.scene);

        // 打印模型中包含的动画数据
        if (gltf.animations && gltf.animations.length > 0) {
          console.log('Animations found:', gltf.animations);
        } else {
          console.log('No animations found in the model.');
        }
      }
    );
    // fbxLoader.load(
    //   "/static/model/fight_fbx/source/fight2.fbx",//加载默认在public下
    //   (obj) => {
    //     console.log(obj);
    //     obj.position.set(0, 0, 0);
    //     scene.add(obj);
    //   }
    // )

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