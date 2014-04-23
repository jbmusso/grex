var ArgumentList = require('../arguments/argumentlist');

module.exports = (function() {
  function GremlinFunction(name, args) {
    this.name = name;
    this.arguments = new ArgumentList(args);
    this.arguments.buildArguments();
  }

  GremlinFunction.prototype.toGroovy = function() {
    return this.name + this.groovifyArguments();
  };

  GremlinFunction.prototype.groovifyArguments = function() {
    var closures = this.arguments.closures.join(',');

    return '(' + this.arguments.parenthesizedArguments.join(',') + ')' + closures;

  };

  return GremlinFunction;
})();