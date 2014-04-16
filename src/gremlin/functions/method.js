var inherits = require('util').inherits;

var GremlinFunction = require('./function');

module.exports = (function() {
  function GremlinMethod() {
    GremlinFunction.apply(this, arguments);
  }

  GremlinMethod.prototype.toGroovy = function() {
    this.args.buildArguments();

    return '.' + this.name + this.args.toGroovy();
  };

  return GremlinMethod;
})();