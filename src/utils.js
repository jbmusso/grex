var _ = require("lodash");

var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt|decr|incr|notin|in)$|^Contains\.(IN|NOT_IN)$|^g\.|^Vertex(\.class)$|^Edge(\.class)$|^String(\.class)$|^Integer(\.class)$|^Geoshape(\.class)$|^Direction\.(OUT|IN|BOTH)$|^TitanKey(\.class)$|^TitanLabel(\.class)$/;
var closureRegex = /^\{.*\}$/;

module.exports = {
    isRegexId: function (id) {
        return !!this.options.idRegex && _.isString(id) && this.options.idRegex.test(id);
    },

    isGraphReference: function (val) {
        return _.isString(val) && graphRegex.test(val);
    },

    isClosure: function (val) {
        return _.isString(val) && closureRegex.test(val);
    }
};
