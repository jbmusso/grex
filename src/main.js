var classes = require("./classes");
var gRex = require("./grex");

var grex = function(options, callback){
    try {
        if(typeof options === 'function'){
            callback = options;
            options = undefined;
        }
        var db = new gRex(options);
        connect = db.connect().then().nodeify(callback);
    } catch(error) {
        console.error(error);
        return callback(error);
    }

    return connect;
};

module.exports = {
    "connect": grex,
    "T": classes.T,
    "Contains": classes.Contains,
    "Vertex": classes.Vertex,
    "Edge": classes.Edge,
    "String": classes.String,
    "Direction": classes.Direction,
    "Geoshape": classes.Geoshape,
    "TitanKey": classes.TitanKey,
    "TitanLabel": classes.TitanLabel
};
