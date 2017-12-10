<template>
  <iframe :src="link" frameborder="0"></iframe>
</template>
<script>
var link =
  "https://docs.google.com/presentation/d/e/2PACX-1vQozBa6cuROaCZHXATV_BWLTRI3LveVJIx7zHIR-9bvY1lblAcrNxn1I3kyDHMzRtIi9viWWY8ErTjg/embed";
export default {
  data() {
    return {
      link
    };
  }
};
</script>

<style>
iframe {
  width: 100%;
  height: 100%;
}
</style>
