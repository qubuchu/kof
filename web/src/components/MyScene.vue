<template>
  <div id="container">
  </div>
</template>
 
<script>
// import * as THREE from 'three'
import { KOF } from "@/assets/scripts/game/base.js"
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default {
  setup() {

    // // 设置相机位置
  
    let kof = new KOF('kof');
    kof.start();

  }
};
</script>

<style scoped>
.container {
  
}
</style>