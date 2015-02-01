var mqtt    = require('mqtt')
  , yaml    = require('js-yaml')
  , fs      = require('fs')
  , _       = require('lodash')
  , config  = yaml.safeLoad(fs.readFileSync(__dirname + '/' + 'config.yml', 'utf8'))
  , map     = yaml.safeLoad(fs.readFileSync(__dirname + '/' + 'map.yml', 'utf-8'))
  ;
var client = mqtt.connect({ port: config.mqtt.port, host: config.mqtt.host, clean: true, encoding: 'binary', keepalive: 0 });

client.on('connect', function() {
  var self = this;
  var devicelist = require('./lib/registry')(client, config);
  var status     = require('./lib/status')(client, devicelist.devices, config);
  var settings   = require('./lib/settings')(client,devicelist.devices,map, config);
  var mapping    = require('./lib/mapping')(client,devicelist.devices,map, config);
  console.log('Connected to >>' + config.mqtt.host + ' on port >>' + config.mqtt.port);

});
console.log('-------------------------------------------------------------------------------');
