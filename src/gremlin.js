var q = require("q");
var _ = require("lodash");


var Argument = require("./argument");

function CommandBuilder(context) {
    this.context = context;
}

CommandBuilder.prototype.queryMain = function(methodName, reset) {
    return function() {
        var pipeline;
        var appendArg = '';

        if (reset) {
            pipeline = new Pipeline(this.context);
        } else {
            pipeline = this.context;
        }

        //cater for select array parameters
        if(methodName == 'select'){
            pipeline.appendScript('.' + methodName + Argument.build.call(this.context, arguments, true));
        } else {
            var args = _.isArray(arguments[0]) ? arguments[0] : arguments;

            //cater for idx param 2
            if (methodName == 'idx' && args.length > 1) {
                _.each(args[1], function(v, k) {
                    appendArg = k + ":";
                    appendArg += Argument.parse.call(this.context, args[1][k]);
                }, this);

                appendArg = "[["+ appendArg + "]]";
                args.length = 1;
            }

            pipeline.appendScript('.' + methodName + Argument.build.call(this.context, args));
        }

        pipeline.appendScript(appendArg);

        return pipeline;
    }.bind(this);
};


// [i] => index & [1..2] => range
// Do not pass in method name, just string range
CommandBuilder.prototype.queryIndex = function() {
    return function(range) {
        this.appendScript('['+ range.toString() + ']');

        return this;
    };
};


