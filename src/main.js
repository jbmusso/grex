var classes = require("./classes");
var gRex = require("./grex");

var grex = function(options){
    try {
        var db = new gRex(options);
        connect = db.connect();
    } catch(error) {
        console.error(error);
    }

    return connect;
};

module.exports = {
    "connect": grex,
    "T": classes.T,
    "Contains": classes.Contains,
    "Vertex": classes.Vertex,
    "Edge": classes.Edge,
    "String": classes["String"],
    "Direction": classes.Direction,
    "Geoshape": classes.Geoshape
};
