#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var child = require('child_process');
var util = require('util');
var path = require('path');
var chokidar = require('chokidar');

function file(req, res) {
  var filepath = path.join(process.cwd(), req.url);

  fs.exists(filepath, function(exists) {
    if (exists) {
      fs.readFile(filepath, function(error, buffer) {
        if (error) {
          res.writeHead(500);
          res.write('500');
          res.end();
        }

        res.writeHead(200);
        res.write(buffer);
        res.end();
      });
    } else {
      res.writeHead(404);
      res.write('404');
      res.end();
    }
  });
}

function bundle(req, res) {
  res.setHeader('content-type', 'text/javascript');

  var argv = process.argv.slice(2);
  var cmd = util.format('browserify', argv.join(' '));
  var bundler = child.exec(cmd, function(error, stdout, stderr) {
    if (error) {
      res.write(error.toString());
    }

    res.end(stdout);
  });
}

function index(req, res) {
  fs.exists('index.html', function(exists) {
    if (exists) {
      return file(req, res);
    } else {
      res.setHeader('content-type', 'text/html');
      res.end('<!doctype html><head><meta charset="utf-8"></head><body><script src="index.js"></script></body></html>');
    }
  });
}

function watch(req, res) {
	req.setTimeout(Infinity);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('\n');
  var listener = function(event, filename) {
    // Skip dot files
    if (filename[0] == '.') {
      return;
    }

    // Assume the bundle has changed when any javascript file changes.
    if (path.extname(filename) == '.js') {
      filename = 'index.js';
    }

    res.write('data: ' + filename + '\n\n');
  };

  watcher.on('change', listener);
  res.on('close', function() {
    watcher.removeListener('change', listener);
  });
}

var watcher = chokidar.watch('.');

watcher.on('change', function(event, filename) {
  console.log(event, filename);
});

var server = http.createServer();
server.on('request', function(req, res) {
  switch (req.url) {
    case '/watch':
      return watch(req, res);

    case '/index.js':
      return bundle(req, res);

    case '/':
      return index(req, res);

    default:
      return file(req, res);
  }
});

server.listen(3000, function () {
  var address = server.address();
  console.log('serving on port %d', address.port);
});
