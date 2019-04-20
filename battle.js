battle();

function battle() {
  var oldgames_for_f_ai = [];
  var oldgames_for_p_ai = [];

  var score_for_final_ai = 0;
  var score_for_prev_ai = 0;
  var win_cnt_for_final_ai = 0;
  var win_cnt_for_prev_ai = 0;
  var i, k=0;
  console.log("He;;");
  for(i = 0; i < 10; i++){
    console.log((i + 1)+" Game");

    var history_f_ai = [];
    var history_p_ai = [];

    let status = {f_hp: 25, f_mp: 0, p_hp: 25, p_mp: 0};
    for(var j = 0; j < 50; j ++) {
      var new_status, tmp;
      var win_flag = 0;
      console.log("  "+ (j+1)+" Round");
      if (win_cnt_for_final_ai === 6) {
        // finish game and final ai is win
        win_flag = 1;
        console.log("Final AI is Win!");
      }
      if (win_cnt_for_prev_ai === 6) {
        // finish game and final ai is win
        win_flag = 1;
        console.log("Last AI is Win!");
      }
      const action_f = think(status.f_hp, status.f_mp, status.p_hp, status.p_mp, history_f_ai, oldgames_for_f_ai);
      const action_p = random_ai(status.p_hp, status.p_mp, status.f_hp, status.f_mp, history_p_ai, oldgames_for_p_ai);
      const ss = {hp: status.f_hp,
        mp: status.f_mp, you_hp: status.p_hp, you_mp: status.p_mp};

      tmp = calculate_hpmpy_status(ss, action_f, action_p, 0);
      new_status = {f_hp: tmp.hp, f_mp: tmp.mp, p_hp: tmp.you_hp,p_mp: tmp.you_mp};

      var s = status_change_string(status, new_status)
      console.log(s);

      history_f_ai.push([action_f, action_p]);
      history_p_ai.push([action_p, action_f]);
      console.log("f_ai: " + action_f + " p_ai: " + action_p);
      if(new_status.f_hp <= 0){
        console.log("P_AI is Win!");
        break;
      }else if(new_status.p_hp <= 0){
        console.log("F_AI is Win!");
        break;
      }
      status = new_status;
    }
    oldgames_for_f_ai.push(history_f_ai);
    oldgames_for_p_ai.push(history_p_ai);
  }

}

function random_ai(hp, mp, you_hp, you_mp, history, oldgames) {
  var r = Math.floor(Math.random()*3);
  var d = {0: "attack", 1: "block", 2: "charge"};

  return d[r];
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

//
// 최종 버전 ai
//
function think(hp, mp, you_hp, you_mp, history, old_games) {
  var o = old_games
  var h = history

  // 첫 판
  if(o.length === 0){
    return first_game_action(hp, mp, you_hp, you_mp, history);
  }

  // 1-2 라운드
  if(h.length < 2){
    return first_second_round(history, old_games, hp, mp, you_hp, you_mp);
  }

  var greedy_case = greedy_case_action(history, hp, mp, you_hp, you_mp);

  if(greedy_case !== false){
    return greedy_case;
  }

  // 확률적 결정
  return prob_action(o, h, hp, you_hp, mp, you_mp);
}

function first_second_round(h, o, hp, mp, you_hp, you_mp) {
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
}

// 첫 게임일때
function first_game_action(hp, mp, you_hp, you_mp, history) {
  if(history.length === 0) return 'attack';
  if(history.length === 1) return rand_action();

  var prev_my_act = history[history.length - 1][0];
  var prev_y_act = history[history.length - 1][1];
  var d = {'attack': 1, 'charge': 1, 'block': 1}
  var i;

  var greedy;

  greedy = greedy_case_action(history, hp, mp, you_hp, you_mp);

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

function prob_action(o, h, hp, you_hp, mp, you_mp){
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
    var predict_table = predict_by_you_mp(o, h, you_mp);
    var you_act_for_mp = predict_table[0];
    var level = predict_table[1];
    if(level === 'high'){
      predict_you_act = you_act_for_mp;
    }
  }

  if(mp >= 3){
    if(predict_you_act === 'charge') return 'attack';
    if(mp >= 7) return "attack";
    if(predict_you_act === 'attack' && you_mp > mp + 3 && hp - you_mp - 1> 0) return "attack";
    if(predict_you_act === 'attack' && you_mp <= 1 && you_hp < hp - 1) return "block";
    if(predict_you_act === 'attack' && you_mp >= mp && you_hp >= 3*mp) return 'block';

    return attack_or_block();
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
}

function greedy_case_action(history,hp, mp, you_hp, you_mp) {

  // 상대를 무조건 KO시킬수있는 경우
  if(mp >= you_hp) return 'attack';

  // ko는 아니지만 막판에 상대피를 깎을수있는 경우
  if(hp - you_mp - 1 >= you_hp - mp && history.length >= 48) return 'attack';

  if(hp <= 5 && you_hp <= 5 && mp >= 2 && you_mp < 2) return 'attack';

  return false;
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
}

function calculate_hpmpy_status(s, my_act, you_act, round) {
  console.log(my_act, you_act);
  let d = {
    'charge': {
      'charge':  { hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp + 1},
      'attack':  { hp: s.hp - s.you_mp - 1, mp: 0, you_hp: s.you_hp, you_mp: s.you_mp - 1},
      'block':   { hp: s.hp, mp: s.mp + 1, you_hp: s.you_hp, you_mp: s.you_mp }
    },
    'attack': {
      'charge': {hp: s.hp, mp: s.mp - 1, you_hp: s.you_hp - s.mp - 1, you_mp: s.you_mp - 1},
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
  if(new_status.mp < 0) new_status.mp = 0;
  if(new_status.you_mp < 0) new_status.you_mp = 0;
  console.log(s);
  console.log(d[my_act][you_act]);
  return new_status;
}
