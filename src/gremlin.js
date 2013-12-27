var request = require("request");
var q = require("q");
var _ = require("lodash");


var Argument = require("./argument");

function CommandBuilder() {
}

CommandBuilder.queryMain = function(methodName, reset) {
    return function(){
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

    /*** Transform ***/
    Gremlin.prototype._ = CommandBuilder.queryMain('_');
    Gremlin.prototype.both = CommandBuilder.queryMain('both');
    Gremlin.prototype.bothE = CommandBuilder.queryMain('bothE');
    Gremlin.prototype.bothV = CommandBuilder.queryMain('bothV');
    Gremlin.prototype.cap = CommandBuilder.queryMain('cap');
    Gremlin.prototype.gather = CommandBuilder.queryMain('gather');
    Gremlin.prototype.id = CommandBuilder.queryMain('id');
    Gremlin.prototype.in = CommandBuilder.queryMain('in');
    Gremlin.prototype.inE = CommandBuilder.queryMain('inE');
    Gremlin.prototype.inV = CommandBuilder.queryMain('inV');
    Gremlin.prototype.property = CommandBuilder.queryMain('property');
    Gremlin.prototype.label = CommandBuilder.queryMain('label');
    Gremlin.prototype.map = CommandBuilder.queryMain('map');
    Gremlin.prototype.memoize = CommandBuilder.queryMain('memoize');
    Gremlin.prototype.order = CommandBuilder.queryMain('order');
    Gremlin.prototype.out = CommandBuilder.queryMain('out');
    Gremlin.prototype.outE = CommandBuilder.queryMain('outE');
    Gremlin.prototype.outV = CommandBuilder.queryMain('outV');
    Gremlin.prototype.path = CommandBuilder.queryMain('path');
    Gremlin.prototype.scatter = CommandBuilder.queryMain('scatter');
    Gremlin.prototype.select = CommandBuilder.queryMain('select');
    Gremlin.prototype.transform = CommandBuilder.queryMain('transform');
    Gremlin.prototype.orderMap = CommandBuilder.queryMain('orderMap');

    /*** Filter ***/
    // index(i)
    Gremlin.prototype.index = CommandBuilder.queryIndex();
    // range('[i..j]')
    Gremlin.prototype.range = CommandBuilder.queryIndex();

    Gremlin.prototype.and = CommandBuilder.queryPipes('and');
    Gremlin.prototype.back = CommandBuilder.queryMain('back');
    Gremlin.prototype.dedup = CommandBuilder.queryMain('dedup');
    Gremlin.prototype.except = CommandBuilder.queryCollection('except');
    Gremlin.prototype.filter = CommandBuilder.queryMain('filter');
    Gremlin.prototype.has = CommandBuilder.queryMain('has');
    Gremlin.prototype.hasNot = CommandBuilder.queryMain('hasNot');
    Gremlin.prototype.interval = CommandBuilder.queryMain('interval');
    Gremlin.prototype.or = CommandBuilder.queryPipes('or');
    Gremlin.prototype.random = CommandBuilder.queryMain('random');
    Gremlin.prototype.retain = CommandBuilder.queryCollection('retain');
    Gremlin.prototype.simplePath = CommandBuilder.queryMain('simplePath');

    /*** Side Effect ***/
    // Gremlin.prototype.aggregate // Not implemented
    Gremlin.prototype.as = CommandBuilder.queryMain('as');
    Gremlin.prototype.groupBy = CommandBuilder.queryMain('groupBy');

    // Not FullyImplemented ??
    Gremlin.prototype.groupCount = CommandBuilder.queryMain('groupCount');
    Gremlin.prototype.optional = CommandBuilder.queryMain('optional');
    Gremlin.prototype.sideEffect = CommandBuilder.queryMain('sideEffect');

    Gremlin.prototype.linkBoth = CommandBuilder.queryMain('linkBoth');
    Gremlin.prototype.linkIn = CommandBuilder.queryMain('linkIn');
    Gremlin.prototype.linkOut = CommandBuilder.queryMain('linkOut');

    // Gremlin.prototype.store // Not implemented
    // Gremlin.prototype.table // Not implemented
    // Gremlin.prototype.tree // Not implemented

    /*** Branch ***/
    Gremlin.prototype.copySplit = CommandBuilder.queryPipes('copySplit');
    Gremlin.prototype.exhaustMerge = CommandBuilder.queryMain('exhaustMerge');
    Gremlin.prototype.fairMerge = CommandBuilder.queryMain('fairMerge');

    //g.v(1).out()ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
    Gremlin.prototype.ifThenElse = CommandBuilder.queryMain('ifThenElse');

    Gremlin.prototype.loop = CommandBuilder.queryMain('loop');

    /*** Methods ***/
    // Gremlin.prototype.fill // Not implemented
    Gremlin.prototype.count = CommandBuilder.queryMain('count');
    Gremlin.prototype.iterate = CommandBuilder.queryMain('iterate');
    Gremlin.prototype.next = CommandBuilder.queryMain('next');
    Gremlin.prototype.toList = CommandBuilder.queryMain('toList');
    Gremlin.prototype.keys = CommandBuilder.queryMain('keys');
    Gremlin.prototype.remove = CommandBuilder.queryMain('remove');
    Gremlin.prototype.values = CommandBuilder.queryMain('values');
    Gremlin.prototype.put = CommandBuilder.queryPipes('put');

    Gremlin.prototype.getPropertyKeys = CommandBuilder.queryMain('getPropertyKeys');
    Gremlin.prototype.setProperty = CommandBuilder.queryMain('setProperty');
    Gremlin.prototype.getProperty = CommandBuilder.queryMain('getProperty');

    // Titan specifics
    Gremlin.prototype.name = CommandBuilder.queryMain('name');
    Gremlin.prototype.dataType = CommandBuilder.queryMain('dataType');
    Gremlin.prototype.indexed = CommandBuilder.queryMain('indexed');
    Gremlin.prototype.unique = CommandBuilder.queryMain('unique');
    Gremlin.prototype.makePropertyKey = CommandBuilder.queryMain('makePropertyKey');
    Gremlin.prototype.group = CommandBuilder.queryMain('group');
    Gremlin.prototype.makeEdgeLabel = CommandBuilder.queryMain('makeEdgeLabel');
    Gremlin.prototype.query = CommandBuilder.queryMain('query');

    // Titan v0.4.0 specifics
    Gremlin.prototype.single = CommandBuilder.queryMain('single');
    Gremlin.prototype.list = CommandBuilder.queryMain('list');

    // replaces unique(Direction.IN)
    Gremlin.prototype.oneToMany = CommandBuilder.queryMain('oneToMany');
    // replaces unique(Direction.OUT)
    Gremlin.prototype.manyToOne = CommandBuilder.queryMain('manyToOne');
    // replaces unique(Direction.IN).unique(Direction.OUT)
    Gremlin.prototype.oneToOne = CommandBuilder.queryMain('oneToOne');

    Gremlin.prototype.makeKey = CommandBuilder.queryMain('makeKey');
    Gremlin.prototype.makeLabel = CommandBuilder.queryMain('makeLabel');
    Gremlin.prototype.make = CommandBuilder.queryMain('make');
    Gremlin.prototype.sortKey = CommandBuilder.queryMain('sortKey');
    Gremlin.prototype.signature = CommandBuilder.queryMain('signature');
    Gremlin.prototype.unidirected = CommandBuilder.queryMain('unidirected');

    Gremlin.prototype.createKeyIndex = CommandBuilder.queryMain('createKeyIndex');
    Gremlin.prototype.getIndexes = CommandBuilder.queryMain('getIndexes');
    Gremlin.prototype.hasIndex = CommandBuilder.queryMain('hasIndex');

    return Gremlin;
})();
