var ArgumentList = require('../arguments/argumentlist');

module.exports = (function() {
  function GremlinFunction(name, args) {
    this.name = name;
    this.args = new ArgumentList(args);
    this.args.buildArguments();
  }

  GremlinFunction.prototype.toGroovy = function() {
    return this.name + this.args.toGroovy();
  };

  return GremlinFunction;
})();