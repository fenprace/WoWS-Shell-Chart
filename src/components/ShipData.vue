<script>
export default {
  install: function (Vue) {
    Vue.prototype.shipData = Vue.prototype.shipData || {}
    Vue.prototype.shipData['0.7.10'] = require('./0.7.10.json')
    Vue.prototype.shipData['0.7.11'] = require('./0.7.11.json')
    Vue.prototype.shipData['0.7.12'] = require('./0.7.12.json')
    Vue.prototype.shipData['WIP'] = require('./WIP.json')
    Vue.prototype.displayName = function(o) {
      if (o.ammoType) return o.ammoType
      return o.name.slice(8)
    }
  } 
}
</script>
