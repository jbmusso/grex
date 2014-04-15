var inherits = require('util').inherits;

var GremlinFunction = require('./function');

module.exports = (function() {
  function GremlinStep(name, args) {
    GremlinFunction.apply(this, arguments);
  }

  inherits(GremlinStep, GremlinFunction);

  return GremlinStep;
})();