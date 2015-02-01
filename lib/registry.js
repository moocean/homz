var _       = require('lodash')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  ;

var theregistry = {
  devices : []
};


module.exports = function init(client, config){
  theregistry.client = client;
  theregistry.config = config;
  client.subscribe(theregistry.config.topics.registry);

  client.on('message', function (topic, message) {
    if(theregistry.config.topics.registry == topic) {
      registry(message.toString());
    }
  });
  client.publish(theregistry.config.topics.status, 'rereg');
  return theregistry;
}

var registry = function(message){
  var item = message.split("|");
  if(item.length != 2 && item.length != 3) {
    errorLog('REG|NOT A DEVICE : ' + message);
  } else if( item.length == 3 ){
    if(unregister(item) == true){
      console.log('<<< UNREGISTERED ITEM: ID> ' + item[0] + ' - TYPE> ' + item[1]);
    }
  } else {
    if (!register(item)){
      errorLog('REG|COULDNT REGISTER ITEM : ID> ' + item[0] + ' - TYPE> ' + item[1]);
    } else {
      console.log('>>> REGISTERED ITEM : ID> ' + item[0] + ' - TYPE> ' + item[1]);
    }
  }
}

var register = function(item){
  var deviceid = item[0];
  var devicetype = item[1];
  var dll = getDLL(devicetype);

  if( !dll ) {
    return false;
  }

  var exists = _.where(theregistry.devices, {id: deviceid});
  if( typeof exists[0] != 'undefined') {
    errorLog('REG|DOUBLICATE!');
    return false;
  }

  dll.id = deviceid;
  dll.dll = devicetype;
  theregistry.devices.push(dll);
  sub(dll, theregistry.config.topics.home+'/');

  return true;
}

var unregister = function(item){
  var deviceid = item[0];
  var devicetype = item[1];
  var index = _.findIndex(theregistry.devices, {id: deviceid});
  var dll = theregistry.devices[index];
  if (index != -1){
    theregistry.devices.splice(index, 1);
    unsub(dll, theregistry.config.topics.home+'/');
    return true;
  }

  return false;
}

var sub = function(device, prefix){
  if(device.itemtype == 'sensor'){
    theregistry.client.subscribe(prefix + '' + device.id);
  }
}

var unsub = function(device, prefix){
  if(device.itemtype == 'sensor'){
    theregistry.client.unsubscribe(prefix + '' + device.id);
  }
}

var getDLL = function(dllName){
  try{
    var ret = require('./dll/'+dllName);
  } catch(err){
    errorLog(err);
    if(err.code === 'MODULE_NOT_FOUND'){
      return false;
    }
  }

  return new ret;
}

function errorLog(msg){
  theregistry.client.publish(theregistry.config.topics.error, msg);
}
