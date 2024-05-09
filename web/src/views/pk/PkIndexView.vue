<template>
    <MatchGround v-if="$store.state.pk.status === 'matching'"></MatchGround>
    <PlayGround v-if="$store.state.pk.status === 'playing'"></PlayGround>
    <ResultBoard v-if="$store.state.pk.loser != 'none'"></ResultBoard>
</template>

<script>
// import ContentField from "@/components/ContentField.vue"
import MatchGround from "@/components/MatchGround.vue"
import PlayGround from "@/components/PlayGround.vue"
import ResultBoard from "@/components/ResultBoard.vue";
import { onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";

export default {
    components: {
        // ContentField,
        MatchGround,
        PlayGround,
        ResultBoard,
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
                    }, 2000);
                    store.commit("updateGame", data.game);
                } else if(data.event === "operate") { // 更改人物状态，只能从后端进行
                    const game = store.state.pk.gameObject;
                    const playerA = game.players[0]; // players[0]必然为A玩家， 因为在构建Game时， 是从后端获取的game，               
                    const playerB = game.players[1];
                    const operateA = data.a_operate;// 玩家A的操作
                    const operateB = data.b_operate;
                    const downA = data.a_down;
                    const downB = data.b_down;

                    playerA.setOperate(operateA[0], operateA[1], operateA[2], operateA[3], operateA[4], operateA[5], operateA[6]); // A 玩家设置操作 
                    playerB.setOperate(operateB[0], operateB[1], operateB[2], operateB[3], operateB[4], operateB[5], operateB[6]); // B 玩家设置操作
                    if(downA != 0)
                        playerA.is_attack(downA);
                    if(downB != 0)
                        playerB.is_attack(downB);
                } else if(data.event === "result") {
                    const game = store.state.pk.gameObject;
                    game.loser = data.loser;
                    console.log(game.loser);

                    if (game.loser === "A") {
                        game.players[0].status = 7;
                        game.players[1].status = 0;
                    }
                    if (game.loser === "B") {
                        game.players[0].status = 0;
                        game.players[1].status = 7;
                    }
                    store.commit("updateLoser", data.loser);
                    console.log("over game");
                    // game.destroy();
                }
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