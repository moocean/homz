var pm = {};

var sensors = [];
var actors = [];


pm.sensors = function(devices){

  Object.keys(devices).forEach(function(key) {
    var obj = devices[key];
    if(obj != null){
      if(obj.type == 'sensor'){
        sensors.push({ id: key, topic: obj.topic, values: obj.values });
      }
    }
  });

  return sensors;
}

pm.actors = function(devices){

  Object.keys(devices).forEach(function(key) {
    var obj = devices[key];
    if(obj != null){
      if(obj.type == 'actor'){
        actors.push({ id: key, topic: obj.topic, values: obj.values });
      }
    }
  });

  return actors;
}

pm.map = function(maps){

  map = maps;

  return map;

}

pm.subscribe = function(client){
  var countSubscriptions = 0;

  console.log('Subscribing to Topics:');

  sensors.forEach(function(element, index, array) {
    client.subscribe(element.topic);
    console.log('    ' + element.topic + ' for ' + element.id);
    countSubscriptions++;
  });

  return countSubscriptions;

}

pm.messageIn = function(topic, message){
/*  console.log('sensors');
  console.log(sensors);
  console.log('------------------------------------------------------------------');
  console.log('actors');
  console.log(actors);
  console.log('------------------------------------------------------------------');
  console.log('map');
  console.log(map);
  console.log('------------------------------------------------------------------');
*/
  return true;
}

module.exports = pm;
