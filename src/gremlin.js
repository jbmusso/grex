var _ = require("lodash");

var Argument = require("./argument");


module.exports = (function() {
  function Gremlin(context) {
    this.context = context; // Either an instance of Graph or Pipeline
  }

  Gremlin.prototype.queryMain = function(methodName, pipeline) {
    return function() {
      var appendArg = '';
      pipeline = pipeline || this.context;

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
  Gremlin.prototype.queryIndex = function() {
    return function(range) {
      this.appendScript('['+ range.toString() + ']');

      return this;
    };
  };

  // and | or | put  => g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
  Gremlin.prototype.queryPipes = function(methodName) {
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
  Gremlin.prototype.queryCollection = function(methodName) {
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

  return Gremlin;

})();
