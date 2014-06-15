/*jslint node: true */
'use strict';
var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinStep = require('./step');
var Argument = require('../../arguments/argument');

module.exports = (function() {
  function PipesStep() {
    GremlinStep.apply(this, arguments);
  }

  inherits(PipesStep, GremlinStep);

  PipesStep.prototype.toGroovy = function() {
    var str = '';
    var argumentList = [];
    var args = this.arguments;

    args = _.isArray(args[0]) ? args[0] : args;

    _.each(args, function(arg) {
      var argObj = new Argument(arg);
      var partialScript = (arg.toGroovy && arg.toGroovy()) || argObj.parse();
      argumentList.push(partialScript);
    }, this);

    str += '.'+ this.name + '('+ argumentList.join(',') +')';

    return str;
  };

  return PipesStep;
})();