var should = require('should');

var grex = require('../');
var _    = require("lodash");
var GremlinScript = require('../src/gremlinscript.js');

var g = grex.g;


describe('client', function() {
  describe('.gremlin()', function() {
    var client;
    var gremlin;
    var query;

    before(function(done) {
      grex.connect(function(err, client) {
        gremlin = client.gremlin;
        done();
      });
    });

    it('should return an appender', function() { /*jshint -W030 */
      gremlin.should.be.a.Function;
    });

    it('should append one statement', function() {
      var query = gremlin(g.v(1));

      query.script.should.equal('g.v(1)');
    });

    it('should append many statements', function() {
      var query = gremlin();

      query(g.v(1));
      query(g.v(2));
      query(g.v(3));

      query.script.should.equal('\ng.v(1)\ng.v(2)\ng.v(3)');
    });

    it('should support statements passed in as string', function() {
      var query = gremlin();

      query('g.v(1)');
      query.script.should.equal('\ng.v(1)');
    });

    it('should support statements passed in as string with bound parameters', function(done) {
      var query = gremlin();

      query('g.v(%s)', 1);
      query.script.should.equal('\ng.v(p0)');

      query.exec(function(err, response) {
        should.not.exist(err);
        response.results.length.should.equal(1);
        done();
      })
    });

    it('should have an exec function', function() { /*jshint -W030 */
      var query = gremlin();
      query.exec.should.be.a.Function;
    });

    it('should have an fetch function', function() { /*jshint -W030 */
      var query = gremlin();
      query.fetch.should.be.a.Function;
    });

    it('should be executable', function(done) {
      gremlin(g.v(1)).exec(function(err, response) {
        should.not.exist(err);
        response.results.length.should.equal(1);
        done();
      });
    });

    it('should be fetchable', function(done) {
      gremlin(g.v(1)).fetch(function(err, results) {
        should.not.exist(err);
        results.length.should.equal(1);
        done();
      });
    });
  });
});