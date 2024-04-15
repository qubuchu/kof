<template>
    <div class="container">
        <div class = "row" >
            <div class = "col-3">
                <div class="card" style="margin-top: 20px;">
                    <div class="card-body">
                        <img :src="$store.state.user.photo" alt="" style="width: 100%;">
                    </div>
                </div>
            </div>
            <div class = "col-9">
                <div class="card" style="margin-top: 20px;">
                    <div class="card-header">
                        <span style="font-size: 130%">对局记录</span>
                    </div>
                    <div class="card-body">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>角色</th>
                                    <th>对局时间</th>
                                    <th>胜负</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="game in games" :key="game.id">
                                    <td>{{ game.role1 }}</td>
                                    <td>{{ game.playBeginTime }}</td>

                                    <td v-if="$store.state.user.id == game.winId" style="color: green;">win</td>
                                    <td v-else style="color: red">lose</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import ContentField from "@/components/ContentField.vue"
import $ from 'jquery'
import { useStore } from "vuex";
import { ref } from 'vue'

export default {
    setup() {
        const store = useStore();
        let games = ref([]);
        // $.ajax({
        //     url: "http://127.0.0.1:3000/game/add/",
        //     type: "POST",
        //     data: {
        //         player1: "10",
        //         player2: "8",
        //         role1: "1",
        //         role2: "2",
        //         winId: "8",
        //     },
        //     headers: {
        //         Authorization: "Bearer " + store.state.user.token,
        //     },
        //     success(resp) {
        //         console.log(resp);
        //     },
        //     error(resp) {
        //         console.log(resp);
        //     }
        // })

        const refresh_game = () => $.ajax({
            url: "http://127.0.0.1:3000/game/getlist/",
            type: "get",
            headers: {
                Authorization: "Bearer " + store.state.user.token,
            },
            success(resp) {
                games.value = resp
                console.log(resp)
            },
        })

        refresh_game();

        return {
            games
        }
    }

}

</script>

<style scoped>
</style>