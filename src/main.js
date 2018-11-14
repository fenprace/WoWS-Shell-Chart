import Vue from 'vue'
import App from './App.vue'

import ShipData from './components/ShipData.vue'
import PenetrationCalculator from './components/PenetrationCalculator.vue'

Vue.config.productionTip = false

Vue.use(ShipData)
Vue.use(PenetrationCalculator)

new Vue({
  render: h => h(App)
}).$mount('#application')
