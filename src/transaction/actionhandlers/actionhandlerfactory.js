var VertexActionHandler = require("./vertexactionhandler");
var EdgeActionHandler = require("./edgeactionhandler");


module.exports = (function() {
  function ActionHandlerFactory() {
  }

  ActionHandlerFactory.build = function(element, transaction) {
    var handlers = {
      vertex: VertexActionHandler,
      edge: EdgeActionHandler
    };


    var actionHandlerClass = handlers[element._type];
    var handler = new actionHandlerClass(element, transaction);

    return handler;
  };

  return ActionHandlerFactory;
})();
