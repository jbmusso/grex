var inherits = require('util').inherits;

var GremlinStep = require('./step');

module.exports = (function() {
  function SelectStep() {
    GremlinStep.call(this, 'select', arguments[0]);
  }

  inherits(SelectStep, GremlinStep);

  SelectStep.prototype.toGroovy = function() {
    this.args.buildArguments(true); // retain array square brackets []

    return '.select' + this.args.toGroovy();
  };

  return SelectStep;
})();