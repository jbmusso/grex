/*jslint node: true */
'use strict';
var Vertex = require('../objects/vertex');
var Edge = require('../objects/edge');

var JavaClass = require('./javaclass');

var classes = {
  Vertex: Vertex,
  Edge: Edge,
  Geoshape: new JavaClass('Geoshape'),
  'String': new JavaClass('String'),
  Integer: new JavaClass('Integer'),
  T: {
    'gt': 'T.gt',
    'gte': 'T.gte',
    'eq': 'T.eq',
    'neq': 'T.neq',
    'lte': 'T.lte',
    'lt': 'T.lt',
    'decr': 'T.decr',
    'incr': 'T.incr',
    'notin': 'T.notin',
    'in': 'T.in'
  },

  Contains: {
    'IN': 'Contains.IN',
    'NOT_IN': 'Contains.NOT_IN'
  },

  Direction: {
    'OUT': 'Direction.OUT',
    'IN': 'Direction.IN',
    'BOTH': 'Direction.BOTH'
  },

  TitanKey: new JavaClass('TitanKey'),
  TitanLabel : new JavaClass('TitanLabel'),
};

module.exports = classes;