var ArgumentList = require('../arguments/argumentlist');

module.exports = (function() {
  function GremlinFunction(name, args) {
    this.name = name;
    this.args = new ArgumentList(args);
  }

  GremlinFunction.prototype.toString = function() {
    this.args.buildArguments();

    return this.name + '' + this.args.toString();
  };

  return GremlinFunction;
})();