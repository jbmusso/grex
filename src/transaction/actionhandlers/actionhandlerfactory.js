var VertexActionHandler = require("./vertexactionhandler");
var EdgeActionHandler = require("./edgeactionhandler");


module.exports = (function() {
  function ActionHandlerFactory() {
  }

  ActionHandlerFactory.build = function(element, transaction, actionArgs) {
    var handlers = {
      vertex: VertexActionHandler,
      edge: EdgeActionHandler
    };

    var type = element._type;
    var handler = new handlers[type](element, transaction, actionArgs);

    return handler;
  };

  return ActionHandlerFactory;
})();