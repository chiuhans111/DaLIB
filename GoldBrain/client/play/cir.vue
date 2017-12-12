<template>
<span class="circle" :style="{color:c, backgroundColor:bc, width:w, height:w, lineHeight:w, borderRadius:w}">
    <slot></slot>
</span>
    
</template>

<script>
export default {
  props: ["w", "c", "bc"],
  data() {
    return {};
  }
};
</script>

<style>
.circle {
  display: inline-block;
  text-align: center;
}
</style>
