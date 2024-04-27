<template>
    <MatchGround v-if="$store.state.pk.status === 'matching'">
    </MatchGround>
    <ContentField v-if="$store.state.pk.status === 'playing'">
        <MyScene></MyScene>
    </ContentField>
</template>

<script>
import ContentField from "@/components/ContentField.vue"
import MatchGround from "@/components/MatchGround.vue"
import MyScene from "@/components/MyScene.vue"
import { onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";

export default {
    components: {
        ContentField,
        MatchGround,
        MyScene
    },
    setup() {
        const store = useStore();
        const socketUrl = `ws://127.0.0.1:3000/websocket/${store.state.user.token}/`;
        let socket = null;
        onMounted(() => {
            store.commit("updateOpponent", {
                username: "我的对手",
                photo: "https://tse2-mm.cn.bing.net/th/id/OIP-C.3Erue55Pf7pzD-SkvjyF9QHaHa?w=194&h=194&c=7&r=0&o=5&dpr=1.3&pid=1.7",
            })
            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                console.log("connected!");
                store.commit("updateSocket", socket);
            }

            socket.onmessage = msg => {
                const data = JSON.parse(msg.data);
                if (data.event === "start-matching") {  // 匹配成功
                    store.commit("updateOpponent", {
                        username: data.opponent_username,
                        photo: data.opponent_photo,
                    });
                    setTimeout(() => {
                        store.commit("updateStatus", "playing");
                    }, 200);
                    store.commit("updateGame", data.game);
                } else if(data.event === "operate") {
                    console.log(data);
                    const game = store.state.pk.gameObject;
                    const playerA = game.players[0]; // players[0]必然为A玩家， 因为在构建Game时， 是从后端获取的game，               
                    const playerB = game.players[1];
                    const operateA = data.a_operate;// 玩家A的操作
                    const operateB = data.b_operate;

                    playerA.setOperate(operateA[0], operateA[1], operateA[2], operateA[3], operateA[4], operateA[5], operateA[6]); // A 玩家设置操作 
                    playerB.setOperate(operateB[0], operateB[1], operateB[2], operateB[3], operateB[4], operateB[5], operateB[6]); // B 玩家设置操作
                }
                console.log(data);
            }

            socket.onclose = () => {
                console.log("disconnected!");
            }
        });
        onUnmounted(() => {
            socket.close();
            store.commit("updateStatus", "matching");
        })
    }
}

</script>

<style scoped>
</style>