# Bitty(1)

## Installation
```
npm install -g bitty
npm install -g browserify
```

## Synopsis
```bitty [OPTION]... FILE...```

## Description
Local development server that serves all files in the working directory,
with the exception of index.js which will be automatically generated and bundled by browserify.

The server will also watch a directory or file, and emit server side events when those files change.

## Options

<dl>
  <dt>-C, --directory</dt>
  <dd>Change the working directory</dd>

  <dt>-W, --watch</dt>
  <dd>Watch pattern</dd>
</dl>
