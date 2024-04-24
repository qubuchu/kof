<template>
    <div></div>
</template>

<script>
import * as THREE from 'three';
import Ammo from 'ammo.js';

// 初始化Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 初始化Ammo.js
Ammo().then((AmmoLib) => {
  // 创建物理世界
  const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
  const dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
  const overlappingPairCache = new AmmoLib.btDbvtBroadphase();
  const solver = new AmmoLib.btSequentialImpulseConstraintSolver();
  const dynamicsWorld = new AmmoLib.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  dynamicsWorld.setGravity(new AmmoLib.btVector3(0, -9.8, 0)); // 设置重力

  // 创建场景物体
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const radius = 1; // 胶囊体半径
  const height = 2; // 胶囊体高度
  const shape = new AmmoLib.btCapsuleShape(radius, height);
  const startTransform = new AmmoLib.btTransform();
  startTransform.setIdentity();
  startTransform.setOrigin(new AmmoLib.btVector3(0, 5, 0)); // 设置胶囊体的位置
  const motionState = new AmmoLib.btDefaultMotionState(startTransform);
  const mass = 1; // 质量
  const inertia = new AmmoLib.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, inertia);
  const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, inertia);
  const body = new AmmoLib.btRigidBody(rbInfo);
  dynamicsWorld.addRigidBody(body);

  // 渲染循环
  function animate() {
    requestAnimationFrame(animate);

    // 更新物理世界
    dynamicsWorld.stepSimulation(1 / 60, 10);

    // 获取物体位置并更新Three.js场景中的物体位置
    const trans = new AmmoLib.btTransform();
    body.getMotionState().getWorldTransform(trans);
    const pos = trans.getOrigin();
    cube.position.set(pos.x(), pos.y(), pos.z());

    renderer.render(scene, camera);
  }

  // 启动渲染循环
  animate();
});

</script>

<style scoped>
</style>