#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var child = require('child_process');
var util = require('util');
var path = require('path');
var chokidar = require('chokidar');
var program = require('commander');

program.usage('[options] <entries> -- [bundler options]');
program.option('-C, --directory <path>', 'change the working directory', process.cwd());
program.option('-W, --watch <glob>', 'specify the file watcher glob pattern', '*/**');
program.option('-b, --bundler <cmd>', 'specify the bundle command', 'browserify');
program.option('-p, --port <port>', 'specify the http port', 4000);
program.option('-h, --host <host>', 'specify the http hostname', undefined);

var pkg = require('./package.json');
program.version(pkg.version);

var sub = process.argv.indexOf('--');
if (index > -1) {
  program.parse(process.argv.slice(0, sub));
  program.bundler.concat(process.argv.slice(sub + 1));
} else {
  program.parse(process.argv);
}

program.bundler = program.bundler.concat(' ', program.args.join(' '));

function file(req, res) {
  var filepath = path.join(program.directory, req.url);

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
  console.log(program.bundler);

  var bundler = child.exec(program.bundler, function(error, stdout, stderr) {
    if (error) {
      res.write(error.toString());
    }

    if (stderr) {
      console.error(stderr);
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
  var listener = function(filename) {
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

var watcher = chokidar.watch(program.watch);

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

server.listen(program.port, program.host, function () {
  var address = server.address();
  console.log('serving on http://%s:%d', address.address, address.port);
});
