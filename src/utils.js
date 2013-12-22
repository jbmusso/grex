var _ = require("underscore");

var graphRegex = /^T\.(gt|gte|eq|neq|lte|lt|decr|incr|notin|in)$|^Contains\.(IN|NOT_IN)$|^g\.|^Vertex(\.class)$|^Edge(\.class)$|^String(\.class)$|^Integer(\.class)$|^Geoshape(\.class)$|^Direction\.(OUT|IN|BOTH)$|^TitanKey(\.class)$|^TitanLabel(\.class)$/;
var closureRegex = /^\{.*\}$/;

module.exports = {
    //obj1 over writes obj2
    merge: function (obj1, obj2) {
        for(var p in obj2) {
            try  {
                if(obj1.hasOwnProperty(p)) {
                    obj1[p] = merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }

        return obj1;
    },

    isRegexId: function (id) {
        return !!this.OPTS.idRegex && _.isString(id) && this.OPTS.idRegex.test(id);
    },

    isGraphReference: function (val) {
        return _.isString(val) && graphRegex.test(val);
    },

    isClosure: function (val) {
        return _.isString(val) && closureRegex.test(val);
    }
};
