<template>
    <div class="score-main">

        <transition-group name="list" tag="div">
            <template v-for="(team, i) in teams">
                <li :key="team.no" style="display:block;margin:4px;text-align:center;direction:ltr">
                    <tr :class="{
                        first: team.rank==0,
                        second: team.rank==1,
                        third: team.rank==2,
                        same: team.type==1,
                        out: team.round&lt;round
                    }">

                        <td class="number">
                            {{team.name}}
                        </td>
                        <td class="score">{{team.score}} 分</td>
                        <td :class="{
                            online: team.online,
                            offline: !team.online
                        }">{{team.online?"":"離線"}}</td>
                        <td v-if="debug" class="score">{{team.round}}</td>
                    </tr>
                </li>
            </template>
        </transition-group>

    </div>
</template>
<Numbering>2</Numbering>
<R/>
<script>
    export default {
        props: ['teams', 'round', 'debug'],
        data() {
            return {
            };
        }
    };
</script>
<style>
    .team {
        margin: 2px;
    }

    .offline {
        color: red;
        background-color: #fff;
    }

    .online {
        width: 0px;
        padding: 0px;
    }


    .first>.number {
        border-left: solid 16px gold;
        font-size: 32px;
        width: 120px;
    }

    .second>.number {
        border-left: solid 16px silver;
        font-size: 30px;
        width: 110px;
    }

    .third>.number {
        border-left: solid 16px coral;
        font-size: 28px;
        width: 100px;
    }

    .same>.score {
        color: white;
        background-color: darkred;
    }

    .score-main {
        height: 100%;

        overflow-x: visible;
        overflow-y: auto;

        direction: rtl;
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
        transition-delay: 0.1s;
        opacity: 1;
    }

    .number {
        color: black;
        background-color: lightgray;
        width: 96px;
    }

    .list-enter-active {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: absolute;
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