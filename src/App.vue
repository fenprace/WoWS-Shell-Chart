<template>
  <ship-selector></ship-selector>
</template>

<script>
import ShipSelector from './components/ShipSelector.vue'

export default {
  data: function() {
    return {}
  },

  components: {
    ShipSelector,
  }
}
</script>

<style>
body {
  color: #102031;
  padding: 0;
  margin: 0;
}
</style>
