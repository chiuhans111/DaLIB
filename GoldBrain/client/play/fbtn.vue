<template>
    <div :class="{
        float: true,
        right: r,
        dmain: main
    }" @click="$emit('click')">
        <div class="btn">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['r', 'main'],
        data() {
            return {

            }
        }
    }
</script>

<style>
    .float {
        padding: 0px;
        left: 0;
        position: relative;
        z-index: 99;
        background-color: lightgray;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-block
    }

    .dmain {
        background-color: orange;
    }

    .right {
        left: initial;
        right: 0;
    }

    .btn {
        margin: 8px;
        height: 24px;
    }

    .float:hover {
        transform: scale(1.1)
    }
</style>