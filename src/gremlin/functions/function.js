var ArgumentList = require('../arguments/argumentlist');

module.exports = (function() {
  function GremlinFunction(name, args) {
    this.name = name;
    this.args = new ArgumentList(args);
    this.args.buildArguments();
  }

  GremlinFunction.prototype.toGroovy = function() {
    return this.name + this.groovifyArguments();
  };

  GremlinFunction.prototype.groovifyArguments = function() {
    var closures = this.args.closures.join(',');

    return '(' + this.args.parenthesizedArguments.join(',') + ')' + closures;

  };

  return GremlinFunction;
})();