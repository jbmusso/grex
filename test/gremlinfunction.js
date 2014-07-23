var grex = require('../');
var g = grex.g;
var GremlinFunction = require('../src/functions/function');


describe('GremlinFunction', function() {
  describe('.stringifyArgument()', function() {
    it('should handle nested objects', function () {
      var func = new GremlinFunction('testFunction');
      func.stringifyArgument({one: {two: 3}})
        .should.equal('["one":["two":3]]');
    });

    it('should handle curly braces in values', function () {
      var func = new GremlinFunction('testFunction');

      func.stringifyArgument({one: {left: '{', right: '}'}})
        .should.equal('["one":["left":"{","right":"}"]]');
    });

    it('should handle undefined and null values as null', function () {
      var func = new GremlinFunction('testFunction');

      func.stringifyArgument({'null': null, 'undefined': undefined})
        .should.equal('["null":null,"undefined":null]');
    });
  });
});
