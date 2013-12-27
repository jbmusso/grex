var request = require("request");
var q = require("q");
var _ = require("lodash");


var Argument = require("./argument");

function CommandBuilder() {
}

CommandBuilder.queryMain = function(methodName, reset) {
    return function() {
        var gremlin = reset ? new Gremlin(this) : this,
            args,
            appendArg = '';

        //cater for select array parameters
        if(methodName == 'select'){
            gremlin.appendScript('.' + methodName + Argument.build.call(this, arguments, true));
        } else {
            args = _.isArray(arguments[0]) ? arguments[0] : arguments;

            //cater for idx param 2
            if (methodName == 'idx' && args.length > 1) {
                _.each(args[1], function(v, k) {
                    appendArg = k + ":";
                    appendArg += Argument.parse.call(this, args[1][k]);
                }, this);

                appendArg = "[["+ appendArg + "]]";
                args.length = 1;
            }

            gremlin.appendScript('.' + methodName + Argument.build.call(this, args));
        }

        gremlin.appendScript(appendArg);

        return gremlin;
    };
};

module.exports = CommandBuilder;


// [i] => index & [1..2] => range
// Do not pass in method name, just string range
CommandBuilder.queryIndex = function() {
    return function(range) {
        this.appendScript('['+ range.toString() + ']');

        return this;
    };
};


// and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
CommandBuilder.queryPipes = function(methodName) {
    return function() {
        var args = _.isArray(arguments[0]) ? arguments[0] : arguments;

        this.appendScript("." + methodName + "(");

        _.each(args, function(arg) {
            this.appendScript(arg.script || Argument.parse.call(this, arg));
            this.appendScript(",");
        }, this);

        this.script = this.script.slice(0, -1); // Remove trailing comma
        this.appendScript(")");

        return this;
    };
};

//retain & except => g.V().retain([g.v(1), g.v(2), g.v(3)])
CommandBuilder.queryCollection = function(methodName) {
    return function() {
        var param = '';

        if(_.isArray(arguments[0])){
            _.each(arguments[0], function(arg) {
                param += arg.script;
                param += ",";
            });

            this.appendScript("." + methodName + "([" + param + "])");
        } else {
            this.appendScript("." + methodName + Argument.build.call(this, arguments[0]));
        }

        return this;
    };
};


