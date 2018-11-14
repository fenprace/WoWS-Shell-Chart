<script>
function my_round(x) {
  return Math.round(x * 100) / 100.0
}

export default {
  install: function(Vue) {
    Vue.prototype.shellPenetration = function(shell) {
      return this.penetrationCalculate(shell.bulletMass, shell.bulletDiametr, shell.bulletAirDrag, shell.bulletSpeed, shell.bulletKrupp)
    }

    Vue.prototype.penetrationCalculate = function(m, D, c_D, v_0, K) {
      //integration for trajectories
      // SHELL CONSTANTS
      const C   = 0.5561613; // PENETRATION
      const g   = 9.81; // GRAVITY
      const T_0 = 288.; // TEMPERATURE AT SEA LEVEL
      const L   = 0.0065; // TEMPERATURE LAPSE RATE
      const p_0 = 101325.; // PRESSURE AT SEA LEVEL
      const R   = 8.31447; // UNIV GAS CONSTANT
      const M   = 0.0289644; // MOLAR MASS OF AIR

      // SHELL CONSTANTS #

      // m: SHELL Mass
      // D: SHELL DIAMETER
      // c_D: SHELL DRAG, 0.321 as default,gearing 0.347,cleveland 0.322, Iowa 0.352, Yamato 0.292, S.Caro 0.435,StLous 0.4036
      // v_0: SHELL MUZZLE VELOCITY
      // K: SHELL KRUPP

      let norm

      if      (D <= 0.13)  norm = 10. * Math.PI / 180.
      else if (D <= 0.152) norm = 8.5 * Math.PI / 180.
      else if (D <= 0.22)  norm = 7.0 * Math.PI / 180.
      else                 norm = 6.0 * Math.PI / 180.
      
      let cw_1 = 1; // QUADRATIC DRAG COEFFICIENT
      let cw_2 = 100 + 1000 / 3 * D; // LINEAR DRAG COEFFICIENT

      let C_pen = C * K / 2400; // KRUPP INCLUSION
      let k = 0.5 * c_D * (D / 2) * (D / 2) * Math.PI / m; // CONSTANTS TERMS OF DRAG

      let n_angle = 200
      let step_angle = 30 * Math.PI / 180. / n_angle //ELEV. ANGLES 0-30 deg, at launch

      var alpha = [];
      var armor_abs = [];
      var armor_vert = [];
      var armor_hori = [];
      var distance = [];
      var v_impact = [];
      var fly_time = [];
      var impact_angle = [];
      var impact_angle2 = [];

      for (let i = 0; i < n_angle; i++) {
        alpha.push(i * step_angle);
        armor_abs.push(0.);
        armor_vert.push(0.);
        armor_hori.push(0.);
        distance.push(0.);
      }
      
      let dt = 0.05; //TIME STEP

      for (let i = 0; i < n_angle; i++) {
          let v_x = v_0 * Math.cos(alpha[i]);
          let v_y = v_0 * Math.sin(alpha[i]);
          let [x, y, t] = [0.0, 0.0, 0.0]

          while (y >= -10.0) {
              x = x + dt * v_x
              y = y + dt * v_y

              let T = T_0 - L * y
              let p = p_0 * Math.pow(T / T_0, g * M / R / L)
              let rho_g = p * M / R / T

              v_x = v_x - dt * k * rho_g * (cw_1 * v_x * v_x + cw_2 * v_x)
              v_y = v_y - dt * g - dt * k * rho_g * (cw_1 * v_y * v_y + cw_2 * v_y)

              t += dt
          }

          let v_imp = Math.sqrt(v_x * v_x + v_y * v_y)
          let pen_abs = C_pen * Math.pow(v_imp, 1.1) * Math.pow(m, 0.55) / Math.pow(D * 1000, 0.65) // weird penetration formula

          let IA = Math.atan(Math.abs(v_y) / Math.abs(v_x))
          let IA_vert_armor, IA_hori_armor

          if (IA - norm > 0.0) IA_vert_armor = IA - norm
          else IA_vert_armor = 0.0

          if (IA + norm < 90.0) IA_hori_armor = IA + norm
          else IA_hori_armor = 90.0;

          armor_abs[i] = pen_abs
          armor_vert[i] = pen_abs * Math.cos(IA_vert_armor)
          armor_hori[i] = pen_abs * Math.sin(IA_hori_armor)
          v_impact.push(v_imp)
          fly_time.push(t)
          impact_angle.push(IA*180./Math.PI);
          impact_angle2.push(90.0-IA*180./Math.PI);

          distance[i] = x
      }

      let interp_tuple = [];
      let interp_num = Math.floor((distance[n_angle - 1] - distance[0]) / 100) + 1;
      let offset_num = Math.floor((distance[0]) / 100);

      for (let i = 0; i < n_angle; i++) interp_tuple.push([distance[i], armor_abs[i], armor_vert[i], armor_hori[i], v_impact[i], fly_time[i],impact_angle[i],impact_angle2[i]]);
      for (let i = n_angle; i < n_angle + interp_num; i++) interp_tuple.push([(i - n_angle + offset_num + 1) * 100.0, -1.0, -1.0, -1.0, -1.0, -1.0,-1.0,-1.0]);
      

      interp_tuple.sort(function(a, b) {
          a = a[0];
          b = b[0];
          return a - b;
      });

      var inter_v_impact = [];
      var inter_fly_time = [];
      var inter_armor_abs = [];
      var inter_armor_vert = [];
      var inter_armor_hori = [];
      var inter_distance = [];
      var inter_impact_angle = [];
      var inter_impact_angle2 = [];

      let ind_before = 0;
      let j = 0;

      for (let i in interp_tuple) {
        if (interp_tuple[i][1] > 0.) {
          for (; j < inter_distance.length; j++) {
            let x1 = interp_tuple[ind_before][0];
            let x2 = interp_tuple[i][0];

            let abs_inter = interp_tuple[ind_before][1] + (interp_tuple[i][1] - interp_tuple[ind_before][1]) * (inter_distance[j] - x1) / (x2 - x1);
            let vert_inter = interp_tuple[ind_before][2] + (interp_tuple[i][2] - interp_tuple[ind_before][2]) * (inter_distance[j] - x1) / (x2 - x1);
            let hori_inter = interp_tuple[ind_before][3] + (interp_tuple[i][3] - interp_tuple[ind_before][3]) * (inter_distance[j] - x1) / (x2 - x1);
            let imp_inter = interp_tuple[ind_before][4] + (interp_tuple[i][4] - interp_tuple[ind_before][4]) * (inter_distance[j] - x1) / (x2 - x1);
            let time_inter = interp_tuple[ind_before][5] + (interp_tuple[i][5] - interp_tuple[ind_before][5]) * (inter_distance[j] - x1) / (x2 - x1);
            let  IA_inter = interp_tuple[ind_before][6] + (interp_tuple[i][6] - interp_tuple[ind_before][6]) * (inter_distance[j] - x1) / (x2 - x1);
            let IA_inter2 = interp_tuple[ind_before][7] + (interp_tuple[i][7] - interp_tuple[ind_before][7]) * (inter_distance[j] - x1) / (x2 - x1);

            inter_armor_abs.push(my_round(abs_inter));
            inter_armor_vert.push(my_round(vert_inter));
            inter_armor_hori.push(my_round(hori_inter));
            inter_v_impact.push(my_round(imp_inter));
            inter_fly_time.push(my_round(time_inter / 3.1)); // https://www.reddit.com/r/WorldOfWarships/comments/5l071u/shell_travel_time_charts/
            inter_impact_angle.push(my_round(IA_inter));
            inter_impact_angle2.push(my_round(IA_inter2));
          }
          
          ind_before = i;
        } else if (interp_tuple[i][1] < 0.) inter_distance.push(interp_tuple[i][0]);
      }

      // pen_curve_abs=interp1d(distance,armor_abs,kind='cubic')
      // pen_curve_vert=interp1d(distance,armor_vert,kind='cubic')
      // pen_curve_hori=interp1d(distance,armor_hori,kind='cubic')

      // let dist = [5000, 10000, 15000, 20000]

      for (let i in inter_distance) inter_distance[i] /= 1000.;
      
      var data_dict = {};
      data_dict.distance = inter_distance;
      data_dict.armor_abs = inter_armor_abs;
      data_dict.armor_vert = inter_armor_vert;
      data_dict.armor_hori = inter_armor_hori;
      data_dict.v_impact = inter_v_impact;
      data_dict.fly_time = inter_fly_time;
      data_dict.impact_angle = inter_impact_angle;
      data_dict.impact_angle2 = inter_impact_angle2;

      //console.log(data_dict.impact_angle2)
      return data_dict;
    }
  }
}
</script>