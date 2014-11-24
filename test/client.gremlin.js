var should = require('should');
var _    = require("lodash");

var grex = require('../');
var client = grex.createClient();
var gremlin = grex.gremlin;
var g = grex.g;


describe('client', function() {
  describe('.gremlin()', function() {

    it('should return an appender', function() { /*jshint -W030 */
      gremlin.should.be.a.Function;
    });

    it('should append one statement', function() {
      var query = gremlin(g.v(1));

      query.script.should.equal('g.v(1)\n');
    });

    it('should append many statements', function() {
      var query = gremlin();

      query(g.v(1));
      query(g.v(2));
      query(g.v(3));

      query.script.should.equal('g.v(1)\ng.v(2)\ng.v(3)\n');
    });

    it('should support statements passed in as string', function() {
      var query = gremlin();

      query('g.v(1)');
      query.script.should.equal('g.v(1)\n');
    });

    it('should support statements passed in as string with bound parameters', function(done) {
      var query = gremlin();

      query('g.v(%s)', 1);
      query.script.should.equal('g.v(p0)\n');

      client.execute(query, function(err, response) {
        response.results.length.should.equal(1);
        done();
      });
    });

    it('should string formatting when creating query function object', function(done) {
      var query = gremlin('g.v(%s)', 1);
      query.script.should.equal('g.v(p0)\n');

      client.execute(query, function(err, response) {
        should.not.exist(err);
        response.results.length.should.equal(1);
        done();
      });
    });

    it('should string formatting with multiple parameters', function(done) {
      var query = gremlin("g.addVertex(['name': %s, 'age': %s])", "Bob", 26);
      query.script.should.equal("g.addVertex(['name': p0, 'age': p1])\n");

      client.execute(query, function(err, response) {
        should.not.exist(err);
        response.results.length.should.equal(1);
        done();
      });
    });

    it('should be executable', function(done) {
      client.execute(gremlin(g.v(1)), function(err, response) {
        should.not.exist(err);
        response.results.length.should.equal(1);
        done();
      });
    });

    it('should be fetchable', function(done) {
      client.fetch(gremlin(g.v(1)), function(err, results) {
        should.not.exist(err);
        results.length.should.equal(1);
        done();
      });
    });
  });
});