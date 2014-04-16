var _ = require("lodash");

var ArgumentList = require('./argumentlist');

module.exports = (function () {
  function ArgumentHandler() {
  }

  ArgumentHandler.prototype.buildString = function(args, retainArray) {
    var argList = new ArgumentList(args);
    argList.buildArguments(retainArray);

    return argList.toGroovy();
  };

  return ArgumentHandler;
})();
