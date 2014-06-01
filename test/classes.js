var should = require('should');

var grex = require('../');

describe('Classes', function() {
  describe('Java classes', function() {
    it('should expose classes object', function() {
      should.exist(grex);
    });

    it('should expose Vertex class', function() {
      var Vertex = grex.Vertex;
      should.exist(Vertex);
      Vertex.toGroovy().should.equal('Vertex.class');
      Vertex.class.should.equal('Vertex.class');
    });

    it('should expose Edge class', function() {
      var Edge = grex.Edge;
      should.exist(Edge);
      Edge.toGroovy().should.equal('Edge.class');
      Edge.class.should.equal('Edge.class');
    });

    it('should expose String class', function() {
      var String = grex.String;
      should.exist(String);
      String.toGroovy().should.equal('String.class');
      String.class.should.equal('String.class');
    });

    it('should expose Integer class', function() {
      var Integer = grex.Integer;
      should.exist(Integer);
      Integer.toGroovy().should.equal('Integer.class');
      Integer.class.should.equal('Integer.class');
    });

    it('should expose Token classes', function() {
      var T = grex.T;
      should.exist(T);
      T.gt.should.equal('T.gt');
    });

    it('should expose Contains classes', function() {
      var Contains = grex.Contains;
      should.exist(Contains);
      Contains.IN.should.equal('Contains.IN');
    });

    it('should expose Direction class', function() {
      var Direction = grex.Direction;
      should.exist(Direction);
      Direction.OUT.should.equal('Direction.OUT');
    });
  });
});