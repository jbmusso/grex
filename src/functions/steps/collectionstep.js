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
    var firstArg = args[0];

    if (_.isArray(firstArg)) {
      // Handle .method([g.v(1), g.v(2)]) signature
      var pipelines = _.map(firstArg, function(a) { return a.toGroovy(); }).join(',');
      str = this.name + "([" + pipelines + "])";
    } else {
      str = this.name + "('"+ this.arguments[0] + "')";
    }

    return str;
  };

  return CollectionStep;
})();