// and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
CommandBuilder.prototype.queryPipes = function(methodName) {
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
CommandBuilder.prototype.queryCollection = function(methodName) {
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

module.exports = CommandBuilder;



var Pipeline = (function () {
    function Pipeline(graph) {
        this.graph = graph;
        this.gRex = graph.gRex;
        this.script = 'g';
        this.commandBuilder = new CommandBuilder(this);
    }

    Pipeline.prototype.get = function(callback) {
        return this.graph.gRex.exec(this.script).then().nodeify(callback);
    };

    Pipeline.prototype.appendScript = function(script) {
        this.script += script;
    };

    /*** Transform ***/
    Pipeline.prototype._ = function() {
        return this.commandBuilder.queryMain('_').apply(this, arguments);
    };

    Pipeline.prototype.both = function() {
        return this.commandBuilder.queryMain('both').apply(this, arguments);
    };

    Pipeline.prototype.bothE = function() {
        return this.commandBuilder.queryMain('bothE').apply(this, arguments);
    };

    Pipeline.prototype.bothV = function() {
        return this.commandBuilder.queryMain('bothV').apply(this, arguments);
    };

    Pipeline.prototype.cap = function() {
        return this.commandBuilder.queryMain('cap').apply(this, arguments);
    };

    Pipeline.prototype.gather = function() {
        return this.commandBuilder.queryMain('gather').apply(this, arguments);
    };

    Pipeline.prototype.id = function() {
        return this.commandBuilder.queryMain('id').apply(this, arguments);
    };

    Pipeline.prototype.in = function() {
        return this.commandBuilder.queryMain('in').apply(this, arguments);
    };

    Pipeline.prototype.inE = function() {
        return this.commandBuilder.queryMain('inE').apply(this, arguments);
    };

    Pipeline.prototype.inV = function() {
        return this.commandBuilder.queryMain('inV').apply(this, arguments);
    };

    Pipeline.prototype.property = function() {
        return this.commandBuilder.queryMain('property').apply(this, arguments);
    };

    Pipeline.prototype.label = function() {
        return this.commandBuilder.queryMain('label').apply(this, arguments);
    };

    Pipeline.prototype.map = function() {
        return this.commandBuilder.queryMain('map').apply(this, arguments);
    };

    Pipeline.prototype.memoize = function() {
        return this.commandBuilder.queryMain('memoize').apply(this, arguments);
    };

    Pipeline.prototype.order = function() {
        return this.commandBuilder.queryMain('order').apply(this, arguments);
    };

    Pipeline.prototype.out = function() {
        return this.commandBuilder.queryMain('out').apply(this, arguments);
    };

    Pipeline.prototype.outE = function() {
        return this.commandBuilder.queryMain('outE').apply(this, arguments);
    };

    Pipeline.prototype.outV = function() {
        return this.commandBuilder.queryMain('outV').apply(this, arguments);
    };

    Pipeline.prototype.path = function() {
        return this.commandBuilder.queryMain('path').apply(this, arguments);
    };

    Pipeline.prototype.scatter = function() {
        return this.commandBuilder.queryMain('scatter').apply(this, arguments);
    };

    Pipeline.prototype.select = function() {
        return this.commandBuilder.queryMain('select').apply(this, arguments);
    };

    Pipeline.prototype.transform = function() {
        return this.commandBuilder.queryMain('transform').apply(this, arguments);
    };

    Pipeline.prototype.orderMap = function() {
        return this.commandBuilder.queryMain('orderMap').apply(this, arguments);
    };


    /*** Filter ***/
    // index(i)
    Pipeline.prototype.index = function() {
        return this.commandBuilder.queryIndex().apply(this, arguments);
    };

    // range('[i..j]')
    Pipeline.prototype.range = function() {
        return this.commandBuilder.queryIndex().apply(this, arguments);
    };


    Pipeline.prototype.and = function() {
        return this.commandBuilder.queryPipes('and').apply(this, arguments);
    };

    Pipeline.prototype.back = function() {
        return this.commandBuilder.queryMain('back').apply(this, arguments);
    };

    Pipeline.prototype.dedup = function() {
        return this.commandBuilder.queryMain('dedup').apply(this, arguments);
    };

    Pipeline.prototype.except = function() {
        return this.commandBuilder.queryCollection('except').apply(this, arguments);
    };

    Pipeline.prototype.filter = function() {
        return this.commandBuilder.queryMain('filter').apply(this, arguments);
    };

    Pipeline.prototype.has = function() {
        return this.commandBuilder.queryMain('has').apply(this, arguments);
    };

    Pipeline.prototype.hasNot = function() {
        return this.commandBuilder.queryMain('hasNot').apply(this, arguments);
    };

    Pipeline.prototype.interval = function() {
        return this.commandBuilder.queryMain('interval').apply(this, arguments);
    };

    Pipeline.prototype.or = function() {
        return this.commandBuilder.queryPipes('or').apply(this, arguments);
    };

    Pipeline.prototype.random = function() {
        return this.commandBuilder.queryMain('random').apply(this, arguments);
    };

    Pipeline.prototype.retain = function() {
        return this.commandBuilder.queryCollection('retain').apply(this, arguments);
    };

    Pipeline.prototype.simplePath = function() {
        return this.commandBuilder.queryMain('simplePath').apply(this, arguments);
    };

    /*** Side Effect ***/
    // Pipeline.prototype.aggregate // Not implemented
    Pipeline.prototype.as = function() {
        return this.commandBuilder.queryMain('as').apply(this, arguments);
    };

    Pipeline.prototype.groupBy = function() {
        return this.commandBuilder.queryMain('groupBy').apply(this, arguments);
    };

    // Not FullyImplemented ??
    Pipeline.prototype.groupCount = function() {
        return this.commandBuilder.queryMain('groupCount').apply(this, arguments);
    };

    Pipeline.prototype.optional = function() {
        return this.commandBuilder.queryMain('optional').apply(this, arguments);
    };

    Pipeline.prototype.sideEffect = function() {
        return this.commandBuilder.queryMain('sideEffect').apply(this, arguments);
    };

    Pipeline.prototype.linkBoth = function() {
        return this.commandBuilder.queryMain('linkBoth').apply(this, arguments);
    };

    Pipeline.prototype.linkIn = function() {
        return this.commandBuilder.queryMain('linkIn').apply(this, arguments);
    };

    Pipeline.prototype.linkOut = function() {
        return this.commandBuilder.queryMain('linkOut').apply(this, arguments);
    };

    // Pipeline.prototype.store // Not implemented
    // Pipeline.prototype.table // Not implemented
    // Pipeline.prototype.tree // Not implemented

    /*** Branch ***/
    Pipeline.prototype.copySplit = function() {
        return this.commandBuilder.queryPipes('copySplit').apply(this, arguments);
    };
    Pipeline.prototype.exhaustMerge = function() {
        return this.commandBuilder.queryMain('exhaustMerge').apply(this, arguments);
    };

    Pipeline.prototype.fairMerge = function() {
        return this.commandBuilder.queryMain('fairMerge').apply(this, arguments);
    };

    //g.v(1).out()ifThenElse('{it.name=='josh'}','{it.age}','{it.name}')
    Pipeline.prototype.ifThenElse = function() {
        return this.commandBuilder.queryMain('ifThenElse').apply(this, arguments);
    };

    Pipeline.prototype.loop = function() {
        return this.commandBuilder.queryMain('loop').apply(this, arguments);
    };

    /*** Methods ***/
    // Pipeline.prototype.fill // Not implemented
    Pipeline.prototype.count = function() {
        return this.commandBuilder.queryMain('count').apply(this, arguments);
    };

    Pipeline.prototype.iterate = function() {
        return this.commandBuilder.queryMain('iterate').apply(this, arguments);
    };

    Pipeline.prototype.next = function() {
        return this.commandBuilder.queryMain('next').apply(this, arguments);
    };

    Pipeline.prototype.toList = function() {
        return this.commandBuilder.queryMain('toList').apply(this, arguments);
    };

    Pipeline.prototype.keys = function() {
        return this.commandBuilder.queryMain('keys').apply(this, arguments);
    };

    Pipeline.prototype.remove = function() {
        return this.commandBuilder.queryMain('remove').apply(this, arguments);
    };

    Pipeline.prototype.values = function() {
        return this.commandBuilder.queryMain('values').apply(this, arguments);
    };

    Pipeline.prototype.put = function() {
        return this.commandBuilder.queryPipes('put').apply(this, arguments);
    };

    Pipeline.prototype.getPropertyKeys = function() {
        return this.commandBuilder.queryMain('getPropertyKeys').apply(this, arguments);
    };

    Pipeline.prototype.setProperty = function() {
        return this.commandBuilder.queryMain('setProperty').apply(this, arguments);
    };

    Pipeline.prototype.getProperty = function() {
        return this.commandBuilder.queryMain('getProperty').apply(this, arguments);
    };

    // Titan specifics
    Pipeline.prototype.name = function() {
        return this.commandBuilder.queryMain('name').apply(this, arguments);
    };

    Pipeline.prototype.dataType = function() {
        return this.commandBuilder.queryMain('dataType').apply(this, arguments);
    };

    Pipeline.prototype.indexed = function() {
        return this.commandBuilder.queryMain('indexed').apply(this, arguments);
    };

    Pipeline.prototype.unique = function() {
        return this.commandBuilder.queryMain('unique').apply(this, arguments);
    };

    Pipeline.prototype.makePropertyKey = function() {
        return this.commandBuilder.queryMain('makePropertyKey').apply(this, arguments);
    };

    Pipeline.prototype.group = function() {
        return this.commandBuilder.queryMain('group').apply(this, arguments);
    };

    Pipeline.prototype.makeEdgeLabel = function() {
        return this.commandBuilder.queryMain('makeEdgeLabel').apply(this, arguments);
    };

    Pipeline.prototype.query = function() {
        return this.commandBuilder.queryMain('query').apply(this, arguments);
    };

    // Titan v0.4.0 specifics
    Pipeline.prototype.single = function() {
        return this.commandBuilder.queryMain('single').apply(this, arguments);
    };

    Pipeline.prototype.list = function() {
        return this.commandBuilder.queryMain('list').apply(this, arguments);
    };

    // replaces unique(Direction.IN)
    Pipeline.prototype.oneToMany = function() {
        return this.commandBuilder.queryMain('oneToMany').apply(this, arguments);
    };

    // replaces unique(Direction.OUT)
    Pipeline.prototype.manyToOne = function() {
        return this.commandBuilder.queryMain('manyToOne').apply(this, arguments);
    };

    // replaces unique(Direction.IN).unique(Direction.OUT)
    Pipeline.prototype.oneToOne = function() {
        return this.commandBuilder.queryMain('oneToOne').apply(this, arguments);
    };

    Pipeline.prototype.makeKey = function() {
        return this.commandBuilder.queryMain('makeKey').apply(this, arguments);
    };

    Pipeline.prototype.makeLabel = function() {
        return this.commandBuilder.queryMain('makeLabel').apply(this, arguments);
    };

    Pipeline.prototype.make = function() {
        return this.commandBuilder.queryMain('make').apply(this, arguments);
    };

    Pipeline.prototype.sortKey = function() {
        return this.commandBuilder.queryMain('sortKey').apply(this, arguments);
    };

    Pipeline.prototype.signature = function() {
        return this.commandBuilder.queryMain('signature').apply(this, arguments);
    };

    Pipeline.prototype.unidirected = function() {
        return this.commandBuilder.queryMain('unidirected').apply(this, arguments);
    };

    Pipeline.prototype.createKeyIndex = function() {
        return this.commandBuilder.queryMain('createKeyIndex').apply(this, arguments);
    };

    Pipeline.prototype.getIndexes = function() {
        return this.commandBuilder.queryMain('getIndexes').apply(this, arguments);
    };

    Pipeline.prototype.hasIndex = function() {
        return this.commandBuilder.queryMain('hasIndex').apply(this, arguments);
    };

    return Pipeline;

})();
