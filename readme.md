some messages:

map: show
shows the current loadded map

set: delmap|:sensorid|:actorid
removes the defined map

set: addmap|:sensorid|:actorid
adds the defined map

set: loadmap
reinitialises the map.yml file

set: randommap
creates random mappings for currently active devices

set: cleanmap
cleans up the map; removes doublicate routes

set: savemap
saves the current map to the map.yml

status: check
console.logs the current registered devices

status: statuscheck
is posted by postmaster after initstatuscheck. devices have to say hello to not get deleted

status: initstatuscheck
initiates a status check and removes all devices which failed to say hello (posts statuscheck)

status: rereg
all devices register themself again (called on postmaster startup)

status: show
console.logs the current status of all actors

health: stop
all devices unregister

health: stop:id
the device :id unregisters

reg: :deviceid|:productid
the device registers itself by posting its unique id and its productid to load the correct dll
