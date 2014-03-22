var _ = require("lodash");

var ArgumentList = require('./argumentlist');

module.exports = (function () {
  function ArgumentHandler(options) {
    this.options = options;
  }

  ArgumentHandler.prototype.buildString = function(args, retainArray) {
    var argList = new ArgumentList(args, this.options);
    argList.buildArguments(retainArray);

    return argList.toString();
  };

  return ArgumentHandler;
})();
