var _       = require('lodash')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  ;

var status = {};

module.exports = function init(client,devices, config){
  status.client = client;
  status.devices = devices;
  status.config = config
  status.client.subscribe(status.config.topics.status);

  client.on('message', function (topic, message) {
    if(status.config.topics.status == topic) {
      msgIn(message.toString());
    }
  });

  return status;
}

status.check = function(){
  status.devcheck = [];
  console.log('!!! INITIALISED STATUS CHECK !!!');
  for (var i = 0; i < status.devices.length; i++) {
    var cur = status.devices[i];
    var id = cur.id
    var type = cur.dll;
    status.devcheck.push({id : id, type: type});
  }

  status.client.publish(status.config.topics.status, 'statuscheck');
  status.timeout = setTimeout(unregdevices, 10000);
}

function msgIn(msg){
  switch (msg) {
    case 'statuscheck':
      return;
      break;
    case 'rereg':
      return;
      break;
    case 'show':
      for (var i = 0; i < status.devices.length; i++) {
        var cur = status.devices[i];
        if(cur.itemtype == 'actor')
          console.log('### ID: '+cur.id+' > '+cur.status);
      }
      return;
      break;
    case 'check':
      console.log(status.devices);
      return;
      break;
    case 'initstatuscheck':
      status.check();
      return;
      break;
    default:
  }

  var index = _.findIndex(status.devcheck, {id: msg});
  status.devcheck.splice(index,1);
}

function unregdevices(){
  for (var i = 0; i < status.devcheck.length; i++) {
    var cur = status.devcheck[i];
    var id = cur.id
    var type = cur.type;

    unreg(id, type);
    console.log('<<< UNREGISTERED VIA STATUSCHECK: '+id+'/'+type);
  }
}

function unreg(id, type){
  status.client.publish(status.config.topics.health, 'stop'+id);
  status.client.publish(status.config.topics.registry, id+'|'+type+'|bye');
}

function errorLog(msg){
  status.client.publish(status.config.topics.error, msg);
}
