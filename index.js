var fs = require('fs')
var path = require('path')
var gettextParser = require('gettext-parser')
var babylon = require('babylon')
var walk = require('acorn/dist/walk')

var functionNames = require('./lib/constant').DEFAULT_FUNCTION_NAMES
var objectPropertyNames = require('./lib/constant').DEFAULT_OBJECT_PROPERTY_NAMES
var DEFAULT_HEADERS = require('./lib/constant').DEFAULT_HEADERS
var BABEL_FEATURES = require('./lib/constant').BABEL_FEATURES
var jsxBase = require('./lib/base')

var features = BABEL_FEATURES.reduce(function (result, key) {
  result[key] = true
  return result
}, {})

/**
 * The parser function
 * @param  {String}   input  The path to soure JavaScript file
 * @param  {String}   output The path of the output PO file
 * @param  {Function} cb     The callback function
 */
function parser (inputs, output, cb) {
  var data = {
    charset: 'UTF-8',
    headers: DEFAULT_HEADERS,
    translations: {
      context: {}
    }
  }

  var defaultContext = data.translations.context

  var headers = data.headers
  headers['plural-forms'] = headers['plural-forms'] || DEFAULT_HEADERS['plural-forms']
  headers['content-type'] = headers['content-type'] || DEFAULT_HEADERS['content-type']

  var nplurals = /nplurals ?= ?(\d)/.exec(headers['plural-forms'])[1]

  Object.setPrototypeOf(jsxBase, walk.base)

  inputs
    .forEach(function (file) {
      var resolvedFilePath = path.join(process.cwd(), file)
      var src = fs.readFileSync(resolvedFilePath, 'utf8')
      var ast = babylon.parse(src, {
        allowHashBang: true,
        ecmaVersion: Infinity,
        sourceType: 'module',
        plugins: { jsx: true },
        features: features
      })

      walk.simple(ast.program, {
        ObjectExpression: function (node) {
          var context = defaultContext

          node.properties.forEach(function (property) {
            if (property.key.type === 'Literal') {
              // "cast" rawValue to a string
              var propertyValue = property.key.rawValue + ''

              objectPropertyNames.forEach(function (objectPropertyName) {
                // check if there are more occurrence of objectPropertyName and the
                // string is splittable by /
                var regex = new RegExp(objectPropertyName, 'g')

                if (((propertyValue.match(regex) || []).length) > 1 && (propertyValue.split('/').length > 1)) {
                  propertyValue.split(objectPropertyName).forEach(function (pathValue) {
                    if (pathValue === '') {
                      return
                    }

                    var translate = {}

                    var line = property.loc.start.line
                    var column = property.loc.start.column

                    translate['msgid'] = objectPropertyName + pathValue.replace(/\/$/, '')
                    translate['msgstr'] = pathValue.replace(/\/$/, '')
                    translate['comments'] = {
                      reference: file + ', line: ' + line + ', column: ' + column
                    }

                    context[translate.msgid] = translate
                  })
                } else if (propertyValue.indexOf(objectPropertyName) === 0) {
                  var translate = {}

                  var line = property.loc.start.line
                  var column = property.loc.start.column

                  translate['msgid'] = propertyValue
                  translate['msgstr'] = propertyValue.replace(objectPropertyName, '')
                  translate['comments'] = {
                    reference: file + ', line: ' + line + ', column: ' + column
                  }

                  context[translate.msgid] = translate
                }
              })
            }
          })
        },

        CallExpression: function (node) {
          if (functionNames.hasOwnProperty(node.callee.name) ||
            node.callee.property && functionNames.hasOwnProperty(node.callee.property.name)) {
            var functionName = functionNames[node.callee.name] || functionNames[node.callee.property.name]
            var translate = {}

            var args = node.arguments
            for (var i = 0, l = args.length; i < l; i++) {
              var name = functionName[i]

              if (name && name !== 'count' && name !== 'domain') {
                var arg = args[i]
                var value = arg.value

                if (value) {
                  var line = node.loc.start.line
                  var column = node.loc.start.column

                  translate[name] = value
                  translate['comments'] = {
                    reference: file + ', line: ' + line + ', column: ' + column
                  }
                }

                if (name === 'msgid_plural') {
                  translate.msgstr = []
                  for (var p = 0; p < nplurals; p++) {
                    translate.msgstr[p] = ''
                  }
                }
              }
            }

            var context = defaultContext
            var msgctxt = translate.msgctxt

            if (msgctxt) {
              data.translations[msgctxt] = data.translations[msgctxt] || {}
              context = data.translations[msgctxt]
            }

            context[translate.msgid] = translate
          }
        }
      }, jsxBase)
    })

  fs.writeFile(output, gettextParser.po.compile(data), function (err) {
    if (err) {
      cb(err)
    }
    cb(null)
  })
}

module.exports = parser
