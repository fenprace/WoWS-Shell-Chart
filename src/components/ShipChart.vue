<template>
  <canvas id="shipChart"></canvas>
</template>

<script>
import Chart from 'chart.js'

export default {
  data: function() {
    return {
      chart: null,
      chartColors: {
        nextColor: function() {
          this.index++
          if (this.index >= this.colors.length) this.index = 0
          return this.colors[this.index]
        },
        resetColor: function() {
          this.index = -1
        },
        index: -1,
        colors: [
          "rgb(255, 99, 132)",  // Red
          "rgb(75, 192, 192)",  // Green
          "rgb(255, 159, 64)",  // Orange
          "rgb(54, 162, 235)",  // Blue
          "rgb(255, 205, 86)",  // Yellow
          "rgb(153, 102, 255)", // Purple
          "rgb(201, 203, 207)", // Grey
        ]
      }
    }
  },

  props: ['selectedShipList', 'selectedProperty'],

  methods: {
    generateBarDataSet() {
      let [labels, HEs, APs] = [[], [], []]
      for (let ship of this.selectedShipList) {
        for (let artillery of ship.artilleryList) {
          labels.push(`${ship.name.slice(8)} - ${artillery.name.slice(8)}`)

          if (artillery.ammoList.length == 1) {
            let shell = artillery.ammoList[0]
            if (shell.ammoType == 'HE') {
              HEs.push(shell.bulletSpeed)
              APs.push(0)
            } else if (shell.ammoType == 'AP') {
              HEs.push(0)
              APs.push(shell.bulletSpeed)
            }
          } else {
            HEs.push(artillery.ammoList[0].bulletSpeed)
            APs.push(artillery.ammoList[1].bulletSpeed)
          }
        }
      }

      return [labels, HEs, APs]
    },

    generatePenetrationDataSet(property) {
      let propertyMap = {
        'armor_vert'   : 'Penetration of Vertical Armor Belt (MM)',
        'armor_hori'   : 'Penetration of Horizontal Deck Armor (MM)',
        'fly_time'     : 'Shell Fly Time (S)',
        'v_impact'     : 'Impact Velocity (M/S)',
        'impact_angle' : 'Impact Angle on Vertical Armor Belt (°)',
        'impact_angle2': 'Impact Angle on Horizontal Deck Armor (°)',
      }

      let data = {
        labels: [],
        datasets: [],
        xLabelString: propertyMap[property],
      }

      for (let ship of this.selectedShipList) {
        for (let artillery of ship.artilleryList) {
          for (let shell of artillery.ammoList) {
            if (shell.ammoType == 'AP') {
              let p = this.shellPenetration(shell)
              let color = this.chartColors.nextColor()

              if (p.distance.length > data.labels.length) data.labels = p.distance

              p.label           = `${ship.name.slice(8)} - ${artillery.name.slice(8)}`
              p.data            = p[property]
              p.fill            = false
              p.backgroundColor = color
              p.borderColor     = color

              data.datasets.push(p)
            }
          }
        }
      }
      
      return data
    },

    drawPenetrationChart: function(data) {
      if (this.chart) this.chart.destroy()
      this.chart = new Chart('shipChart', {
        type: 'line',
        data: data,
        options: {
          elements: { point: { radius: 0 } },
          hover:    { mode: 'index', intersect: false },
          tooltips: { mode: 'index', intersect: false },
          scales: {
            xAxes: [{
              scaleLabel: { display: true, labelString: 'Range (KM)'},
              ticks: {
                min: 1.5,
                callback: function(label, index) {
                  return index % 5 == 0 ? label : ''
                },
               },
            }],
            yAxes: [{
              scaleLabel: { display: true, labelString: data.xLabelString },
              ticks: { beginAtZero: true },
            }]
          }
        },
      })
    },

    drawBarChart: function(data) {
      if (this.chart) this.chart.destroy()
      this.chart = new Chart('shipChart', {
        type: 'bar',
        data: {
          labels: data[0],
          datasets: [
            {
              label: 'HE Bullet Speed',
              data: data[1],
              backgroundColor: 'rgba(255, 127, 80, 1)',
            },
            {
              label: 'AP Bullet Speed',
              data: data[2],
              // backgroundColor: 'rbga(1, 1, 1, 0.2)',
            }
          ]
        },
        options: {
          tooltips: {
            mode: 'nearest'
          },
        },
      });
    },
    
  },

  watch: {
    selectedShipList: function() {
      this.chartColors.resetColor()
      this.drawPenetrationChart(this.generatePenetrationDataSet(this.selectedProperty))
    },
    selectedProperty: function() {
      this.chartColors.resetColor()
      this.drawPenetrationChart(this.generatePenetrationDataSet(this.selectedProperty))
    }
  },

  mounted: function() {
    this.chartColors.resetColor()
    this.drawPenetrationChart(this.generatePenetrationDataSet(this.selectedProperty))
  }
}
</script>
