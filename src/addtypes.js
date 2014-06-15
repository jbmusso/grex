/*jslint node: true */
'use strict';
var _ = require("lodash");

var typeHash = {
  'integer': 'i',
  'long': 'l',
  'float': 'f',
  'double': 'd',
  'string': 's',
  'boolean': 'b',
  'i': 'i',
  'l': 'l',
  'f': 'f',
  'd': 'd',
  's': 's',
  'b': 'b',
  'list': 'list',
  'map': 'map'
};


module.exports = function addTypes(obj, typeDef, embedded, list){
  var tempObj = {};
  var tempStr = '';
  var obj2, idx = 0;

  _.forOwn(obj, function(v, k) {
    if(typeDef){
      if ((k in typeDef) && _.isObject(typeDef[k])) {
        if(embedded){
          if (list) {
            obj2 = obj[k];

            _.forOwn(obj2, function(v2, k2) {
              if(typeDef[k] && (k2 in typeDef[k])){
                tempStr += '(map,(' + addTypes(obj[k], typeDef[k], true) + '))';
              }
            });
          } else {
            tempStr += k + '=(map,(' + addTypes(obj[k], typeDef[k], true) + '))';
          }
          tempStr = tempStr.replace(')(', '),(');
        } else {
          tempObj[k] = '(map,(' + addTypes(obj[k], typeDef[k], true) + '))';
        }
      } else if ((k in typeDef) && _.isArray(typeDef[k])) {
        if(embedded){
          tempStr += '(list,(' + addTypes(obj[k], typeDef[k], true, true) + '))';
          tempStr = tempStr.replace(')(', '),(');
        } else {
          tempObj[k] = '(list,(' + addTypes(obj[k], typeDef[k], true, true) + '))';
        }
      } else {
        if(embedded){
          if (list) {
            if (k in typeDef) {
              idx = k;
              tempStr += '(' + typeHash[typeDef[idx]] + ',' + obj[k] + ')';
            } else {
              idx = typeDef.length - 1;

              if (_.isObject(typeDef[idx])) {
                tempStr += ',(map,(' + addTypes(obj[k], typeDef[idx], true) + '))';
              } else if (_.isArray(typeDef[idx])){
                tempStr += ',(list,(' + addTypes(obj[k], typeDef[idx], true, true) + '))';
              } else {
                tempStr += '(' + typeHash[typeDef[idx]] + ',' + obj[k] + ')';
              }
            }

            tempStr = tempStr.replace(')(', '),(');
          } else {
            if (k in typeDef) {
              tempStr += k + '=(' + typeHash[typeDef[k]] + ',' + obj[k] + ')';
                tempStr = tempStr.replace(')(', '),(');
            } else {
              tempObj[k] = obj[k];
            }
          }
        } else {
          if (k in typeDef) {
            tempObj[k] = '(' + typeHash[typeDef[k]] + ',' + obj[k] + ')';
          } else {
            tempObj[k] = obj[k];
          }
        }
      }
    } else {
      tempObj[k] = obj[k];
    }
  });

  return embedded ? tempStr : tempObj;
};
