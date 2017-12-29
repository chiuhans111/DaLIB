<template>
    <div class="score-main">

        <template v-for="(team, i) in teams">
            <transition-group name="list" tag="table">

                <tr :key="team.no" :class="{
                        first: team.rank==0,
                        second: team.rank==1,
                        third: team.rank==2,
                        same: team.type==1,
                        out: team.round&lt;round
                    }">
                    <td class="number">{{team.name}}</td>
                    <td class="score">{{team.score}} 分</td>
                    <td class="score">{{team.round}}</td>
                </tr>
            </transition-group>
        </template>

    </div>
</template>
<Numbering>2</Numbering>
<R/>
<script>
    export default {
        props: ['teams', 'round'],
        data() {
            return {};
        }
    };
</script>
<style>
    .team {
        margin: 2px;
    }

    .first>.number {
        border-left: solid 16px orange;
        font-size: 32px;
    }

    .second>.number {
        border-left: solid 16px green;
        font-size: 30px;
    }

    .third>.number {
        border-left: solid 16px coral;
        font-size: 28px;
    }

    .same>.score {
        color: white;
        background-color: darkred;
    }

    .score-main {
        margin: 16px;
    }

    .out {
        opacity: 0.2;
    }

    table {
        text-align: center;
    }

    td {
        padding: 4px 8px;
        color: white;
        background-color: #444;
        font-size: 18px;
        transition: all 0.2s;
        opacity: 1;
    }

    .number {
        color: black;
        background-color: lightgray;
    }

    .list-enter-active {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .list-leave-active {
        transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
        position: absolute;
        z-index: -1;
    }

    .list-enter {
        opacity: 0;
        transform: translateX(30px);
    }

    .list-leave-to {
        opacity: 0;
        transform: translateX(-30px);
    }

    .list-move {
        transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
</style>