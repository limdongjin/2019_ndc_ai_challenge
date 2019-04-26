// AI 테스트를 위한 배틀 코드 

const prev = {
  think(hp, mp, you_hp, you_mp, history, old_games) {
    var o = old_games
    var h = history
    // if(mp === 7) return "attack";
    // if(you_mp + 3 < mp) return "attack"
    // if(you_hp < hp) return "attack"
    // 첫 판
    if(o.length === 0){
      return this.first_game_action(hp, mp, you_hp, you_mp, history);
    }

    // 1-2 라운드
    if(h.length < 2){
      return this.first_second_round(history, old_games, hp, mp, you_hp, you_mp);
    }

    var greedy_case = this.greedy_case_action(history, hp, mp, you_hp, you_mp);

    if(greedy_case !== false){
      return greedy_case;
    }

    // 확률적 결정
    return this.prob_action(o, h, hp, you_hp, mp, you_mp);
  },
  first_second_round(h, o, hp, mp, you_hp, you_mp) {
    var d = {'attack': 1, 'charge': 1, 'block': 1};
    var i;
    var current_round = h.length;

    for(i = 0; i < o.length; i++){
      var oh = o[i];
      d[oh[current_round][1]] += 1;
    }

    var rand_table = []
    for(i=0;i<d['attack'];i++){
      rand_table.push('attack');
    }
    for(i=0;i<d['charge'];i++){
      rand_table.push('charge');
    }
    for(i=0;i<d['block'];i++){
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random()*rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    return counter_act[predict_you_act];
  },

// 첫 게임일때
  first_game_action(hp, mp, you_hp, you_mp, history) {
    if(history.length === 0) return 'attack';
    if(history.length === 1) return this.rand_action();

    var prev_my_act = history[history.length - 1][0];
    var prev_y_act = history[history.length - 1][1];
    var d = {'attack': 1, 'charge': 1, 'block': 1}
    var i;

    var greedy;

    greedy = this.greedy_case_action(history, hp, mp, you_hp, you_mp);

    if(greedy !== false){
      return greedy;
    }

    for(i=1;i<history.length;i++){
      if(history[i-1][0] === prev_my_act && history[i-1][1] === prev_y_act)
        d[history[i][1]] += 1
    }

    var rand_table = [];
    for(i=0;i<d['attack'];i++){
      rand_table.push('attack');
    }
    for(i=0;i<d['charge'];i++){
      rand_table.push('charge');
    }
    for(i=0;i<d['block'];i++){
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random()*rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';
    if(you_hp <= 3*mp && predict_you_act === 'block') return 'attack';
    if(predict_you_act === 'charge' && you_mp < 1) return 'charge';

    return counter_act[predict_you_act];
  },

  rand_action(){
    var r = Math.floor(Math.random()*3);
    var d = {0: 'attack', 1: 'charge', 2: 'block'}
    return d[r];
  },

  attack_or_block(){
    var r = Math.floor(Math.random()*2);
    var d = {0: 'attack', 1: 'block'};
    return d[r];
  },

  prob_action(o, h, hp, you_hp, mp, you_mp){
    var prev_my_act = h[h.length - 1][0];
    var prev_y_act = h[h.length - 1][1];
    var d = {'attack': 1, 'charge': 1, 'block': 1}
    var i = 0;

    for(i=0;i<o.length;i++){
      var oh = o[i];
      for(var j = 1;j<oh.length;j++){
        if(oh[j -1][0] === prev_my_act && oh[j - 1][1] === prev_y_act)
          d[oh[j][1]] += 1
      }
    }

    for(i=1;i<h.length;i++){
      if(h[i-1][0] === prev_my_act && h[i-1][1] === prev_y_act)
        d[h[i][1]] += 1
    }

    var rand_table = []
    for(i=0;i<d['attack'];i++){
      rand_table.push('attack');
    }
    for(i=0;i<d['charge'];i++){
      rand_table.push('charge');
    }
    for(i=0;i<d['block'];i++){
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random()*rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    if(o.length > 1){
      var predict_table = this.predict_by_you_mp(o, h, you_mp);
      var you_act_for_mp = predict_table[0];
      var level = predict_table[1];
      if(level === 'high'){
        predict_you_act = you_act_for_mp;
      }
    }

    if(mp >= 3){
      if(predict_you_act === 'charge') return 'attack';

      if(mp >= 7) return "attack";
      // if(mp - you_mp >= 4) return "attack";
      if(predict_you_act === 'attack' && you_mp > mp + 3 && hp - you_mp - 1> 0) return "attack";
      if(predict_you_act === 'attack' && you_mp <= 1 && you_hp < hp - 1) return "block";
      if(predict_you_act === 'attack' && you_mp >= mp && you_hp >= 3*mp) return 'block';
      // return "attack";
      return this.attack_or_block();
    }

    if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';
    if(you_hp <= 3*mp && predict_you_act === 'block') return 'attack';

    if(predict_you_act === 'block' && you_hp <= mp) return 'attack';
    if(predict_you_act === 'charge' && h.length > 45) return 'attack';
    if(predict_you_act === 'charge' && you_hp <= mp + 1) return 'attack';
    if(predict_you_act === 'charge' && you_mp < 1 && you_hp >= 5) return 'charge';
    if(predict_you_act === 'charge' && you_mp - mp >= 3) return "attack";
    if(predict_you_act === 'attack' && you_mp - mp >= 3 && hp - you_mp - 1 > 0){
      return 'attack';
    }

    return counter_act[predict_you_act];
  },

  greedy_case_action(history,hp, mp, you_hp, you_mp) {

    // 상대를 무조건 KO시킬수있는 경우
    if(mp >= you_hp) return 'attack';

    // ko는 아니지만 막판에 상대피를 깎을수있는 경우
    if(hp - you_mp - 1 >= you_hp - mp && history.length >= 48) return 'attack';

    if(hp <= 5 && you_hp <= 5 && mp >= 2 && you_mp < 2) return 'attack';

    return false;
  },

  predict_by_you_mp(o, h, you_mp){
    var d = {'attack': 1, 'charge': 1, 'block': 1};
    var i, h_idx;

    for(i = 0; i < o.length; i++){
      var oh = o[i];
      var round_hp_mp_flow = []; // hp, mp, 데이터의 플로우를 저장
      round_hp_mp_flow.push({hp: 25, mp: 0, you_hp: 25, you_mp: 0});

      // mp, hp 플로우를 구축
      for(h_idx = 0; h_idx < oh.length; h_idx++){
        var my_action = oh[h_idx][0]; // 해당 라운드의 내 액션
        var you_action = oh[h_idx][1]; // 해당라운드 상대 액션
        var current_round_status = round_hp_mp_flow[h_idx];

        round_hp_mp_flow.push(calculate_hpmpy_status(current_round_status, my_action, you_action));
      }

      // you_mp 와 같은 경우일때의 액션일때를 카운팅
      for(h_idx = 0; h_idx < oh.length; h_idx++){
        if(round_hp_mp_flow[h_idx].you_mp === you_mp){
          d[oh[h_idx][1]] += 1;
        }
      }
    }

    // 가중치 부여 및 예측
    var rand_table = [];
    for(i=0;i<d['attack'];i++){
      rand_table.push('attack');
    }
    for(i=0;i<d['charge'];i++){
      rand_table.push('charge');
    }
    for(i=0;i<d['block'];i++){
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random()*rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var d_sum = d['attack']+d['block']+d['charge'];
    if(d_sum >= 7 && d_sum < 20){
      if(d['attack'] === d_sum - 2){ // block, charge 를 한번도 안낸 경우
        return ['attack', 'high']
      }
      if(d['block'] === d_sum - 2){
        return ['block', 'high']
      }
      if(d['charge'] === d_sum - 2){
        return ['charge', 'high']
      }
    }
    if(d_sum >= 20 && d_sum < 35){
      if(d['attack'] >= d_sum - 7){ // block, charge 를 attack 에 비해 비교적 적게 낸경우
        return ['attack', 'high']
      }
      if(d['block'] >= d_sum - 7){
        return ['block', 'high']
      }
      if(d['charge'] >= d_sum - 7){
        return ['charge', 'high']
      }
    }

    if(d_sum >= 35){
      if(d['attack'] >= d_sum / 2 + d_sum / 4){ // block, charge 를 attack 에 비해 비교적 적게 낸경우
        return ['attack', 'high']
      }
      if(d['block'] >= d_sum / 2 + d_sum / 4){
        return ['block', 'high']
      }
      if(d['charge'] >= d_sum / 2 + d_sum / 4){
        return ['charge', 'high']
      }
    }

    return [predict_you_act, 'mid'];
  },
  calculate_hpmpy_status(s, my_act, you_act) {
    let d = {
      'charge': {
        'charge':  { hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp + 1},
        'attack':  { hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp, you_mp: s.you_mp - 1},
        'block':   { hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp }
      },
      'attack': {
        'charge': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp - 1, you_mp: 0},
        'attack': {hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp - s.mp - 1, you_mp: 0},
        'block': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp, you_mp: s.you_mp + 1}
      },
      'block': {
        'charge': {hp: s.hp, mp: s.mp, you_hp: s.you_hp, you_mp: s.you_mp + 1},
        'attack': {hp: s.hp - s.you_mp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp - 1},
        'block': {hp: s.hp, mp: s.mp, you_hp: s.you_hp, you_mp: s.you_mp}
      }
    };
    var new_status = d[my_act][you_act];

    // mp 는 음수가 될수없음.
    if(new_status.mp < 0) new_status.mp = 0;
    if(new_status.you_mp < 0) new_status.you_mp = 0;

    return new_status;
  }
}
var first_ai_prev = {
  think(hp, mp, you_hp, you_mp, history, old_games) {
    var o = old_games
    var h = history

    // 첫 판은 랜덤으로 플레이
    if(o.length === 0) return this.rand_action();

    // 초반에는 집중모드
    if(h.length < 2) return 'charge';

    // 상대를 KO시킬수있는 경우
    if(mp + 1 >= you_hp) return 'attack';
    if(hp <= you_hp && history.length >= 48 && you_hp - mp <= hp) return 'attack'

    // mp가 3 이상이면 방어적으로 플레이
    if(mp === 0 && you_mp !== 0){
      return "attack"
    }
    if(mp <= 1 && hp > 15) return "block";
    // if(mp >= 5) return "attack";
    // if(mp >= 3) return this.attack_or_block();
    if(mp >= 3) return this.attack_or_block();
    // if(mp >= 3) return "attack";
    // 확률적 결정
    return this.prob_action(o, h, hp, you_hp, mp, you_mp);
  },

  rand_action(){
    var r = Math.floor(Math.random()*3);
    var d = {0: 'attack', 1: 'charge', 2: 'block'}
    return d[r];
  },
  attack_or_block(){
    var r = Math.floor(Math.random()*2);
    var d = {0: 'attack', 1: 'block'}
    return d[r];
  },
  prob_action(o, h, hp, you_hp, mp, you_mp){
    var prev_my_act = h[h.length - 1][0];
    var prev_y_act = h[h.length - 1][1];
    var d = {'attack': 1, 'charge': 1, 'block': 1}
    var i = 0;

    for(i=0;i<o.length;i++){
      var oh = o[i];
      for(var j = 1;j<oh.length;j++){
        if(oh[j -1][0] === prev_my_act && oh[j - 1][1] === prev_y_act)
          d[oh[j][1]] += 1
      }
    }

    for(i=1;i<h.length;i++){
      if(h[i-1][0] === prev_my_act && h[i-1][1] === prev_y_act)
        d[h[i][1]] += 1
    }

    var rand_table = []
    for(i=0;i<d['attack'];i++){
      rand_table.push('attack');
    }
    for(i=0;i<d['charge'];i++){
      rand_table.push('charge');
    }
    for(i=0;i<d['block'];i++){
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random()*rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';
    if(you_hp <= 3*mp && predict_you_act === 'block') return 'attack';
    if(predict_you_act === 'charge' && you_mp < 1) return 'charge';

    return counter_act[predict_you_act];
  }
}
var final = {
  think(hp, mp, you_hp, you_mp, history, old_games) {
    var o = old_games
    var h = history

    // 첫 판
    if (o.length === 0) {
      return this.first_game_action(hp, mp, you_hp, you_mp, history);
    }

    // 1-2 라운드
    if (h.length < 2) {
      return this.first_second_round(history, old_games, hp, mp, you_hp, you_mp);
    }

    var greedy_case = this.greedy_case_action(history, hp, mp, you_hp, you_mp);

    if (greedy_case !== false) {
      return greedy_case;
    }
    // if(mp === 3) return "attack" // 테스트용
    // 확률적 결정
    return this.prob_action(o, h, hp, you_hp, mp, you_mp);
  }
  ,
  first_second_round(h, o, hp, mp, you_hp, you_mp) {
    var d = {'attack': 1, 'charge': 1, 'block': 1};
    var i;
    var current_round = h.length;

    for (i = 0; i < o.length; i++) {
      var oh = o[i];
      d[oh[current_round][1]] += 1;
    }

    var rand_table = []
    for (i = 0; i < d['attack']; i++) {
      rand_table.push('attack');
    }
    for (i = 0; i < d['charge']; i++) {
      rand_table.push('charge');
    }
    for (i = 0; i < d['block']; i++) {
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random() * rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    return counter_act[predict_you_act];
  }
  ,
// 첫 게임일때
  first_game_action(hp, mp, you_hp, you_mp, history) {
    if (history.length === 0) return 'attack';
    if (history.length === 1) return this.rand_action();

    var prev_my_act = history[history.length - 1][0];
    var prev_y_act = history[history.length - 1][1];
    var d = {'attack': 1, 'charge': 1, 'block': 1}
    var i;

    var greedy;

    greedy = this.greedy_case_action(history, hp, mp, you_hp, you_mp);

    if (greedy !== false) {
      return greedy;
    }

    for (i = 1; i < history.length; i++) {
      if (history[i - 1][0] === prev_my_act && history[i - 1][1] === prev_y_act)
        d[history[i][1]] += 1
    }

    var rand_table = [];
    for (i = 0; i < d['attack']; i++) {
      rand_table.push('attack');
    }
    for (i = 0; i < d['charge']; i++) {
      rand_table.push('charge');
    }
    for (i = 0; i < d['block']; i++) {
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random() * rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    if (mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';
    if (you_hp <= 3 * mp && predict_you_act === 'block') return 'attack';
    if (predict_you_act === 'charge' && you_mp < 1) return 'charge';

    return counter_act[predict_you_act];
  }
  ,
  rand_action() {
    var r = Math.floor(Math.random() * 3);
    var d = {0: 'attack', 1: 'charge', 2: 'block'}
    return d[r];
  }
  ,
  attack_or_block() {
    var r = Math.floor(Math.random() * 2);
    var d = {0: 'attack', 1: 'block'};
    return d[r];
  }
  ,
  prob_action(o, h, hp, you_hp, mp, you_mp) {
    var prev_my_act = h[h.length - 1][0];
    var prev_y_act = h[h.length - 1][1];
    var d = {'attack': 1, 'charge': 1, 'block': 1}
    var i = 0;

    for (i = 0; i < o.length; i++) {
      var oh = o[i];
      for (var j = 1; j < oh.length; j++) {
        if (oh[j - 1][0] === prev_my_act && oh[j - 1][1] === prev_y_act)
          d[oh[j][1]] += 1
      }
    }

    for (i = 1; i < h.length; i++) {
      if (h[i - 1][0] === prev_my_act && h[i - 1][1] === prev_y_act)
        d[h[i][1]] += 1
    }

    var rand_table = []
    for (i = 0; i < d['attack']; i++) {
      rand_table.push('attack');
    }
    for (i = 0; i < d['charge']; i++) {
      rand_table.push('charge');
    }
    for (i = 0; i < d['block']; i++) {
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random() * rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var counter_act = {'attack': 'block', 'block': 'charge', 'charge': 'attack'};

    if (o.length > 1) {
      var predict_table = this.predict_by_you_mp(o, h, you_mp);
      var you_act_for_mp = predict_table[0];
      var level = predict_table[1];
      if (level === 'high') {
        predict_you_act = you_act_for_mp;
      }
    }

    if (mp >= 3) {
      if (predict_you_act === 'charge') return 'attack';
      if (mp >= 7) return "attack";
      if(mp - you_mp >= 4) return 'attack';
      if (predict_you_act === 'attack' && you_mp > mp + 3 && hp - you_mp - 1 > 0) return "attack";
      if (predict_you_act === 'attack' && you_mp <= 1 && you_hp < hp - 1) return "block";
      if (predict_you_act === 'attack' && you_mp >= mp && you_hp >= 3 * mp) return 'block';
      if(predict_you_act === 'attack' && you_hp<= hp - you_mp && hp >= 10) return 'block';
      if(predict_you_act === 'attack' && you_hp <= hp - you_mp && hp < 6) return 'attack';

      return this.attack_or_block();
    }

    if (mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';
    if (you_hp <= 3 * mp && predict_you_act === 'block') return 'attack';

    if (predict_you_act === 'block' && you_hp <= mp) return 'attack';
    if (predict_you_act === 'charge' && h.length > 45) return 'attack';
    if (predict_you_act === 'charge' && you_hp <= mp + 1) return 'attack';
    if (predict_you_act === 'charge' && you_mp < 1 && you_hp >= 5) return 'charge';
    if (predict_you_act === 'charge' && you_mp - mp >= 3) return "attack";
    if (predict_you_act === 'attack' && you_mp - mp >= 3 && hp - you_mp - 1 > 0) {
      return 'attack';
    }

    return counter_act[predict_you_act];
  }
  ,
  greedy_case_action(history, hp, mp, you_hp, you_mp) {

    // 상대를 무조건 KO시킬수있는 경우
    if (mp >= you_hp) return 'attack';

    // ko는 아니지만 막판에 상대피를 깎을수있는 경우
    if (hp - you_mp - 1 >= you_hp - mp && history.length >= 48) return 'attack';

    if (hp <= 5 && you_hp <= 5 && mp >= 2 && you_mp < 2) return 'attack';

    if(history.length === 49) return 'attack';
    return false;
  }
  ,
  predict_by_you_mp(o, h, you_mp) {
    var d = {'attack': 1, 'charge': 1, 'block': 1};
    var i, h_idx;

    for (i = 0; i < o.length; i++) {
      var oh = o[i];
      var round_hp_mp_flow = []; // hp, mp, 데이터의 플로우를 저장
      round_hp_mp_flow.push({hp: 25, mp: 0, you_hp: 25, you_mp: 0});

      // mp, hp 플로우를 구축
      for (h_idx = 0; h_idx < oh.length; h_idx++) {
        var my_action = oh[h_idx][0]; // 해당 라운드의 내 액션
        var you_action = oh[h_idx][1]; // 해당라운드 상대 액션
        var current_round_status = round_hp_mp_flow[h_idx];

        round_hp_mp_flow.push(this.calculate_hpmpy_status(current_round_status, my_action, you_action));
      }

      // you_mp 와 같은 경우일때의 액션일때를 카운팅
      for (h_idx = 0; h_idx < oh.length; h_idx++) {
        if (round_hp_mp_flow[h_idx].you_mp === you_mp) {
          d[oh[h_idx][1]] += 1;
        }
      }
    }

    // 가중치 부여 및 예측
    var rand_table = [];
    for (i = 0; i < d['attack']; i++) {
      rand_table.push('attack');
    }
    for (i = 0; i < d['charge']; i++) {
      rand_table.push('charge');
    }
    for (i = 0; i < d['block']; i++) {
      rand_table.push('block');
    }

    var rand_idx = Math.floor(Math.random() * rand_table.length);
    var predict_you_act = rand_table[rand_idx];

    var d_sum = d['attack'] + d['block'] + d['charge'];
    if (d_sum >= 7 && d_sum < 20) {
      if (d['attack'] === d_sum - 2) { // block, charge 를 한번도 안낸 경우
        return ['attack', 'high']
      }
      if (d['block'] === d_sum - 2) {
        return ['block', 'high']
      }
      if (d['charge'] === d_sum - 2) {
        return ['charge', 'high']
      }
    }
    if (d_sum >= 20 && d_sum < 35) {
      if (d['attack'] >= d_sum - 7) { // block, charge 를 attack 에 비해 비교적 적게 낸경우
        return ['attack', 'high']
      }
      if (d['block'] >= d_sum - 7) {
        return ['block', 'high']
      }
      if (d['charge'] >= d_sum - 7) {
        return ['charge', 'high']
      }
    }

    if (d_sum >= 35) {
      if (d['attack'] >= d_sum / 2 + d_sum / 4) { // block, charge 를 attack 에 비해 비교적 적게 낸경우
        return ['attack', 'high']
      }
      if (d['block'] >= d_sum / 2 + d_sum / 4) {
        return ['block', 'high']
      }
      if (d['charge'] >= d_sum / 2 + d_sum / 4) {
        return ['charge', 'high']
      }
    }

    return [predict_you_act, 'mid'];
  }
  ,
  calculate_hpmpy_status(s, my_act, you_act)
  {
    let d = {
      'charge': {
        'charge': {hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp + 1},
        'attack': {hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp, you_mp: s.you_mp - 1},
        'block': {hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp}
      },
      'attack': {
        'charge': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp - 1, you_mp: 0},
        'attack': {hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp - s.mp - 1, you_mp: 0},
        'block': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp, you_mp: s.you_mp + 1}
      },
      'block': {
        'charge': {hp: s.hp, mp: s.mp, you_hp: s.you_hp, you_mp: s.you_mp + 1},
        'attack': {hp: s.hp - s.you_mp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp - 1},
        'block': {hp: s.hp, mp: s.mp, you_hp: s.you_hp, you_mp: s.you_mp}
      }
    };
    var new_status = d[my_act][you_act];

    // mp 는 음수가 될수없음.
    if (new_status.mp < 0) new_status.mp = 0;
    if (new_status.you_mp < 0) new_status.you_mp = 0;

    return new_status;
  }
}

battle();

function battle() {
  var oldgames_for_f_ai = [];
  var oldgames_for_p_ai = [];

  var score_for_final_ai = 0;
  var score_for_prev_ai = 0;

  var i, k=0;
  console.log("He;;");
  var win_cnt_for_final_ai = 0;
  var win_cnt_for_prev_ai = 0;
  for(i = 0; i < 10000; i++){
    // console.log((i + 1)+" Game");

    var history_f_ai = [];
    var history_p_ai = [];

    let status = {f_hp: 25, f_mp: 0, p_hp: 25, p_mp: 0};
    for(var j = 0; j < 50; j ++) {
      var new_status, tmp;

      // console.log("  "+ (j+1)+" Round");

      const action_f = think(status.f_hp, status.f_mp, status.p_hp, status.p_mp, history_f_ai, oldgames_for_f_ai);
      // const action_p = random_ai(status.p_hp, status.p_mp, status.f_hp, status.f_mp, history_p_ai, oldgames_for_p_ai);
      const action_p = final.think(status.p_hp, status.p_mp, status.f_hp, status.f_mp, history_p_ai, oldgames_for_p_ai);

      const ss = {hp: status.f_hp,
        mp: status.f_mp, you_hp: status.p_hp, you_mp: status.p_mp};

      tmp = calculate_hpmpy_status(ss, action_f, action_p, 0);
      new_status = {f_hp: tmp.hp, f_mp: tmp.mp, p_hp: tmp.you_hp,p_mp: tmp.you_mp};

      // console.log("f_ai: " + action_f + " p_ai: " + action_p);
      var s = status_change_string(status, new_status)
      // console.log(s);

      history_f_ai.push([action_f, action_p]);
      history_p_ai.push([action_p, action_f]);

      if(new_status.f_hp <= 0){
        console.log("P_AI is Win!");
        win_cnt_for_prev_ai += 1;
        break
      }else if(new_status.p_hp <= 0){
        console.log("F_AI is Win!");
        win_cnt_for_final_ai += 1;
        break
      }
      if(j === 49 && new_status.p_hp < new_status.f_hp){
        console.log("F_AI is Win!");
        win_cnt_for_final_ai += 1;
        break
      }else if(j === 49){
        console.log("P_AI is Win!");
        win_cnt_for_prev_ai += 1;
        break
      }
      status = new_status;
    }
    oldgames_for_f_ai.push(history_f_ai);
    oldgames_for_p_ai.push(history_p_ai);
    if(win_cnt_for_prev_ai >= 6){
      score_for_prev_ai += 1;
      win_cnt_for_prev_ai = 0;
      win_cnt_for_final_ai = 0;
      oldgames_for_p_ai = [];
      oldgames_for_f_ai = []
    }else if(win_cnt_for_final_ai >= 6){
      score_for_final_ai += 1;
      win_cnt_for_prev_ai = 0;
      win_cnt_for_final_ai = 0;
      oldgames_for_p_ai = [];
      oldgames_for_f_ai = []
    }else if(win_cnt_for_final_ai + win_cnt_for_prev_ai >= 10){

      if(win_cnt_for_final_ai <= win_cnt_for_prev_ai) score_for_prev_ai += 1;
      if(win_cnt_for_prev_ai <= win_cnt_for_final_ai) score_for_final_ai += 1;
      win_cnt_for_prev_ai = 0;
      win_cnt_for_final_ai = 0;
      oldgames_for_p_ai = [];
      oldgames_for_f_ai = []
    }
    // console.log(win_cnt_for_final_ai, win_cnt_for_prev_ai);
    // console.log(score_for_final_ai, score_for_prev_ai)

  }

  console.log("f_ai: "+score_for_final_ai+" p_ai: "+score_for_prev_ai)
}

function random_ai(hp, mp, you_hp, you_mp, history, oldgames) {
  var r = Math.floor(Math.random()*3);
  var d = {0: "attack", 1: "block", 2: "charge"};

  return d[r];
}

function attack_ai(hp, mp, you_hp, you_mp, history, oldgames) {
  return "attack"
}

function status_change_string(status, new_status) {
  var printed_status_changed = "";
  printed_status_changed += "f_hp: ";
  if(status.f_hp !== new_status.f_hp)
    printed_status_changed += status.f_hp + " -> " + new_status.f_hp;
  else
    printed_status_changed += status.f_hp;

  printed_status_changed += " f_mp: ";
  if(status.f_mp !== new_status.f_mp)
    printed_status_changed += status.f_mp + " -> " + new_status.f_mp;
  else
    printed_status_changed += status.f_mp;
  printed_status_changed += " p_hp: ";
  if(status.p_hp !== new_status.p_hp)
    printed_status_changed += status.p_hp + " -> " + new_status.p_hp;
  else
    printed_status_changed += status.p_hp
  printed_status_changed += " p_mp: ";
  if(status.p_mp !== new_status.p_mp)
    printed_status_changed += status.p_mp + " -> " + new_status.p_mp;
  else
    printed_status_changed += status.p_mp;

  return printed_status_changed;
}


function think(hp, mp, you_hp, you_mp, history, old_games) {
  let o = old_games
  let h = history

  let greedy_case = greedy_case_action(history, hp, mp, you_hp, you_mp);
  if(greedy_case !== false){return greedy_case;}

  // 첫 판일때 수행.
  if(o.length === 0)
    return first_game_action(hp, mp, you_hp, you_mp, history);

  // 1-2 라운드일때 수행.
  if(h.length < 2)
    return first_second_round(history, old_games, hp, mp, you_hp, you_mp);

  // 상대의 액션을 예측하여 카운터 액션을 함.
  return optimal_action(o, h, hp, you_hp, mp, you_mp);
}

function first_second_round(h, o, hp, mp, you_hp, you_mp) {
  var d = {'attack': 1, 'charge': 1, 'block': 1};
  var i;
  var current_round = h.length;

  for(i = 0; i < o.length; i++){
    var oh = o[i];
    d[oh[current_round][1]] += 1;
  }

  let num = weighted_random_3(d['attack'], d['charge'], d['block']);
  const num_to_action = {0: "attack", 1: "charge", 2: "block"};
  let predict_you_act = num_to_action[num];

  if(mp >= 7) return "attack";
  if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';

  if(predict_you_act === "attack")
    return counter_action_for_attack(hp, mp, you_hp, you_mp);

  if(predict_you_act === "charge")
    return counter_action_for_charge(hp, mp, you_hp, you_mp);

  if(predict_you_act === "block")
    return counter_action_for_block(hp, mp, you_hp, you_mp, o.length);

  return "attack"; // 이 return 은 실행되지 않음.
}
// 첫 게임일때
function first_game_action(hp, mp, you_hp, you_mp, history) {
  if(history.length === 0) return 'attack';
  if(history.length === 1) return rand_action();

  var prev_my_act = history[history.length - 1][0];
  var prev_y_act = history[history.length - 1][1];
  var d = {'attack': 1, 'charge': 1, 'block': 1}
  var i;

  for(i=1;i<history.length;i++){
    if(history[i-1][0] === prev_my_act && history[i-1][1] === prev_y_act)
      d[history[i][1]] += 1
  }

  let num = weighted_random_3(d['attack'], d['charge'], d['block']);
  const num_to_action = {0: "attack", 1: "charge", 2: "block"};
  let predict_you_act = num_to_action[num];

  if(mp >= 7) return "attack";
  if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';

  if(predict_you_act === "attack")
    return counter_action_for_attack(hp, mp, you_hp, you_mp);

  if(predict_you_act === "charge")
    return counter_action_for_charge(hp, mp, you_hp, you_mp);

  if(predict_you_act === "block")
    return counter_action_for_block(hp, mp, you_hp, you_mp, 1);

  return "attack"; // 이 return 은 실행되지 않음.
}
function rand_action(){
  var r = Math.floor(Math.random()*3);
  var d = {0: 'attack', 1: 'charge', 2: 'block'}
  return d[r];
}
function attack_or_block(){
  var r = Math.floor(Math.random()*2);
  var d = {0: 'attack', 1: 'block'};
  return d[r];
}
function prev_act_count_table(o, h, prev_my_act, prev_you_act) {
  var d = {'attack': 1, 'charge': 1, 'block': 1};
  var i;

  for(i=0;i<o.length;i++){
    var oh = o[i];
    for(var j = 1;j<oh.length;j++){
      if(oh[j -1][0] === prev_my_act && oh[j - 1][1] === prev_you_act)
        d[oh[j][1]] += 1
    }
  }

  for(i=1;i<h.length;i++){
    if(h[i-1][0] === prev_my_act && h[i-1][1] === prev_you_act)
      d[h[i][1]] += 1
  }

  return d
}
function weighted_random_3(w1, w2, w3) {
  let rand_table = [];
  for(let i=0;i<w1;i++) rand_table.push(0);
  for(let i=0;i<w2;i++) rand_table.push(1);
  for(let i=0;i<w3;i++) rand_table.push(2);

  const rand_idx = Math.floor(Math.random()*rand_table.length);

  return rand_table[rand_idx];
}
function weighted_random_2(w1, w2) {
  let rand_table = [];
  for(let i=0;i<w1;i++) rand_table.push(0);
  for(let i=0;i<w2;i++) rand_table.push(1);

  const rand_idx = Math.floor(Math.random()*rand_table.length);

  return rand_table[rand_idx];
}
function predict_by_prev_act(old_games, history) {
  const prev_my_act = history[history.length - 1][0];
  const prev_you_act = history[history.length - 1][1];
  const num_to_action = {0: "attack", 1: "charge", 2: "block"};

  const d = prev_act_count_table(old_games, history, prev_my_act, prev_you_act);
  const action_number = weighted_random_3(d["action"], d["charge"], d["block"]);

  return num_to_action[action_number];
}
function counter_action_for_charge(hp, mp, you_hp, you_mp){
  return "attack";
}
function counter_action_for_block(hp, mp, you_hp, you_mp, old_games_length) {
  if(mp >= 3){
    // 예측이 실패 했을 가능성이 존재하므로 mp가 높을때는 charge 를 하지않음.
    return attack_or_block();
  }
  if(you_hp <= 3*mp) return 'attack';
  let weight = {charge: 90, block: 10};
  if(old_games_length === 1){
    weight.charge = 70; weight.block = 20;
  }
  return block_or_charge(weight.block, weight.charge);
}
function block_or_charge(block_weight, charge_weight) {
  let num = weighted_random_2(block_weight, charge_weight);
  let d = {0: "block", 1: "charge"};

  return d[num];
}
function counter_action_for_attack(hp, mp, you_hp, you_mp) {
  const is_you_mp_much_bigger_than_mp = ((you_mp >= mp + 3) || (mp === 0 && you_mp >= 3));
  const is_mp_much_bigger_than_mp = ((you_mp <= mp + 3) || (you_mp === 0 && mp >= 3));
  const is_not_ko_with_attack_attack_case =  (hp - you_mp - 1 > 0);
  const d = {0: "attack", 1: "block"};
  let num;

  // ko 시킬수 있는 경우
  if(you_ko_condition(mp, you_hp, 1)) return "attack";

  if(is_you_mp_much_bigger_than_mp &&
    is_not_ko_with_attack_attack_case) { // attack 이 매우 유리한 경우
    return "attack";
  }

  if(you_mp <= 1 && you_hp < hp - 1) return "block";
  if(you_mp >= mp && you_hp >= 3*mp) return 'block';

  if(mp >= 3) return attack_or_block();

  return "block";
}
function optimal_action(o, h, hp, you_hp, mp, you_mp){
  if(mp >= 7 && hp - you_mp - 1 > 0) return "attack";

  let predict_you_act = predict_by_prev_act(o, h);

  if(o.length >= 1){
    var predict_table = predict_by_you_mp(o, h, you_mp);
    var you_act_for_mp = predict_table[0];
    var level = predict_table[1];
    if(level === 'high'){
      predict_you_act = you_act_for_mp;
    }
  }

  if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';

  if(predict_you_act === "attack")
    return counter_action_for_attack(hp, mp, you_hp, you_mp);

  if(predict_you_act === "charge")
    return counter_action_for_charge(hp, mp, you_hp, you_mp);

  if(predict_you_act === "block")
    return counter_action_for_block(hp, mp, you_hp, you_mp, 0);

  return "attack"; // 이 return 은 실행되지 않음.
}
function greedy_case_action(history,hp, mp, you_hp, you_mp) {
  if(you_ko_condition(mp,you_hp, 0))
    return 'attack';

  // 막판에 상대피를 깎을수있는 경우
  if(is_bigger_hp_for_attack_attack_case(hp, mp, you_hp, you_mp) &&
    is_soon_end_round_num_limit(history)
  ) return 'attack';

  if(is_small_hp_and_you_hp(hp, you_hp) && mp >= 2 && you_mp < 2)
    return 'attack';

  return false;
}
function you_ko_condition(mp, you_hp, plus) {return mp + plus >= you_hp;}
function is_small_hp_and_you_hp(hp, you_hp) {return hp <= 5 && you_hp <= 5;}
function is_soon_end_round_num_limit(history) {return history.length >= 48}
function is_bigger_hp_for_attack_attack_case(hp, mp, you_hp, you_mp) {
  return hp - you_mp - 1 >= you_hp - mp - 1;
}
function predict_by_you_mp(o, h, you_mp){
  var d = {'attack': 1, 'charge': 1, 'block': 1};
  var i, h_idx;

  for(i = 0; i < o.length; i++){
    var oh = o[i];
    var round_hp_mp_flow = []; // hp, mp, 데이터의 플로우를 저장
    round_hp_mp_flow.push({hp: 25, mp: 0, you_hp: 25, you_mp: 0});

    // mp, hp 플로우를 구축
    for(h_idx = 0; h_idx < oh.length; h_idx++){
      var my_action = oh[h_idx][0]; // 해당 라운드의 내 액션
      var you_action = oh[h_idx][1]; // 해당라운드 상대 액션
      var current_round_status = round_hp_mp_flow[h_idx];

      round_hp_mp_flow.push(calculate_hpmpy_status(current_round_status, my_action, you_action));
    }

    // you_mp 와 같은 경우일때의 액션일때를 카운팅
    for(h_idx = 0; h_idx < oh.length; h_idx++){
      if(round_hp_mp_flow[h_idx].you_mp === you_mp){
        d[oh[h_idx][1]] += 1;
      }
    }
  }


  let num = weighted_random_3(d['attack'], d['charge'], d['block']);
  const num_to_action = {0: 'attack', 1:'charge', 2:'block'};

  let predict_you_act = num_to_action[num];

  var d_sum = d['attack']+d['block']+d['charge'];
  if(d_sum >= 7 && d_sum < 20){
    if(d['attack'] === d_sum - 2){ // block, charge 를 한번도 안낸 경우
      return ['attack', 'high']
    }
    if(d['block'] === d_sum - 2){
      return ['block', 'high']
    }
    if(d['charge'] === d_sum - 2){
      return ['charge', 'high']
    }
  }
  if(d_sum >= 20 && d_sum < 35){
    if(d['attack'] >= d_sum - 7){ // block, charge 를 attack 에 비해 비교적 적게 낸경우
      return ['attack', 'high']
    }
    if(d['block'] >= d_sum - 7){
      return ['block', 'high']
    }
    if(d['charge'] >= d_sum - 7){
      return ['charge', 'high']
    }
  }

  if(d_sum >= 35){
    if(d['attack'] >= d_sum / 2 + d_sum / 4){ // block, charge 를 attack 에 비해 비교적 적게 낸경우
      return ['attack', 'high']
    }
    if(d['block'] >= d_sum / 2 + d_sum / 4){
      return ['block', 'high']
    }
    if(d['charge'] >= d_sum / 2 + d_sum / 4){
      return ['charge', 'high']
    }
  }

  return [predict_you_act, 'mid'];
}
function calculate_hpmpy_status(s, my_act, you_act) {
  let d = {
    'charge': {
      'charge':  { hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp + 1},
      'attack':  { hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp, you_mp: s.you_mp - 1},
      'block':   { hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp }
    },
    'attack': {
      'charge': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp - 1, you_mp: 0},
      'attack': {hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp - s.mp - 1, you_mp: 0},
      'block': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp, you_mp: s.you_mp + 1}
    },
    'block': {
      'charge': {hp: s.hp, mp: s.mp, you_hp: s.you_hp, you_mp: s.you_mp + 1},
      'attack': {hp: s.hp - s.you_mp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp - 1},
      'block': {hp: s.hp, mp: s.mp, you_hp: s.you_hp, you_mp: s.you_mp}
    }
  };
  var new_status = d[my_act][you_act];

  // mp 는 음수가 될수없음.
  if(new_status.mp < 0) new_status.mp = 0;
  if(new_status.you_mp < 0) new_status.you_mp = 0;

  return new_status;
}
