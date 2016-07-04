'use strict';

var expect = require('chai').expect
  , sinon = require('sinon');

describe('expeditious handlers', function () {

  var mod, engine;

  var TEST_VAL = 'some data'
    , TEST_KEY = 'some key'
    , TEST_JSON_STR = JSON.stringify({ cache: 'ftw' })
    , TEST_NAMESPACE = 'test'
    , TEST_DEFAULT_TTL = 5000;

  function genKey (a, b) {
    return a + ':' + b;
  }

  beforeEach(function () {
    engine = {
      get: sinon.stub(),
      set: sinon.stub(),
      del: sinon.stub(),
      flush: sinon.stub(),
      keys: sinon.stub(),
      ttl: sinon.stub()
    };

    mod = require('../lib/handlers')({
      engine: engine,
      namespace: TEST_NAMESPACE,
      defaultTtl: TEST_DEFAULT_TTL
    });
  });

  describe('#get', function () {
    it('should return a stored key', function (done) {
      engine.get.yields(null, TEST_VAL);

      mod.get({
        key: TEST_KEY
      }, function (err, res) {
        expect(err).to.not.exist;
        expect(res).to.equal(TEST_VAL);
        expect(engine.get.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, TEST_KEY)
        );

        done();
      });
    });

    it('should return null', function (done) {
      engine.get.yields(null, null);

      mod.get({
        key: TEST_KEY
      }, function (err, res) {
        expect(err).to.not.exist;
        expect(res).to.be.null;
        expect(engine.get.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, TEST_KEY)
        );

        done();
      });
    });

    it('should return an error', function (done) {
      engine.get.yields(new Error('connection failed'), null);

      mod.get({
        key: TEST_KEY
      }, function (err, res) {
        expect(err).to.exist;
        expect(res).to.be.null;

        done();
      });
    });

    it('should parse the return data to JSON', function (done) {
      engine.get.yields(null, TEST_JSON_STR);

      require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        objectMode: true
      }).get({
        key: TEST_KEY
      }, function (err, res) {
        expect(err).to.not.exist;
        expect(res).to.be.an('object');

        done();
      });
    });

    it('should safely fail to parse return data to JSON', function (done) {
      engine.get.yields(null, '{invalid json');

      require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        objectMode: true
      }).get({
        key: TEST_KEY
      }, function (err, res) {
        expect(err).to.exist;
        expect(res).to.be.null;

        done();
      });
    });
  });

  describe('#set', function () {
    it('should set a key in the store', function (done) {
      engine.set.yields(null);

      mod.set({
        key: TEST_KEY,
        val: TEST_VAL
      }, function (err) {
        expect(err).to.not.exist;
        expect(engine.set.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, TEST_KEY)
        );

        expect(engine.set.getCall(0).args[1]).to.equal(
          TEST_VAL
        );

        expect(engine.set.getCall(0).args[2]).to.equal(
          TEST_DEFAULT_TTL
        );

        done();
      });
    });

    it('should set a key in the store with custom ttl', function (done) {
      engine.set.yields(null);

      mod.set({
        key: TEST_KEY,
        val: TEST_VAL,
        ttl: 2500
      }, function (err) {
        expect(err).to.not.exist;
        expect(engine.set.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, TEST_KEY)
        );

        expect(engine.set.getCall(0).args[1]).to.equal(
          TEST_VAL
        );

        expect(engine.set.getCall(0).args[2]).to.equal(
          2500
        );

        done();
      });
    });

    it('should set a JSON object in cache', function (done) {
      engine.set.yields(null);

      require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        objectMode: true
      }).set({
        key: TEST_KEY,
        val: JSON.parse(TEST_JSON_STR)
      }, function (err) {
        expect(err).to.not.exist;
        expect(engine.set.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, TEST_KEY)
        );

        expect(engine.set.getCall(0).args[1]).to.equal(
          TEST_JSON_STR
        );

        done();
      });
    });

    it('should safely handle stringify errors', function (done) {
      var circularRefObj = {};
      circularRefObj.cref = circularRefObj;

      require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        objectMode: true
      }).set({
        key: TEST_KEY,
        val: circularRefObj
      }, function (err) {
        expect(err).to.exist;

        done();
      });
    });

    it('should handle engine set error', function (done) {
      engine.set.yields(new Error('oops'));

      mod.set({
        key: TEST_KEY,
        val: TEST_VAL
      }, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should work without a callback', function (done) {
      engine.set.yields(null);

      mod.set({
        key: TEST_KEY,
        val: TEST_VAL
      });

      setTimeout(function () {
        done();
      }, 10);
    });
  });

  describe('#del', function () {
    it('should delete a key from the cache', function (done) {
      engine.del.yields(null);

      mod.del({
        key: TEST_KEY
      }, function (err) {
        expect(err).to.not.exist;
        expect(engine.del.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE,TEST_KEY)
        );

        done();
      });
    });

    it('should handle error from engine.del', function (done) {
      engine.del.yields(new Error('delete issues...'));

      mod.del({
        key: TEST_KEY
      }, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should work without a callback', function (done) {
      engine.del.yields(null);

      mod.del({
        key: TEST_KEY
      });

      setTimeout(function () {
        done();
      }, 10);
    });
  });

  describe('#flush', function () {
    it('should call engine.flush with correct args', function (done) {
      engine.flush.yields(null);

      mod.flush({}, function (err) {
        expect(err).to.not.exist;
        expect(engine.flush.getCall(0).args[0]).to.equal(
          TEST_NAMESPACE
        );

        done();
      });
    });

    it('should handle engine.flush errors', function (done) {
      engine.flush.yields(new Error('Remember; always flush!'));

      mod.flush({}, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it('should work without a callback', function (done) {
      engine.flush.yields(null);

      mod.flush({});

      setTimeout(function () {
        done();
      }, 10);
    });
  });

  describe('#ttl', function () {
    it('should call engine.ttl with correct args', function (done) {
      engine.ttl.yields(null);

      mod.ttl({
        key: TEST_KEY
      }, function (err) {
        expect(err).to.not.exist;
        expect(engine.ttl.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, TEST_KEY)
        );

        done();
      });
    });

    it('should call engine.ttl with no child key', function (done) {
      engine.ttl.yields(null);

      mod.ttl({}, function (err) {
        expect(err).to.not.exist;
        expect(engine.ttl.getCall(0).args[0]).to.equal(
          genKey(TEST_NAMESPACE, '')
        );

        done();
      });
    });

    it('should handle engine.ttl errors', function (done) {
      engine.ttl.yields(new Error('Remember; always ttl!'));

      mod.ttl({}, function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('#keys', function () {
    it('should call engine.keys with correct args', function (done) {
      engine.keys.yields(null);

      mod.keys({}, function (err) {
        expect(err).to.not.exist;
        expect(engine.keys.getCall(0).args[0]).to.equal(
          TEST_NAMESPACE
        );

        done();
      });
    });

    it('should handle engine.keys errors', function (done) {
      engine.keys.yields(new Error('Remembe your keys!'));

      mod.keys({}, function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('#isObjectMode', function () {
    it('should return false', function () {
      var mod = require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        defaultTtl: TEST_DEFAULT_TTL,
        objectMode: false
      });

      expect(mod.isObjectMode()).to.be.false;
    });

    it('should return true', function () {
      var mod = require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        defaultTtl: TEST_DEFAULT_TTL,
        objectMode: true
      });

      expect(mod.isObjectMode()).to.be.true;
    });
  });

  describe('#getDefaultTtl', function () {
    it('should return opts.defaultTtl value', function () {
      var mod = require('../lib/handlers')({
        engine: engine,
        namespace: TEST_NAMESPACE,
        defaultTtl: TEST_DEFAULT_TTL,
        objectMode: false
      });

      expect(mod.getDefaultTtl()).to.equal(TEST_DEFAULT_TTL);
    });
  });

});
