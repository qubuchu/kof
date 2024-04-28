<template>
  <div id="playground">
  </div>
</template>
 
<script>
import { KOF } from "@/assets/scripts/game/base.js"
import { onMounted } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    onMounted(() => {
      console.log("in");
      store.commit(
        "updateGameObject",
        new KOF(store)
      )
    });
  }
};
</script>

<style scoped>
div.playfround {
  width: 60vm;
  height: 70vh;
  margin: 40px auto;
}
</style>

