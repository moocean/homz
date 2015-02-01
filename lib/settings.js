var _       = require('lodash')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  ;

var settings = {}

module.exports = function init(client,devices,map, config){
  settings.client = client;
  settings.devices = devices;
  settings.mapping = map;
  settings.config = config;
  settings.client.subscribe(settings.config.topics.settings);

  client.on('message', function (topic, message) {
    if(settings.config.topics.settings == topic) {
      msgIn(message.toString());
    }
  });

  return settings;
}

function msgIn(msg){
  var msg = msg.split("|");
  switch (msg[0]) {
    case 'newmap':
      newMap([msg[1],msg[2]]);
      break;
    case 'delmap':
      delMap([msg[1],msg[2]]);
      break;
    case 'loadmap':
      loadMap();
      break;
    case 'randommap':
      randomMap();
      break;
    case 'cleanmap':
      cleanMap();
      break;
    case 'savemap':
      saveMap();
      break;
    default:
      errorLog('!!! NO ROUTE FOUND > '+msg[0]);
  }

}

function newMap(map){
  if(checkDevice(map[0], 'sensor')){
    var sensor = map[0];
  }
  if(checkDevice(map[1], 'actor')){
    var actor = map[1];
  }
  if(sensor && actor ){
    settings.mapping.map.push({sensor: sensor, actor: actor});
    console.log('>>> ADDED ROUTE > '+ sensor +' > '+ actor);
    saveMap();
    return true;
  }
  return false;
}

function delMap(map){
  if(checkDevice(map[0], 'sensor')){
    var sensor = map[0];
  }
  if(checkDevice(map[1], 'actor')){
    var actor = map[1];
  }
  if(sensor && actor ){
    var index = _.findIndex(settings.mapping.map, {sensor: sensor, actor: actor});
    if (index != -1){
      settings.mapping.map.splice(index, 1);
      console.log('<<< REMOVED ROUTE > '+ sensor +' > '+ actor);
      saveMap();
      return true;
    }
    return false;
  }
  return false;
}

function loadMap(){
  settings.mapping = yaml.safeLoad(fs.readFileSync('./' + 'map.yml', 'utf-8'));
  console.log('>>> REINITIALISED MAP');
  console.log(settings.mapping);
}

function randomMap(){
  console.log('>>> GENERATING RANDOM MAPPING');
  var sensors = listDevices('sensor');
  var sl = sensors.length -1;
  var actors = listDevices('actor');
  var al = actors.length -1;
  var all = listDevices('all');
  var rmap = [];

  for (var i = 0; i < all.length; i++) {
    var cur = all[i];
    if(cur.type == 'actor'){
      rmap.push({
        sensor: sensors[getRnd(0, sl)],
        actor: cur.id
      });

    }else{
      actors[getRnd(0, al)]
      rmap.push({
        sensor: cur.id,
        actor: actors[getRnd(0, al)]
      });
    }
  }

  settings.mapping.map = rmap;
  cleanMap();
}

function cleanMap(){
  console.log('>>> CLEANING UP DOUBLICATE MAPPINGS');
  console.log(settings.mapping.map);
  var tmap = [];

  for (var i = 0; i < settings.mapping.map.length; i++) {
    var cur = settings.mapping.map[i];
    var index = _.findIndex(tmap, {actor: cur.actor, sensor: cur.sensor});
    if(index == -1){
      tmap.push(cur);
    }
  }
  console.log('>>> AFTER CLEANUP');
  console.log(tmap);
  settings.mapping.map = tmap;
}

function saveMap(){
  fs.writeFileSync('./' + 'map.yml', yaml.safeDump(settings.mapping), 'utf8' );
  console.log('>>> SAVED MAPPING TO MAP.YML');
  return true;
}

function checkDevice(id, type){
  var index = _.findIndex(settings.devices, {id: id});
  if(index == -1){
    errorLog('!!! NO SUCH DEVICE > '+ id);
    return false;
  }
  var tempdevice = settings.devices[index];
  if(tempdevice.itemtype != type){
    errorLog('!!! DEVICE IS NOT > '+type);
    return false;
  }
  return true;
}

function listDevices(type){
  var devicelist = [];

  if(type == 'all'){
    for (var i = 0; i < settings.devices.length; i++) {
      var cur = settings.devices[i];
      devicelist.push({id: cur.id, type: cur.itemtype});
    }
  } else {
    for (var i = 0; i < settings.devices.length; i++) {
      var cur = settings.devices[i];
      if(type == cur.itemtype){
        devicelist.push(cur.id);
      }
    }
  }

  return devicelist;
}

function getRnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function errorLog(msg){
  setting.client.publish(settings.config.topics.error, msg);
}
