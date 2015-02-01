/**
  a randomized test actor with a rnd dll (mzrl140130, mzrl140201)
**/

var mqtt    = require('mqtt')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  , config  = yaml.safeLoad(fs.readFileSync(__dirname + '/' + 'config.yml', 'utf8'))
  ;

var dlls    = ['mzrl140130', 'mzrl140201'];
var type    = dlls[getRnd(0,1)];
var id      = makeStr("0123456789abcdef", 24);
var client = mqtt.connect({ port: config.mqtt.port, host: config.mqtt.host, clean: true, encoding: 'binary', keepalive: 0 });
var count   = 0;
var timeout;

client.on('connect', function() {
  var self = this;
  reg();

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
    if(topic == config.topics.home+'/'+id){
      msgIn(message);
    }
  });


});

function msgIn(msg){
  if(msg == '1'){
    console.log('>>> SWITCHED ON');
  }
  if(msg == '0'){
    console.log('<<< SWITCHED OFF');
  }
}

function reg(cb){
  client.publish(config.topics.registry, id+'|'+type);
  client.subscribe(config.topics.home+'/'+id);
  console.log('REGISTERED: ' + id)
  if (cb)
    cb();
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

    for( var i=0; i < num; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
