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
  if(mp >= 7) return "attack";
  var d = {'attack': 1, 'charge': 1, 'block': 1};
  var i;
  var current_round = h.length;
  let accuracy = "low";
  let predict_you_act;

  for(i = 0; i < o.length; i++){
    var oh = o[i];
    d[oh[current_round][1]] += 1;
  }

  let num = weighted_random_3(d['attack'], d['charge'], d['block']);
  const num_to_action = {0: "attack", 1: "charge", 2: "block"};
  predict_you_act = num_to_action[num];
  let d_sum = d["attack"]+d["block"]+d["charge"];

  if(d_sum - 2 === d["attack"]){accuracy = "high";predict_you_act ="attack"}
  if(d_sum - 2 === d["charge"]){accuracy = "high";predict_you_act ="charge"}
  if(d_sum - 2 === d["block"]){accuracy = "high";predict_you_act ="block"}

  if(predict_you_act === "attack")
    return counter_action_for_attack(hp, mp, you_hp, you_mp, accuracy, h.length);

  if(predict_you_act === "charge")
    return counter_action_for_charge(hp, mp, you_hp, you_mp, accuracy);

  if(predict_you_act === "block")
    return counter_action_for_block(hp, mp, you_hp, you_mp, h.length, accuracy);

  return "attack"; // 이 return 은 실행되지 않음.
}

