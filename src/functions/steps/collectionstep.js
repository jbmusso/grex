var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinStep = require('./step');

module.exports = (function() {
  function CollectionStep() {
    GremlinStep.apply(this, arguments);
  }

  inherits(CollectionStep, GremlinStep);

  CollectionStep.prototype.toGroovy = function() {
    var str = '';
    var argumentList = [];
    var args = this.arguments;
    var firstArgument = args[0];

    if (_.isArray(firstArgument)) {
      // Handle .method([g.v(1), g.v(2)]) signature
      str = "." + this.name + "([" + firstArgument[0].gremlin.script.replace(/(?!^)g/g, ',g') + "])";
    } else {
      str = "." + this.name + "('"+ this.arguments[0] + "')";
    }

    return str;
  };

  return CollectionStep;
})();