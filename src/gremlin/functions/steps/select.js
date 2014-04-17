var inherits = require('util').inherits;

var GremlinStep = require('./step');

module.exports = (function() {
  function SelectStep() {
    GremlinStep.call(this, 'select', arguments[0]);
  }

  inherits(SelectStep, GremlinStep);

  SelectStep.prototype.toGroovy = function() {
    return '.select' + this.args.toGroovy().replace(/\"/g, '\'');
  };

  return SelectStep;
})();