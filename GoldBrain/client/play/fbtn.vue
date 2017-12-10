<template>
    <div class="float">
        <div class="btn">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {

            }
        }
    }
</script>

<style>
    .float {
        position: fixed;
        padding: 0px;
        left: 0;
        bottom: 5%;
        z-index: 99;
        background-color: orange;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn {
        margin: 8px;
        height: 24px;
    }

    .float:hover {
        padding-left: 8px;
    }
</style>