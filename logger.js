var mqtt    = require('mqtt')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  , mom     = require('moment')
  , config  = yaml.safeLoad(fs.readFileSync(__dirname + '/' + 'config.yml', 'utf8'))
  ;


var client = mqtt.connect({ port: config.mqtt.port, host: config.mqtt.host, clean: true, encoding: 'binary', keepalive: 0 });

client.on('connect', function() {
  var self = this;

  console.log('Connected to >>' + config.mqtt.host + ' on port >>' + config.mqtt.port);
  this.subscribe(config.topics.error);

  self.on('message', function (topic, message) {
    console.log('['+mom().format('hh:mm:ss')+'] ' +message);
  });

});
console.log('-------------------------------------------------------------------------------');
