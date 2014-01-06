var _ = require("lodash");

var Argument = require("./argument");


module.exports = (function() {
  function Gremlin(pipeline) {
    this.pipeline = pipeline; // Either an instance of Graph or Pipeline
    this.script = 'g';
  }

  /**
   * @private
   * @param {String} script
   */
  Gremlin.prototype.appendScript = function(script) {
    this.script += script;
  };

  /**
   * Populate a Gremlin script string with default behavior. Used for most
   * commands.
   * This method optionally takes a new Pipeline object as second parameter.
   *
   * @param {String} methodName
   * @param {Pipeline} pipeline Optional pipeline
   */
  Gremlin.prototype.queryMain = function(methodName, pipeline) {
    return function() {
      var appendArg = '';

      if (pipeline) {
        // Set a new Pipeline instance, if supplied
        this.pipeline = pipeline;
      }

      var gremlin = this.pipeline.gremlin;

      //cater for select array parameters
      if(methodName == 'select'){
        gremlin.appendScript('.' + methodName + Argument.build.call(this.pipeline, arguments, true));
      } else {
        var args = _.isArray(arguments[0]) ? arguments[0] : arguments;

        //cater for idx param 2
        if (methodName == 'idx' && args.length > 1) {
          _.each(args[1], function(v, k) {
            appendArg = k + ":";
            appendArg += Argument.parse.call(this.pipeline, args[1][k]);
          }, this);

          appendArg = "[["+ appendArg + "]]";
          args.length = 1;
        }

        gremlin.appendScript('.' + methodName + Argument.build.call(this.pipeline, args));
      }

      gremlin.appendScript(appendArg);
    }.bind(this);
  };

  /**
   * Alternative 'index' and 'range' commands, ie:
   *   index() => [i]
   *   range() => [1..2]
   *
   * Do not pass in method name, just string range.
   */
  Gremlin.prototype.queryIndex = function(range) {
    this.appendScript('['+ range.toString() + ']');
  };

  /**
   * Used for 'and', 'or' & 'put commands, ie:
   *   g.v(1).outE().or(g._().has('id', 'T.eq', 9), g._().has('weight', 'T.lt', '0.6f'))
   *
   * @param {String} methodName
   */
  Gremlin.prototype.queryPipes = function(methodName) {
    return function() {
      var args = _.isArray(arguments[0]) ? arguments[0] : arguments;

      this.gremlin.appendScript("." + methodName + "(");

      _.each(args, function(arg) {
        var partialScript = (arg.gremlin && arg.gremlin.script) || Argument.parse.call(this, arg);
        this.gremlin.appendScript(partialScript + ",");
      }, this);

      this.gremlin.script = this.gremlin.script.slice(0, -1); // Remove trailing comma
      this.gremlin.appendScript(")");
    };
  }.bind(this);

  /**
   * Used for retain & except commands, ie:
   *   g.V().retain([g.v(1), g.v(2), g.v(3)])
   *
   * @param {String} methodName
   */
  Gremlin.prototype.queryCollection = function(methodName) {
    return function() {
      var param = '';

      if(_.isArray(arguments[0])){
        _.each(arguments[0], function(arg) {
          param += arg.gremlin.script;
          param += ",";
        });

        this.gremlin.appendScript("." + methodName + "([" + param + "])");
      } else {
        this.gremlin.appendScript("." + methodName + Argument.build.call(this, arguments[0]));
      }
    };
  }.bind(this);

  return Gremlin;

})();
