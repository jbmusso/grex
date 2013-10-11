/*
 * Abstract Element class
 */
var Element = (function() {
    // Element are Vertex or Edge
    function Element() {
        console.log("Constructor Element");
        this._id = null;
    }


    Element.prototype.getProperties = function() {
        var o = {};

        for (var propertyName in this) {
            if (this.hasOwnProperty(property)) {
                o[propertyName] = this[propertyName];
            }
        }

        return o;
    };


    Element.prototype.setProperty = function (k, v) {
        this[k] = v;
        return this;
    };

    Element.prototype.setProperties = function (properties) {
        for (var key in properties) {
            // console.log(key, properties, "+++++++++++");
            this.setProperty(key, properties[key]);
        }
        return this;
    };

    /*
     * Titan specific method
     *
     * Use this instead of setProperty() when setting the value of an indexed
     * property.
     */
    Element.prototype.addProperty = function(k, v) {
        this[k] = v;
        return this;
    };

    /*
     * Titan specific method
     *
     * Use this instead of setProperties() when setting the values of indexed
     * properties.
     */
    Element.prototype.addProperties = function (properties) {
        for (var key in properties) {
            this.addProperty(key, properties[key]);
        }
        return this;
    };


    return Element;

})();



var Vertex = (function (){

    function Vertex() {
        console.log("Constructor Vertex");
        this._type = "vertex";
        Element.apply(this, arguments); // Call parent constructor
    }

    // Inherit from Element
    Vertex.prototype = new Element();
    Vertex.prototype.constructor = Vertex;

    return Vertex;

})();


var Edge = (function (){

    function Edge() {
        console.log("Constructor Edge");
        this._type = "edge";
        this._outV = null;
        this._inV = null;
        this._label = null;

        Element.apply(this, arguments); // Call parent constructor
    }

    // Inherit from Element
    Edge.prototype = new Element();
    Edge.prototype.constructor = Edge;

    return Edge;

})();


exports.Vertex = exports.vertex = Vertex;
exports.Edge = exports.edge = Edge;

exports.create = function(elementType) {
    return new exports[elementType]();
};

module.exports = exports;
