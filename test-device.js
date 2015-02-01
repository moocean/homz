/**
  a randomized test device with a rnd dll
**/

var mqtt    = require('mqtt')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  , _       = require('lodash')

  , config  = yaml.safeLoad(fs.readFileSync(__dirname + '/' + 'config.yml', 'utf8'))
  , dlls    = _.map(fs.readdirSync(__dirname + '/lib/dll/'), function(d){
                return d.split(".")[0];
              })
  , type    = dlls[getRnd(0,dlls.length-1)]
  , id      = makeStr("0123456789abcdef", 24)
  , client  = mqtt.connect({
                port: config.mqtt.port,
                host: config.mqtt.host,
                clean: true,
                encoding: 'binary',
                keepalive: 0
              })
  , count   = 0
  , dll     = getDLL(type)
  , timeout
  ;

client.on('connect', function() {
  var self = this;
  reg();

  self.on('message', function (topic, message) {
    if(topic == config.topics.home+'/'+id){
      msgIn(message);
    }
  });

});





/*
  functions ...
*/

function reg(cb){
  client.publish(config.topics.registry, id+'|'+type);
  if(dll.listen){
    client.subscribe(config.topics.home+'/'+id);
  }
  console.log('REGISTERED AS: ' + id+' | '+type );

  if (cb){ cb(); }
}

function msgIn(msg){
  var newStatus = dll.status;

  if(!dll.verify(msg)){
    errorLog(dll.err);
    return false;
  }

  if(msg == '2'){
      if(dll.status == '1'){
        newStatus = '0';
        console.log('>>> TOGGLED OFF');
      } else {
        newStatus = '1';
        console.log('>>> TOGGLED ON');
      }
  }

  if(msg == '1'){
    newStatus = '1';
    console.log('>>> SWITCHED ON');
  }

  if(msg == '0'){
    newStatus = '0';
    console.log('<<< SWITCHED OFF');
  }

  dll.status = newStatus;
}

function errorLog(msg){
  client.publish(config.topics.error, id + '|' + type +' > ' +msg);
}

function unreg(){
  client.publish(config.topics.registry, id+'|'+type+'|bye');
  client.end();
  clearTimeout(timeout);
}

function getRnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeStr(possible,num){
  var text = "";

  for( var i=0; i < num; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function getDLL(dllName){
  try{
    var ret = require('./lib/dll/'+dllName);
  } catch(err){
    if(err.code === 'MODULE_NOT_FOUND'){
      return false;
    }
  }

  return new ret;
}
/*

client.on('connect', function() {

  client.subscribe(config.topics.health);
  client.subscribe(config.topics.status);

  self.on('message', function (topic, message) {
    if(topic == config.topics.health){
      if (message == 'stop' || message == 'stop'+id ){
        console.log('>>> SHUTTING DOWN <<<');
        unreg();
      }
    }
    if(topic == config.topics.status){
      if (message == 'rereg') {
        reg();
        console.log('>>> REREGED <<<');
      }
      if (message == 'statuscheck'){
        client.publish(config.topics.status, id);
      }
    }

  });


});






*/