// 첫 게임일때
function first_game_action(hp, mp, you_hp, you_mp, history) {
  if(history.length === 0) return 'attack';
  if(history.length === 1) {
    if(mp > 1) return "attack";
    return rand_action();
  }

  let predict_you_act;
  let accuracy = "low";
  let predict_prev_table;

  if(history.length !== 0) {
    predict_prev_table = predict_by_prev_act([], history);
    predict_you_act = predict_prev_table[0];
  }

  let predict_mp_table = predict_by_you_mp([history], history, you_mp);


  if(predict_prev_table[1] === "high") {
    predict_you_act = predict_prev_table[0];
    accuracy = "high"
  }
  // mp 로 예측 된 결과가 더 우선 순위를 갖는다.
  if(predict_mp_table[1] === "high") {
    predict_you_act = predict_mp_table[0];
    accuracy = "high"
  }

  if(mp >= 7) return "attack";
  if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';

  if(predict_you_act === "attack")
    return counter_action_for_attack(hp, mp, you_hp, you_mp, accuracy, history.length);

  if(predict_you_act === "charge")
    return counter_action_for_charge(hp, mp, you_hp, you_mp, accuracy);

  if(predict_you_act === "block")
    return counter_action_for_block(hp, mp, you_hp, you_mp, history.length, accuracy);

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
  let accuracy = "low";
  const d = prev_act_count_table(old_games, history, prev_my_act, prev_you_act);
  const action_number = weighted_random_3(d["attack"], d["charge"], d["block"]);
  const d_sum = d["attack"] + d["charge"] + d["block"];

  if(d_sum <= 20 && d_sum > 7){
    if(d_sum === d["attack"] + 2){
      accuracy = "high";
      return ["attack", "high"];
    }else if(d_sum === d["block"] + 2){
      accuracy = "high";
      return ["block", "high"]
    }else if(d_sum === d["charge"] + 2){
      accuracy = "high";
      return ["charge", "high"]
    }
  }else if(d_sum > 20){
    let d_sum_3_4 = (d_sum / 2 + d_sum / 4);
    if(d["attack"] >= d_sum_3_4){
      accuracy = "high";
      return ["attack", "high"];
    }else if(d["block"] >= d_sum_3_4){
      accuracy = "high";
      return ["block", "high"]
    }else if(d["charge"] >= (d_sum / 2 + d_sum / 4)){
      accuracy = "high";
      return ["charge", "high"]
    }
  }

  return [num_to_action[action_number], accuracy];
}
function counter_action_for_charge(hp, mp, you_hp, you_mp, accuracy){
  const is_mp_much_bigger_than_you_mp = ((you_mp + 3 <= mp) || (you_mp === 0 && mp >= 3));
  if(accuracy === "high"){
    if(mp <= 2 && you_mp === 0 && you_mp - mp < hp && hp > 7) return "charge";
    return "attack";
  }

  if(is_mp_much_bigger_than_you_mp){
    if(you_hp < 5) return "attack";
    if(you_hp - mp - 1 <= 0) return "attack";

    let d = {0: "attack", 1: "block"};
    let num = weighted_random_2(30, 70);
    return d[num];
  }
  return "attack";
}
function counter_action_for_block(hp, mp, you_hp, you_mp, history_length, accuracy) {
  if(accuracy === "high"){
    if(mp >= 3 && you_mp === 0) return "attack";
    if(you_hp <= 5 && mp !== 0 && hp > 10 && you_mp < 2) return "attack"
    if(you_mp*3 < mp) return "attack";
    if(history_length > 45 && mp - you_mp >= 3) return "attack";
    if(history_length > 45 && you_hp <= 5 && mp !== 0) return "attack";

    return "charge";
  }
  if(you_hp <= 5 && mp !== 0 && hp > 10) return "attack"
  if(you_hp <= 3*mp) return 'attack';
  if(mp >= 3 && you_mp === 0) return "attack";
  if(history_length > 45 && mp - you_mp >= 3) return "attack";
  if(history_length > 45 && you_hp <= 5 && mp !== 0) return "attack";
  let weight = {charge: 70, block: 30};

  return block_or_charge(weight.block, weight.charge);
}
function block_or_charge(block_weight, charge_weight) {
  let num = weighted_random_2(block_weight, charge_weight);
  let d = {0: "block", 1: "charge"};

  return d[num];
}
function counter_action_for_attack(hp, mp, you_hp, you_mp, accuracy, history_length) {
  if(mp >= 6) return "attack";
  const is_you_mp_much_bigger_than_mp = ((you_mp >= mp + 3));
  const is_not_ko_with_attack_attack_case =  (hp - you_mp - 1 > 0);
  const d = {0: "attack", 1: "block"};
  let num;

  // ko 시킬수 있는 경우
  if(you_ko_condition(mp, you_hp, 1)) return "attack";
  // if(is_not_ko_with_attack_attack_case === false) return "block";

  // attack 이 매우 유리한 경우
  if(is_you_mp_much_bigger_than_mp &&
     is_not_ko_with_attack_attack_case &&
     is_not_ko_with_attack_attack_case
  ) return "attack";

  if(you_hp <= 5 && mp !== 0 && hp > 10 && you_mp < 2) return "attack"
  if(hp - you_mp <= 0) return "attack";
  if(history_length > 45 && mp - you_mp >= 3) return "attack";
  if(history_length > 45 && you_hp <= 5 && mp !== 0) return "attack";

  return "block";
}
function optimal_action(o, h, hp, you_hp, mp, you_mp){
  if(mp >= 7 && hp - you_mp - 1 > 0 && mp - you_mp >= 4) return "attack";

  // let predict_you_act = predict_by_prev_act(o, h);
  let predict_you_act;
  let accuracy = "low";
  let predict_prev_table;

  predict_prev_table = predict_by_prev_act(o, h);
  predict_you_act = predict_prev_table[0];

  o.push(h);
  let predict_mp_table = predict_by_you_mp(o, h, you_mp);

  if(predict_prev_table[1] === "high") {
    predict_you_act = predict_prev_table[0];
    accuracy = "high"
  }
  // mp 로 예측 된 결과가 더 우선 순위를 갖는다.
  if(predict_mp_table[1] === "high") {
    predict_you_act = predict_mp_table[0];
    accuracy = "high"
  }

  if(mp >= 2 && you_hp <= 5 && predict_you_act !== 'attack') return 'attack';

  if(predict_you_act === "attack")
    return counter_action_for_attack(hp, mp, you_hp, you_mp, accuracy, h.length);

  if(predict_you_act === "charge")
    return counter_action_for_charge(hp, mp, you_hp, you_mp, accuracy);

  if(predict_you_act === "block")
    return counter_action_for_block(hp, mp, you_hp, you_mp, h.length, accuracy);

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

  let d_sum = d['attack']+d['block']+d['charge'];
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

  return [predict_you_act, 'low'];
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
