<template>
  <tbody>
    <tr>
      <td :rowspan="rowNum"><button v-on:click="$emit('remove-ship', selectedShip.name)">Remove</button></td>
      <td :rowspan="rowNum"> {{ selectedShip.name }} </td>
      <td :rowspan="rowNum"> {{ selectedShip.tier }} </td>
      <td :rowspan="rowNum"> {{ selectedShip.species }} </td>
      <td :rowspan="rowNum"> {{ selectedShip.nation }} </td>
      
      <td :rowspan="shellNum"> {{ selectedShip.artilleryList[0].name }} </td>
      <td> {{ selectedShip.artilleryList[0].ammoList[0].name }} </td>
    </tr>

    <tr v-if="shellNum > 1">
      <td> {{ selectedShip.artilleryList[0].ammoList[1].name }} </td>
    </tr>

    <template v-if="artilleryNum > 1">
      <template v-for="artillery in selectedShip.artilleryList.slice(1)">
        <tr :key="artillery.name">
          <td :rowspan="shellNum"> {{ artillery.name }} </td>
          <td> {{ artillery.ammoList[0].name }} </td>
        </tr>

        <tr v-if="shellNum > 1" :key="artillery.name + '_'">
          <td> {{ artillery.ammoList[1].name }} </td>
        </tr>
      </template>
    </template>
  </tbody>
</template>

<script>
export default {
  props: ['selectedShip'],
  data: function() {
    return {
      artilleryNum: this.selectedShip.artilleryList.length,
      shellNum: this.selectedShip.artilleryList[0].ammoList.length,
    }
  },
  computed: {
    rowNum: function() {
      return this.artilleryNum * this.shellNum
    },
  }
}
</script>

<style scoped>

</style>

