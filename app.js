var mapnik = require('mapnik');
var mercator = require('./sphericalmercator');
var url = require('url');
var fs = require('fs');
var http = require('http');
var parseXYZ = require('./tile.js').parseXYZ;
var path = require('path');
var port = 8000; // this will define the port at which the map tiles appear.. ie http://localhost:8000
var TMS_SCHEME = false;

mapnik.register_default_input_plugins();
mapnik.register_default_fonts();

http.createServer(function(req, res) {
  parseXYZ(req, TMS_SCHEME, function(err,params) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end(err.message);
    } else {
      try {
        var map = new mapnik.Map(256, 256, mercator.proj4);
        var bbox = mercator.xyz_to_envelope(parseInt(params.x),
                                               parseInt(params.y),
                                               parseInt(params.z), false); // coordinates provided by the sphericalmercator.js script
		    console.log(params.x, params.y,params.z);
        map.bufferSize = 0; // how much edging is provided for each tile rendered
        map.load('tile_symbols.xml', function(err,map) {
            if (err) throw err;
            map.extent = bbox;
            var im = new mapnik.Image(map.width, map.height);
            map.render(im, function(err, im) {
              if (err) {
                throw err;
              } else {
                // debug code
                // im.encode('png', function(err, buffer) {
                //   if (err) throw err;
                //   fs.writeFile('map.png',buffer, function(err) {
                //     if (err) throw err;
                //     console.log('save map image to map.png');
                //   });
                // });
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(im.encodeSync('png'));
              }
            });	
        });
      }
      catch (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.message);
      }
    }
  });
}).listen(port);

console.log('Server running on port %d', port);