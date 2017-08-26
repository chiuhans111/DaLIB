<template>
    <div>
        <template>
            <v-progress-linear v-bind:indeterminate="true" class="ma-0" :error="teamData.error" :height="8" :active="teamData.loading" style="margin:0px"></v-progress-linear>
            <v-alert error :value="teamData.error!==false" class="ma-0">{{teamData.error}}</v-alert>
        </template>
        <v-list>
            <v-list-tile avatar class="ma-0">
                <v-list-tile-action>
                    <v-checkbox v-model="checkall"></v-checkbox>
                </v-list-tile-action>
    
                <v-list-tile-avatar>
                    <v-btn icon @click.stop="add()">
                        <v-icon primary>add</v-icon>
                    </v-btn>
                </v-list-tile-avatar>
    
                <v-list-tile-avatar>
                    <v-btn icon @click.stop="del()" :disabled="check.length==0">
                        <v-icon error>delete</v-icon>
                    </v-btn>
                </v-list-tile-avatar>
            </v-list-tile>
    
            <transition-group name="list">
                <template v-for="team in teamData.teams">
    
                    <v-list-tile :key="team._id" class="list-item">
    
                        <v-list-tile-action>
                            <v-checkbox v-model="check" :value="team._id"></v-checkbox>
                        </v-list-tile-action>
    
                        <v-list-tile-avatar>
                            <v-btn icon @click.stop="set_name(team)">
                                <v-icon>edit</v-icon>
                            </v-btn>
                        </v-list-tile-avatar>
    
                        <v-list-tile-content>
                            <v-list-tile-title>{{team.name}}</v-list-tile-title>
                        </v-list-tile-content>
    
                        <v-list-tile-avatar>
                            <v-btn icon @click.stop="x=>{team.active=!team.active,teamData}">
                                <v-icon>arrow_drop_down</v-icon>
                            </v-btn>
                        </v-list-tile-avatar>
    
                    </v-list-tile>
    
                    <v-list-group v-model="team.active" :key="team._id+'_2'">
                        <template>
                            <v-list-tile key="subitem">
                                <v-list-tile-content>
                                    <v-list-tile-sub-title>key:{{team.key}}</v-list-tile-sub-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>
                    </v-list-group>
    
                </template>
            </transition-group>
        </v-list>
        <my-dialog v-model="dialog_setup" @ok="dialog_ok"></my-dialog>
    </div>
</template>


<script>
import teamData from "./admin_team.js";
import rules from "./rules.js";

var check = [];

var data = {
    dialog: false,
    get check() {
        return check;
    },
    set check(value) {
        check = value;
    },
    get checkall() {
        return check.length == teamData.teams.length && check.length > 0;
    },
    set checkall(value) {
        if (value == false) check = [];
        else check = teamData.teams.map(x => x._id);
    },

    dialog_setup: null,
    dialog_ok: function () { },

    add() {


        this.dialog_setup = [
            { title: "新增隊伍" },
            { text: "你要多少隊伍?" },
            {
                input: {
                    name: 'count',
                    value: 5,
                    prefix: '數量',
                    suffix: '個',
                    rules: [
                        rules.number,
                        x => x > 50 ? '最多50' : true],
                    format: [rules.f_number]
                }
            }
        ]
        this.dialog_ok = function (data) {
            teamData.add(data.count);
        }
    },
    del() {
        this.dialog_setup = [
            { title: "移除隊伍" },
            { text: "永久刪除隊伍?" }
        ]
        this.dialog_ok = function (data) {
            teamData.del(check);
            check = [];
        }
    },
    set_name(team) {
        this.dialog_setup = [
            { title: "修改名稱" },
            { text: "新的隊伍名稱?" },
            {
                input: {
                    name: 'name',
                    value: team.name,
                    prefix: '',
                    suffix: '',
                    label: team.name,
                }
            }
        ]
        this.dialog_ok = function (data) {
            team.name = data.name;
            team.set();
        }
    },

    teamData

}

export default {
    data() {
        return data;
    }
}

</script>
<style>
.example {
    font-size: 200px;
    font-weight: bold;
}
</style>