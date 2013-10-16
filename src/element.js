Utils = require("./utils");

/*
 * Abstract Element class
 */
var Element = (function() {
    // Element are Vertex or Edge
    function Element() {
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
        this._type = "vertex";
        Element.apply(this, arguments); // Call parent constructor
    }

    // Inherit from Element
    Vertex.prototype = Object.create(Element.prototype);
    Vertex.prototype.constructor = Vertex;

    return Vertex;

})();


var Edge = (function (){

    function Edge() {
        this._type = "edge";

        Element.apply(this, arguments); // Call parent constructor
    }

    // Inherit from Element
    Edge.prototype = Object.create(Element.prototype);
    Edge.prototype.constructor = Edge;

    return Edge;

})();


exports.Vertex = exports.vertex = Vertex;
exports.Edge = exports.edge = Edge;

exports.build = function(elementType) {
    return new exports[elementType]();
};

module.exports = exports;
