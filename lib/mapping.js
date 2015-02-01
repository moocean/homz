var _       = require('lodash')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  ;

var mapping = {};

module.exports = function init(client, devices, map, config){
  mapping.client = client;
  mapping.devices = devices;
  mapping.map = map;
  mapping.config = config;
  mapping.client.subscribe(mapping.config.topics.mapping);

  client.on('message', function (topic, message) {
    if(mapping.config.topics.mapping == topic) {
      msgStatus(message.toString());
    }else {
      msgIn(topic, message.toString());
    }


  });

  return mapping;
}

function msgStatus(msg){
  if(msg == 'show'){
    console.log('>>> MAPPING SETUP: ');
    console.log(mapping.map);
  }
}

function msgIn(topic, msg){
  var topic = topic.split("/");
  if( topic[0] != mapping.config.topics.home){
    return false;
  }
  var sensor = topic[1];
  var target = _.where(mapping.map.map, {sensor: sensor});

  if( typeof target[0] == 'undefined') {
    errorLog('MAP|NO ROUTE FOR SENSOR '+ sensor);
    return false;
  }

  for (var i = 0; i < target.length; i++) {
    var cur = target[i];
    setStatus(cur.actor,msg);
  }
}

function setStatus(actor, status){
  var index = _.findIndex(mapping.devices, {id: actor});
  if (index != -1){
    var cur = mapping.devices[index];
    if(!cur.verify(status)){
      //errorLog('DLL|VERIFY FAILED');
      return false;
    }
    cur.status = status;
    mapping.client.publish(mapping.config.topics.home+'/'+actor, status);
  }
  return false;
}

function errorLog(msg){
  mapping.client.publish(mapping.config.topics.error, msg);
}
