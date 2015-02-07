# Bitty(1)

## Installation
```npm install bitty -g```
```npm install browserify -g```

## Synopsis
```bitty [OPTION]... FILE...```

## Description
Local development server that serves all files in the working directory,
with the exception of index.js which will be automatically generated and bundled by browserify.

The server will also watch a directory or file, and emit server side events when those files change.

## Options
`-C, --directory` Change the working directory
`-W, --watch` Watch pattern
