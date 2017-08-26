<template>
    <v-layout row justify-center style="position: relative;">
        <v-dialog :value="dialog" @input="x=>done2()" absolute>
            <v-card>
                <template v-for="line in setup">
                    <v-card-title v-if="line.title" :key="line.title">
                        <div class="headline">{{line.title}}</div>
                    </v-card-title>
    
                    <v-card-text v-if="line.text" :key="line.text">{{line.text}}</v-card-text>
    
                    <v-container fluid v-if="line.input" :key="line.input.label">
                        <v-text-field 
                        v-model="line.input.value" 
                        :rules="line.input.rules" 
                        :label="line.input.label" 
                        :prefix="line.input.prefix" 
                        :suffix="line.input.suffix" 
                        single-line 
                        :multi-line="line.input.multi"></v-text-field>
                    </v-container>
    
                </template>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat="flat" @click.native="done(false)" error>取消</v-btn>
                    <v-btn flat="flat" @click.native="done(true)" primary>確認</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>

var data = {
    dialog: false,
    setup: null,
    done: function (result) {
        if (result) {
            var data = {};
            var accept = true;
            this.setup.filter(s => s.input).map(s => {
                if (s.input.rules instanceof Array)
                    if (s.input.rules
                        .filter(f => f instanceof Function)
                        .filter(f => !f(s.input.value)).length > 0)
                        return accept = false;
                if (s.input.format instanceof Array)
                    s.input.format
                        .filter(f => f instanceof Function)
                        .map(f => s.input.value = f(s.input.value));

                data[s.input.name] = s.input.value
            });
            if (!accept) return;
            this.$emit('ok', data);
        }
        this.$emit('no', result);
        //this.setup = null;
        this.dialog = false;
        this.$emit('input', null);
    },
    done2: function () {
        this.dialog = false;
        this.$emit('input', null);
    }
}
export default {
    props: {
        value: {
            type: Array
        },
    },
    data() {
        return data
    },
    watch: {
        value: function (v) {
            if (v instanceof Array) {
                data.setup = v;
                data.dialog = true;
            }
            return true;
        }
    }
}

</script>
<style>
.example {
    font-size: 200px;
    font-weight: bold;
}
</style>