var gRex = require('../../index.js'),
    Transaction = require("../../src/transaction/transaction");

var g, updatedEdge;

before(function(done){
    gRex.connect()
        .then(function(result) {
            g = result;
            done();
        })
        .fail(function(error) {
            console.error(error);
        });
});


describe('Transaction', function() {
    describe('when adding a Vertex', function() {
        var addedVertex;
        var alice, bob;

        it('should add a vertex in the graph database', function(done) {
            var tx = g.begin();

            alice = tx.addVertex({name: "Alice"});

            tx.commit()
            .then(function(result) {
                done();
            });
        });

        it('should add a vertex and an edge in a transaction', function(done) {
            var tx = g.begin();

            bob = tx.addVertex({name: 'Bob'});
            tx.addEdge(5543345, alice, bob, 'likes', {since: 'now'});

            tx.commit()
            .then(function(result) {
                done();
            });

        });
    });

    describe('when updating a vertex', function() {
        before(function(done) {
            g.V('name', 'Alice')
            .then(function(result) {
                alice = result.results[0];
                done();
            });
        });

        it('should update a property', function(done) {
            var tx = g.begin();

            tx.updateVertex(alice._id, {name: 'Jess'});

            tx.commit()
            .then(function(result) {
                result.should.have.property('txProcessed', 1);
                result.should.have.property('success', true);
                done();
            })
            .fail(function(error) {
                console.error(error);
                done();
            });
        });
    });


    // Currently bugged?
    // @see https://groups.google.com/forum/#!topic/gremlin-users/i0Uci2yZoaQ
    describe.skip('when updating an edge', function() {
        before(function(done) {
            g.V('name', 'Jess').outE('likes')
            .then(function(result) {
                updatedEdge = result.results[0];
                done();
            })
            .fail(function(error) {
                console.error(error);
                done();
            });
        });

        it('should update a property', function(done) {
            tx = g.begin();
            tx.updateEdge(updatedEdge._id, {since: 'forever', foo: 'bar'});

            tx.commit()
            .then(function(result) {
                // console.log(result);
                done();
            })
            .fail(function(error) {
                console.error(error);
                done();
            });
        });
    });


    describe('when deleting two vertices', function() {
        before(function(done) {
            g.V('name', 'Jess')
            .then(function(result) {
                alice = result.results[0];
                done();
            });
        });

        before(function(done) {
            g.V('name', 'Bob')
            .then(function(result) {
                bob = result.results[0];
                done();
            });
        });


        it('should delete vertices in a transaction', function(done) {
            var tx = g.begin();

            tx.removeVertex(alice);
            tx.removeVertex(bob);

            tx.commit()
            .then(function(result) {
                done();
            });
        });
    });
});
