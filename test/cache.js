'use strict';

var expect = require('chai').expect;

describe('expeditious api', function () {

  var expeditious = require('../lib/cache');

  it('should throw an error - missing "defaultTtl"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'test'
      });
    }).to.throw('defaultTtl');
  });

  it('should throw an error - negative "defaultTtl"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'test',
        defaultTtl: -1000
      });
    }).to.throw('defaultTtl');
  });

  it('should throw an error - NaN "defaultTtl"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'test',
        defaultTtl: NaN
      });
    }).to.throw('defaultTtl');
  });

  it('should throw an error - 0 as "defaultTtl"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'test',
        defaultTtl: 0
      });
    }).to.throw('defaultTtl');
  });

  it('should throw an error - missing "namespace"', function () {
    expect(function () {
      expeditious({
        engine: {},
        defaultTtl: 1000
      });
    }).to.throw('namespace');
  });

  it('should throw an error - invalid "namespace"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: '',
        defaultTtl: 1000
      });
    }).to.throw('namespace');
  });

  it('should throw an error - non alphanumeric "namespace"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'hello:',
        defaultTtl: 1000
      });
    }).to.throw('namespace');
  });

  it('should throw an error - non object "engine"', function () {
    expect(function () {
      expeditious({
        engine: '',
        namespace: '',
        defaultTtl: 1000
      });
    }).to.throw('engine');
  });

  it('should throw an error - non boolean "objectMode"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'test',
        defaultTtl: 1000,
        objectMode: null
      });
    }).to.throw('objectMode');
  });

  it('should throw an error - non boolean "objectMode"', function () {
    expect(function () {
      expeditious({
        engine: {},
        namespace: 'test',
        defaultTtl: 1000,
        objectMode: 'null'
      });
    }).to.throw('objectMode');
  });

  it('should create expeditious instance', function () {
    var i = expeditious({
      engine: (function () {
        var ret = {};

        ['get', 'set', 'del', 'flush', 'keys', 'ttl']
          .forEach(function (key) {
            ret[key] = function () {};
          });

        return ret;
      })(),
      namespace: 'test',
      defaultTtl: 1000,
      objectMode: true
    });

    expect(i).to.be.an('object');
  });

  it('should create expeditious instance with partial engine', function () {
    var i = expeditious({
      engine: (function () {
        var ret = {};

        ['get', 'set', 'del', 'keys', 'ttl']
          .forEach(function (key) {
            ret[key] = function () {};
          });

        return ret;
      })(),
      namespace: 'test',
      defaultTtl: 1000,
      objectMode: true
    });

    expect(i).to.be.an('object');
  });

});
