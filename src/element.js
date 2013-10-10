module.exports = Element = (function() {
    // Element are Vertex or Edge
    function Element(obj) {
        this._obj = obj;
    }

    Element.prototype.setProperty = function (k, v) {
        this._obj[k] = v;
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
        this._obj[k] = v;
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
