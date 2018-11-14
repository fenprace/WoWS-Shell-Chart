<template>
  <div id="shipSelector">
      <div id="selectForm">
        <span>Version:</span>
        <select v-model="selectedVersion">
          <option value="0.7.10">0.7.10</option>
        </select>

        <span>Tier:</span>
        <select v-model="selectedTier">
          <option value="">All Tiers</option>
          <option v-for="tier of tierList" :value="tier" :key="tier">{{ tier }}</option>
        </select>

        <span>Type:</span>
        <select v-model="selectedType">
          <option value="">All Types</option>
          <option v-for="type of typeList" :value="type" :key="type">{{ type }}</option>
        </select>

        <span>Nation:</span>
        <select v-model="selectedNation">
          <option value="">All Nations</option>
          <option v-for="nation of nationList" :value="nation" :key="nation">{{ nation }}</option>
        </select>

        <span>Ship:</span>
        <select v-model="selectedShip">
          <option disabled value="">Select Ship</option>
          <option v-for="ship of shipList" :value="ship" :key="ship.name">{{ ship.name }}</option>
        </select>

        <button v-on:click="addShip">Add</button>
    </div>

    <template v-if="selectedShipList.length != 0">
      
      <table border="0">
        <tr>
          <th>Edit</th>
          <th>Ship</th>
          <th>Tier</th>
          <th>Type</th>
          <th>Nation</th>
          <th>Artillery</th>
          <th>Shell</th>
        </tr>

        <ship-form v-for="(ship, index) of selectedShipList" :key="ship.name" :selected-ship="ship"
          v-on:remove-ship="removeShip" :class="index % 2 == 0 ? 'even' : 'odd'">
        </ship-form>
      </table>

      <div id="propertySelector">
        <span>Property:</span>
        <select v-model="selectedProperty">
          <option value="armor_vert">Penetration of Vertical Armor Belt</option>
          <option value="armor_hori">Penetration of Horizontal Deck Armor</option>
          <option value="fly_time">Shell Fly Time</option>
          <option value="v_impact">Impact Velocity</option>
          <option value="impact_angle">Impact Angle on Vertical Armor Belt</option>
          <option value="impact_angle2">Impact Angle on Horizontal Deck Armor</option>
        </select>
        <span>To hide or show a line, click on the legend below.</span>
      </div>

      <ship-chart :selected-ship-list="selectedShipList" :selected-property="selectedProperty">
      </ship-chart>

    </template>
    <template v-else>
      <div id="backgroundHint">
        <p>Select a ship and click "Add" to inspect.</p>
        <p style="margin-bottom: 0;">WoWS Shell Chart</p>
        <p style="margin-top: 0;">0.0.1</p>
      </div>
    </template>

  </div>
</template>

<script>
import ShipForm from './ShipForm.vue'
import ShipChart from './ShipChart.vue'

export default {
  data: function() {
    return {
      selectedVersion: '0.7.10',
      selectedType: '',
      selectedNation: '',
      selectedTier: '',
      selectedProperty: 'armor_vert',
      selectedShip: null,
      selectedShipList: [],
      tierList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }
  },

  computed: {
    currentVersion: function () {
      if (this.selectedVersion == '') return '0.7.10';
      return this.selectedVersion;
    },

    currentData: function () {
      return this.shipData[this.currentVersion]
    },

    currentTypes: function () {
      if (this.selectedType == '') return this.typeList
      return [this.selectedType]
    },

    currentNations: function () {
      if (this.selectedNation == '') return this.nationList
      return [this.selectedNation]
    },

    currentTiers: function () {
      if (this.selectedTier == '') return this.tierList
      return [this.selectedTier]
    },

    typeList: function () {
      return [...new Set(this.currentData.map(i => i.species))]
    },

    nationList: function () {
      return [...new Set(this.currentData.map(i => i.nation))]
    },
  
    shipList: function () {
      let types = this.currentTypes
      let nations = this.currentNations
      let tiers = this.currentTiers

      return this.currentData.filter (function(ship) {
        return types.includes(ship.species) && nations.includes(ship.nation) && tiers.includes(ship.tier)
      })
    }
  },

  methods: {
    addShip: function() {
      if (this.selectedShip !== null
      && !this.selectedShipList.map(ship => ship.name).includes(this.selectedShip.name))
        this.selectedShipList.push(this.selectedShip)
    },
    removeShip: function(shipName) {
      this.selectedShipList = this.selectedShipList.filter(s => s.name != shipName)
    }
  },

  components: { ShipForm, ShipChart, }
}
</script>

<style>
  #selectForm {
    background-color: #5FCEC0;
    /* border-bottom: 1px solid white; */
    color: white;
    font-size: 20px;
    height: 40px;
    line-height: 40px;
    width: 100%;
  }

  #selectForm span {
    margin-left: 10px;
    margin-right: 5px;
  }

  #selectForm select {
    background-color: white;
    color: black;
    font-size: 20px;
    line-height: 40px;
    max-width: 250px;
  }

  #selectForm button {
    border: none;
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
    float: right;
    font-size: 26px;
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    outline: none;
  }

  #selectForm button:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  #shipSelector table {
    background-color: #EEEEEE;
    border-collapse: collapse;
    font-size: 16px;
    text-align: left;
    width: 100%;
  }

  #shipSelector td {
    border-bottom: 1px dashed #AAAAAA;
  }

  #shipSelector tbody.even {
    background-color: white;
  }

  #shipSelector table button {
    background: transparent;
    border: none;
    border-bottom: 1px dashed darkred;
    color: darkred;
    font-size: 18px;
    height: 100%;
    outline: none;
    padding: 0;
    
  }

  #propertySelector {
    background-color: #5FCEC0;
    color: white;
    font-size: 20px;
    height: 40px;
    line-height: 40px;
    width: 100%;
  }

  #propertySelector span {
    margin-left: 10px;
    margin-right: 5px;
  }

  #propertySelector select {
    background-color: white;
    color: black;
    font-size: 20px;
    line-height: 40px;
  }

  #backgroundHint {
    background-color: #EEEEEE;
    bottom: 0;
    color: #666666;
    font-size: 24px;
    height: 100%;
    position: absolute;
    text-align: center;
    top: 40px;
    width: 100%;
  }
  
</style>
