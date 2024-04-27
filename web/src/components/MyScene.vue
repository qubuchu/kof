<template>
  <div id="container">
  </div>
</template>
 
<script>
// import * as THREE from 'three'
import { KOF } from "@/assets/scripts/game/base.js"
import { onMounted } from "vue";
import { useStore } from "vuex";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default {
  setup() {
    const store = useStore();

    onMounted(() => {
      store.commit(
        "updateGameObject",
        new KOF(store)
      )
    });
  }
};
</script>

<style scoped>
.container {
  
}
</style>

