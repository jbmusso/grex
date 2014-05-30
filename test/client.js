var should = require('should');

var grex = require('../index.js');
var _    = require("lodash");
var RexsterClient = require('../src/rexsterclient.js');
var GremlinScript = require('../src/gremlinscript.js');


var defaultOptions = {
  'host': 'localhost',
  'port': 8182,
  'graph': 'tinkergraph'
};


describe('RexsterClient', function() {
  describe('connect()', function() {
    describe('when passing no parameters', function() {
      it('should use default options', function(done) {
        grex.connect(function(err, client) {
          should.not.exist(err);
          client.options.should.eql(defaultOptions);
          done();
        });
      });
    });

    describe('when passing custom options', function() {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'gratefulgraph'
      };

      before(function(done) {
        grex.connect(options, function(err, client) {
          done();
        });
      });

      it('should use this new options', function(done) {
        grex.options.graph.should.equal(options.graph);
        done();
      });
    });

    describe('when instantiating a client with custom options', function() {
      var options = {
        'host': 'localhost',
        'port': 8182,
        'graph': 'gratefulgraph'
      };

      it('should use the right options', function(done) {
        var client = new RexsterClient(options);
        client.options.graph.should.equal(options.graph);
        done();
      });
    });
  });

  describe('gremlin()', function() {
    var client;

    before(function() {
      client = new RexsterClient();
    });

    describe('with no parameters', function() {
      var gremlin;

      before(function() {
        gremlin = client.gremlin();
      });

      it('should return an instance of GremlinScript', function() {
        gremlin.should.be.an.instanceof(GremlinScript);
      });

      it('should be an empty script', function() {
        gremlin.script.should.equal('');
        gremlin.params.should.eql({});
      });
    });

    describe('with a Gremlin object wrapper as a parameter', function() {
      var gremlin;
      var g = grex.g;

      before(function() {
        gremlin = client.gremlin(g.v(1));
      });

      it('should return an instance of GremlinScript', function() {
        gremlin.should.be.an.instanceof(GremlinScript);
      });

      it('should have a non empty script', function() {
        gremlin.script.should.equal('g.v(1)');
      });
    });
  });

  describe('grem()', function() {
    var client;
    var gremlin;
    var g;

    before(function(done) {
      grex.connect(function(err, client) {
        gremlin = client.grem();
        g = client.g;
        done();
      });
    });

    it('should return an appender', function() { /*jshint -W030 */
      gremlin.should.be.a.Function;
    });

    it('should append text', function() {
      gremlin(
        g.v(1),
        g.v(2)
      );

      gremlin.script.should.equal('\ng.v(1)\ng.v(2)');
    });

    it('should have an exec function', function() { /*jshint -W030 */
      gremlin.exec.should.be.a.Function;
    });

    it('should be executable', function(done) {
      gremlin.exec(function(err, response) {
        should.not.exist(err);
        response.results.length.should.equal(1);
        done();
      });
    });

    it('should be fetchable', function(done) {
      gremlin.fetch(function(err, results) {
        should.not.exist(err);
        results.length.should.equal(1);
        done();
      });
    });
  });
});