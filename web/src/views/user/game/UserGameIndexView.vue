<template>
    <div class="container">
        <div class="row">
            <div class="col-3">
                <div class="card" style="margin-top: 20px;">
                    <div class="card-body">
                        <img :src="$store.state.user.photo" alt="" style="width: 100%;">
                    </div>
                    <div class="rating-score" style="margin-left: 20px;">
                        <a>天梯分： {{ rating_score }}</a>
                    </div>
                </div>
            </div>
            <div class="col-9">
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
                                <tr v-for="list in lists" :key="list.id">
                                    <td>{{ list.role1 }}</td>
                                    <td>{{ list.playTime }}</td>

                                    <td v-if="$store.state.user.id == list.winId" style="color: green;">win</td>
                                    <td v-else style="color: red">lose</td>
                                </tr>
                            </tbody>
                        </table>
                        <nav aria-label="...">
                            <ul class="pagination" style="float: right;">
                                <li class="page-item" @click="click_page(-2)">
                                    <a class="page-link" href="#">前一页</a>
                                </li>
                                <li :class="'page-item ' + page.is_active" v-for="page in pages" :key="page.number"
                                    @click="click_page(page.number)">
                                    <a class="page-link" href="#">{{ page.number }}</a>
                                </li>
                                <li class="page-item" @click="click_page(-1)">
                                    <a class="page-link" href="#">后一页</a>
                                </li>
                            </ul>
                        </nav>
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
        let lists = ref([]);
        let current_page = 1;
        let total_lists = 0;
        let pages = ref([]);
        let rating_score = ref();
        rating_score = store.state.user.rating;


        const click_page = page => {
            if (page === -2) page = current_page - 1;
            else if (page === -1) page = current_page + 1;
            let max_pages = parseInt(Math.ceil(total_lists / 10));

            if (page >= 1 && page <= max_pages) {
                pull_page(page);
            }
        }

        const udpate_pages = () => {
            let max_pages = parseInt(Math.ceil(total_lists / 10));
            let new_pages = [];
            for (let i = current_page - 2; i <= current_page + 2; i++) {
                if (i >= 1 && i <= max_pages) {
                    new_pages.push({
                        number: i,
                        is_active: i === current_page ? "active" : "",
                    });
                }
            }
            pages.value = new_pages;
        }


        const pull_page = page => {
            current_page = page;
            $.ajax({
                url: "http://127.0.0.1:3000/game/getlist/",
                data: {
                    page,
                },
                type: "get",
                headers: {
                    Authorization: "Bearer " + store.state.user.token,
                },
                success(resp) {
                    lists.value = resp.lists;
                    total_lists = resp.lists_count;
                    udpate_pages();
                },
            })
        }

        pull_page(current_page)

        return {
            lists,
            pages,
            click_page,
            rating_score
        }
    }

}

</script>

<style scoped></style>