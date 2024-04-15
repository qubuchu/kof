<template>
    <ContentField>
        我的Bot
    </ContentField>
</template>

<script>
import ContentField from "@/components/ContentField.vue"
import $ from 'jquery'
import { useStore } from "vuex";

export default {
    components: {
        ContentField
    },
    setup() {
        const store = useStore();
        // $.ajax({
        //     url: "http://127.0.0.1:3000/game/add/",
        //     type: "POST",
        //     data: {
        //         player1: "8",
        //         player2: "10",
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

        $.ajax({
            url: "http://127.0.0.1:3000/game/getlist/",
            type: "get",
            headers: {
                Authorization: "Bearer " + store.state.user.token,
            },
            success(resp) {
                console.log(resp);
            },
            error(resp) {
                console.log(resp);
            }
        })
    }
}

</script>

<style scoped>
</style>