var Argument = require('../src/arguments/argument');
var ArrayArgument = require('../src/arguments/array');


describe('Arguments', function() {
  describe('Argument', function() {
    describe('.toGroovy()', function() {
      it('should handle arrays', function() {
        var arg = new Argument(['Foo', 'Bar']);

        arg.toGroovy().should.eql("'Foo','Bar'");
      });

      it('should handle booleans', function() {
        var arg = new Argument(false);

        arg.toGroovy().should.eql('false');
      });
    });
  });

  describe('ArrayArgument', function() {
    describe('.toGroovy()', function() {
      it('should return the appropriate string', function() {
        var array = new ArrayArgument(['Foo', 'Bar']);

        array.toGroovy().should.equal("['Foo','Bar']");
      });
    });
  });
});
