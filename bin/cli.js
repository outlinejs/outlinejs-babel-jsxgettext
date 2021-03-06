#!/usr/bin/env node

var path = require('path')
var meow = require('meow')
var parser = require('../')

var cli = meow({
  pkg: '../package.json',
  help: [
    'Options',
    '  --help                     Show this help',
    '  --version                  Current version of package',
    '  -i | --input               String - The path to soure JavaScript file',
    '  -o | --output              String - The path of the output PO file',
    '',
    'Usage',
    '  $ babel-jsxgettext <input> <output>',
    '',
    'Examples',
    '  $ babel-jsxgettext ./test/*.js test.po',

    ''
  ].join('\n')
})

var inputs = cli.input.slice(0, cli.input.length - 1)
var output = cli.flags.o || cli.flags.output || cli.input[cli.input.length - 1]
output = path.join(process.cwd(), output)

parser(inputs, output, function (err) {
  if (err) throw err
  console.log('Job completed!')
})