var Gremlin = (function () {
    function Gremlin(gRex) {
        this.gRex = gRex;
        this.options = gRex.options;
        this.script = 'g';
        this.resultFormatter = gRex.resultFormatter;
    }

    Gremlin.prototype.get = function(callback) {
        return this.getData().then().nodeify(callback);
    };

    Gremlin.prototype.getData = function() {
        var deferred = q.defer();

        var uri = '/graphs/' + this.options.graph + '/tp/gremlin?script=' + encodeURIComponent(this.script) + '&rexster.showTypes=true';
        var url = 'http://' + this.options.host + ':' + this.options.port + uri;

        var options = {
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        request.get(options, function(err, res, body) {
            if (err) {
                return deferred.reject(err);
            }

            var results = this.transformResults(JSON.parse(body).results);

            return deferred.resolve(results);
        }.bind(this));

        return deferred.promise;
    };


    Gremlin.prototype.transformResults = function(results) {
        return this.resultFormatter.formatResults(results);
    };

    Gremlin.prototype.appendScript = function(script) {
        this.script += script;
    };

    Gremlin.prototype.execMainCommand = function(methodName, args) {
        CommandBuilder.queryMain(methodName).apply(this, args);
        return this;
    };

    /*** Transform ***/
    Gremlin.prototype._ = function() {
        return this.execMainCommand('_', arguments);
    };

    Gremlin.prototype.both = function() {
        return this.execMainCommand('both', arguments);
    };

    Gremlin.prototype.bothE = function() {
        return this.execMainCommand('bothE', arguments);
    };

    Gremlin.prototype.bothV = function() {
        return this.execMainCommand('bothV', arguments);
    };

    Gremlin.prototype.cap = function() {
        return this.execMainCommand('cap', arguments);
    };

    Gremlin.prototype.gather = function() {
        return this.execMainCommand('gather', arguments);
    };

    Gremlin.prototype.id = function() {
        return this.execMainCommand('id', arguments);
    };

    Gremlin.prototype.in = function() {
        return this.execMainCommand('in', arguments);
    };

    Gremlin.prototype.inE = function() {
        return this.execMainCommand('inE', arguments);
    };

    Gremlin.prototype.inV = function() {
        return this.execMainCommand('inV', arguments);
    };

    Gremlin.prototype.property = function() {
        return this.execMainCommand('property', arguments);
    };

    Gremlin.prototype.label = function() {
        return this.execMainCommand('label', arguments);
    };

    Gremlin.prototype.map = function() {
        return this.execMainCommand('map', arguments);
    };

    Gremlin.prototype.memoize = function() {
        return this.execMainCommand('memoize', arguments);
    };

    Gremlin.prototype.order = function() {
        return this.execMainCommand('order', arguments);
    };

    Gremlin.prototype.out = function() {
        return this.execMainCommand('out', arguments);
    };

    Gremlin.prototype.outE = function() {
        return this.execMainCommand('outE', arguments);
    };

    Gremlin.prototype.outV = function() {
        return this.execMainCommand('outV', arguments);
    };

    Gremlin.prototype.path = function() {
        return this.execMainCommand('path', arguments);
    };

    Gremlin.prototype.scatter = function() {
        return this.execMainCommand('scatter', arguments);
    };

    Gremlin.prototype.select = function() {
        return this.execMainCommand('select', arguments);
    };

    Gremlin.prototype.transform = function() {
        return this.execMainCommand('transform', arguments);
    };

    Gremlin.prototype.orderMap = function() {
        return this.execMainCommand('orderMap', arguments);
    };


    /*** Filter ***/
    // index(i)
    Gremlin.prototype.index = CommandBuilder.queryIndex();
    // range('[i..j]')
    Gremlin.prototype.range = CommandBuilder.queryIndex();

    Gremlin.prototype.and = CommandBuilder.queryPipes('and');

    Gremlin.prototype.back = function() {
        return this.execMainCommand('back', arguments);
    };

    Gremlin.prototype.dedup = function() {
        return this.execMainCommand('dedup', arguments);
    };

    Gremlin.prototype.except = CommandBuilder.queryCollection('except');

    Gremlin.prototype.filter = function() {
        return this.execMainCommand('filter', arguments);
    };

    Gremlin.prototype.has = function() {
        return this.execMainCommand('has', arguments);
    };

    Gremlin.prototype.hasNot = function() {
        return this.execMainCommand('hasNot', arguments);
    };

    Gremlin.prototype.interval = function() {
        return this.execMainCommand('interval', arguments);
    };

    Gremlin.prototype.or = CommandBuilder.queryPipes('or');

    Gremlin.prototype.random = function() {
        return this.execMainCommand('random', arguments);
    };

    Gremlin.prototype.retain = CommandBuilder.queryCollection('retain');

    Gremlin.prototype.simplePath = function() {
        return this.execMainCommand('simplePath', arguments);
    };

    /*** Side Effect ***/
    // Gremlin.prototype.aggregate // Not implemented
    Gremlin.prototype.as = function() {
        return this.execMainCommand('as', arguments);
    };

    Gremlin.prototype.groupBy = function() {
        return this.execMainCommand('groupBy', arguments);
    };

    // Not FullyImplemented ??
    Gremlin.prototype.groupCount = function() {
        return this.execMainCommand('groupCount', arguments);
    };

    Gremlin.prototype.optional = function() {
        return this.execMainCommand('optional', arguments);
    };

    Gremlin.prototype.sideEffect = function() {
        return this.execMainCommand('sideEffect', arguments);
    };

    Gremlin.prototype.linkBoth = function() {
        return this.execMainCommand('linkBoth', arguments);
    };

    Gremlin.prototype.linkIn = function() {
        return this.execMainCommand('linkIn', arguments);
    };

    Gremlin.prototype.linkOut = function() {
        return this.execMainCommand('linkOut', arguments);
    };

    // Gremlin.prototype.store // Not implemented
    // Gremlin.prototype.table // Not implemented
    // Gremlin.prototype.tree // Not implemented

    /*** Branch ***/
    Gremlin.prototype.copySplit = CommandBuilder.queryPipes('copySplit');
    Gremlin.prototype.exhaustMerge = function() {
        return this.execMainCommand('exhaustMerge', arguments);
    };

    Gremlin.prototype.fairMerge = function() {
        return this.execMainCommand('fairMerge', arguments);
    };

    //g.v(1).out()ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
    Gremlin.prototype.ifThenElse = function() {
        return this.execMainCommand('ifThenElse', arguments);
    };

    Gremlin.prototype.loop = function() {
        return this.execMainCommand('loop', arguments);
    };

    /*** Methods ***/
    // Gremlin.prototype.fill // Not implemented
    Gremlin.prototype.count = function() {
        return this.execMainCommand('count', arguments);
    };

    Gremlin.prototype.iterate = function() {
        return this.execMainCommand('iterate', arguments);
    };

    Gremlin.prototype.next = function() {
        return this.execMainCommand('next', arguments);
    };

    Gremlin.prototype.toList = function() {
        return this.execMainCommand('toList', arguments);
    };

    Gremlin.prototype.keys = function() {
        return this.execMainCommand('keys', arguments);
    };

    Gremlin.prototype.remove = function() {
        return this.execMainCommand('remove', arguments);
    };

    Gremlin.prototype.values = function() {
        return this.execMainCommand('values', arguments);
    };

    Gremlin.prototype.put = CommandBuilder.queryPipes('put');

    Gremlin.prototype.getPropertyKeys = function() {
        return this.execMainCommand('getPropertyKeys', arguments);
    };

    Gremlin.prototype.setProperty = function() {
        return this.execMainCommand('setProperty', arguments);
    };

    Gremlin.prototype.getProperty = function() {
        return this.execMainCommand('getProperty', arguments);
    };

    // Titan specifics
    Gremlin.prototype.name = function() {
        return this.execMainCommand('name', arguments);
    };

    Gremlin.prototype.dataType = function() {
        return this.execMainCommand('dataType', arguments);
    };

    Gremlin.prototype.indexed = function() {
        return this.execMainCommand('indexed', arguments);
    };

    Gremlin.prototype.unique = function() {
        return this.execMainCommand('unique', arguments);
    };

    Gremlin.prototype.makePropertyKey = function() {
        return this.execMainCommand('makePropertyKey', arguments);
    };

    Gremlin.prototype.group = function() {
        return this.execMainCommand('group', arguments);
    };

    Gremlin.prototype.makeEdgeLabel = function() {
        return this.execMainCommand('makeEdgeLabel', arguments);
    };

    Gremlin.prototype.query = function() {
        return this.execMainCommand('query', arguments);
    };

    // Titan v0.4.0 specifics
    Gremlin.prototype.single = function() {
        return this.execMainCommand('single', arguments);
    };

    Gremlin.prototype.list = function() {
        return this.execMainCommand('list', arguments);
    };

    // replaces unique(Direction.IN)
    Gremlin.prototype.oneToMany = function() {
        return this.execMainCommand('oneToMany', arguments);
    };

    // replaces unique(Direction.OUT)
    Gremlin.prototype.manyToOne = function() {
        return this.execMainCommand('manyToOne', arguments);
    };

    // replaces unique(Direction.IN).unique(Direction.OUT)
    Gremlin.prototype.oneToOne = function() {
        return this.execMainCommand('oneToOne', arguments);
    };

    Gremlin.prototype.makeKey = function() {
        return this.execMainCommand('makeKey', arguments);
    };

    Gremlin.prototype.makeLabel = function() {
        return this.execMainCommand('makeLabel', arguments);
    };

    Gremlin.prototype.make = function() {
        return this.execMainCommand('make', arguments);
    };

    Gremlin.prototype.sortKey = function() {
        return this.execMainCommand('sortKey', arguments);
    };

    Gremlin.prototype.signature = function() {
        return this.execMainCommand('signature', arguments);
    };

    Gremlin.prototype.unidirected = function() {
        return this.execMainCommand('unidirected', arguments);
    };

    Gremlin.prototype.createKeyIndex = function() {
        return this.execMainCommand('createKeyIndex', arguments);
    };

    Gremlin.prototype.getIndexes = function() {
        return this.execMainCommand('getIndexes', arguments);
    };

    Gremlin.prototype.hasIndex = function() {
        return this.execMainCommand('hasIndex', arguments);
    };

    return Gremlin;

})();
