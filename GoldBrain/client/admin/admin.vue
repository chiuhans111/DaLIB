<template>
    <div>

        <v-toolbar extended dark>
            <v-toolbar-side-icon @click="drawer^=1"></v-toolbar-side-icon>
            <v-toolbar-title class="white--text">{{adminData.collection}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="adminData.reload()">
                <v-icon>refresh</v-icon>
            </v-btn>
        </v-toolbar>

        <v-navigation-drawer class="pb-0" dark persistent absolute height="100%" clipped v-model="drawer">
            <v-list>
                <v-subheader class="grey--text">所有資料表</v-subheader>
                <template v-for="collection in adminData.collections">
                    <v-list-tile :key="collection">
                        <v-list-tile-content @click="adminData.collection = collection,  drawer = false, adminData.reload()">
                            <v-list-tile-title>{{collection}}</v-list-tile-title>
                        </v-list-tile-content>

                    </v-list-tile>
                </template>
                <v-divider></v-divider>
                <v-subheader class="grey--text">更多操作</v-subheader>
                <v-list-tile>
                    <v-list-tile-content @click.stop="drop()" class="red--text">
                        移除這個資料表
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>

        <v-layout>

            <v-flex class="sm10 offset-sm1 xs12" style="margin-top:-64px">
                <v-card>

                    <v-toolbar class="white">
                        <v-list-tile-action>
                            <v-checkbox v-model="checkall"></v-checkbox>
                        </v-list-tile-action>
                        <v-btn icon @click.stop="add()">
                            <v-icon primary>add</v-icon>
                        </v-btn>

                        <v-btn icon @click.stop="del()" :disabled="check.length==0">
                            <v-icon error>delete</v-icon>
                        </v-btn>

                    </v-toolbar>
                    <v-card>
                        <template>
                            <v-progress-linear v-bind:indeterminate="true" class="ma-0" :error="adminData.error!=false" :height="8" :active="adminData.loading"
                                style="margin:0px"></v-progress-linear>
                            <v-alert error :value="adminData.error!==false" class="ma-0">{{adminData.error}}</v-alert>
                        </template>
                        <v-list>

                            <transition-group name="list">
                                <template v-for="item in adminData.items">

                                    <v-list-tile :key="item._id" class="list-item">

                                        <v-list-tile-action>
                                            <v-checkbox v-model="check" :value="item._id"></v-checkbox>
                                        </v-list-tile-action>

                                        <v-list-tile-content>
                                            <v-list-tile-title>{{item}}</v-list-tile-title>
                                        </v-list-tile-content>

                                        <v-list-tile-avatar>
                                            <v-btn icon @click.stop="x=>{addfield(item)}" v-tooltip:left="{html:'新增屬性'}">
                                                <v-icon>add</v-icon>
                                            </v-btn>
                                        </v-list-tile-avatar>

                                        <v-list-tile-avatar>
                                            <v-btn icon @click.stop="x=>{item._active=!item._active,adminData}">
                                                <v-icon>arrow_drop_down</v-icon>
                                            </v-btn>
                                        </v-list-tile-avatar>

                                    </v-list-tile>

                                    <v-list-group v-model="item._active" :key="item._id+'_2'">
                                        <template v-for="field in Object.keys(item)" v-if="!['_set','_active','_id'].includes(field)">
                                            <v-list-tile :key="field">

                                                <v-list-tile-avatar>
                                                    <v-btn icon @click.stop="set(item, field)">
                                                        <v-icon>edit</v-icon>
                                                    </v-btn>
                                                </v-list-tile-avatar>

                                                <v-list-tile-avatar>
                                                    <v-btn icon @click.stop="item._set({$unset: {[field]:1}})">
                                                        <v-icon>delete</v-icon>
                                                    </v-btn>
                                                </v-list-tile-avatar>

                                                <v-list-tile-content>
                                                    <v-list-tile-title>{{item[field]}}</v-list-tile-title>
                                                    <v-list-tile-sub-title>{{field}}</v-list-tile-sub-title>
                                                </v-list-tile-content>
                                            </v-list-tile>
                                        </template>
                                    </v-list-group>

                                </template>
                            </transition-group>
                        </v-list>
                    </v-card>
                </v-card>
            </v-flex>
        </v-layout>
        <my-dialog v-model="dialog_setup" @ok="dialog_ok"></my-dialog>
    </div>
</template>


<script>
    import adminData from "./admin.js";

    var check = [];

    var data = {
        drawer: false,
        dialog: false,
        get check() {
            return check;
        },
        set check(value) {
            check = value;
        },
        get checkall() {
            return check.length == adminData.items.length && check.length > 0;
        },
        set checkall(value) {
            if (value == false) check = [];
            else check = adminData.items.map(x => x._id);
        },

        dialog_setup: null,
        dialog_ok: function () { },
        drop() {
            this.dialog_setup = [
                { title: "移除資料表" },
                { text: `永久刪除 ${adminData.collection} 資料表?` }
            ]
            this.dialog_ok = function (data) {
                adminData.drop();
            }
        },
        add() {
            this.dialog_setup = [
                { title: "新增項目" },
                { text: "輸入資料" },
                {
                    input: {
                        name: 'data',
                        value: '',
                        multi: true,
                        label: 'JSON',
                        rules: [
                            function (value) {
                                try {
                                    JSON.parse(value)
                                    return true;
                                } catch (e) {
                                    return e.message;
                                }
                            }
                        ]
                    }
                }
            ]
            this.dialog_ok = function (data) {
                adminData.add(JSON.parse(data.data));
            }
        },
        del() {
            this.dialog_setup = [
                { title: "移除項目" },
                { text: `永久刪除這${check.length}個項目?` }
            ]
            this.dialog_ok = function (data) {
                adminData.del(check);
                check = [];
            }
        },
        set(item, field) {
            this.dialog_setup = [
                { title: `修改${field}` },
                { text: `新的${field}內容?` },
                {
                    input: {
                        name: 'input',
                        multi: true,
                        value: JSON.stringify(item[field]),
                        label: field,
                        rules: [
                            function (value) {
                                try {
                                    JSON.parse(value)
                                    return true;
                                } catch (e) {
                                    return e.message;
                                }
                            }
                        ]
                    }
                }
            ]
            this.dialog_ok = function (data) {
                var obj = {};
                obj[field] = JSON.parse(data.input);
                item._set({ $set: obj });
            }
        },
        addfield(item) {
            this.dialog_setup = [
                { title: '新增屬性' },
                {
                    input: {
                        name: 'data',
                        value: '{"field":"value"}',
                        multi: true,
                        label: 'JSON',
                        rules: [
                            function (value) {
                                try {
                                    JSON.parse(value)
                                    return true;
                                } catch (e) {
                                    return e.message;
                                }
                            }
                        ]
                    }
                }
            ]
            this.dialog_ok = function (data) {
                item._set({ $set: JSON.parse(data.data) });
            }
        },

        adminData

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