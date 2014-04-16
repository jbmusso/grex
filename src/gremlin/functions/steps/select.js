var inherits = require('util').inherits;

var GremlinStep = require('./step');

module.exports = (function() {
  function SelectStep() {
    GremlinStep.call(this, 'select', arguments[0]);
  }

  inherits(SelectStep, GremlinStep);

  SelectStep.prototype.toGroovy = function() {
    return '.select' + this.stringifyArguments(true);
  };

  SelectStep.prototype.stringifyArguments = function(retainArray) {
    this.args.buildArguments(retainArray);

    return this.args.toGroovy();
  };

  return SelectStep;
})();