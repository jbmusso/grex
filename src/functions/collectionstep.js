var inherits = require('util').inherits;

var _ = require('lodash');

var GremlinStep = require('./step');

module.exports = (function() {
  function CollectionStep() {
    GremlinStep.apply(this, arguments);
  }

  inherits(CollectionStep, GremlinStep);

  CollectionStep.prototype.toString = function() {
    var str = '';
    var argumentList = [];
    var args = this.args.rawArgs;

    if (_.isArray(args[0])) {
      // Passing in an array of Pipeline with Gremlin script as arguments
      _.each(args[0], function(pipeline) {
        argumentList.push(pipeline.gremlin.script);
      });

      str += "." + this.name + "([" + argumentList.join(',') + "])";
    } else {
      str += "." + this.name + "('"+ this.args.rawArgs[0] + "')";
    }

    return str;
  };

  return CollectionStep;
})();