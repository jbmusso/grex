var GremlinFunction = require('./function');

module.exports = (function() {
  function IdxGremlinFunction() {
    GremlinFunction.call(this, 'idx', arguments[0]);
  }

  IdxGremlinFunction.prototype.toString = function() {
    var str = ".idx('" + this.args.rawArgs[0] + "')";
    var properties = this.args.rawArgs[1];

    if (properties) {
      var keys = [];

      for (var key in properties) {
        keys.push(key + ":'" + properties[key] + "'");
      }

      str += "[["+ keys.join(',') + "]]";
    }

    return str;
  };

  return IdxGremlinFunction;
})();