module.exports = Element = (function() {
    // Element are Vertex or Edge
    function Element(obj) {
        this._obj = obj;
    }

    Element.prototype.addProperty = function(k, v) {
        this._obj[k] = v;
        return this;
    };

    Element.prototype.setProperty = function (k, v) {
        this._obj[k] = v;
        return this;
    };

    return Element;

})();
