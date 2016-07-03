'use strict';

var expect = require('chai').expect;

describe('ExpeditiousEngine', function () {

  var ExpeditiousEngine = require('../lib/expeditious-engine');

  ['get', 'set', 'del', 'flush', 'keys', 'ttl']
    .forEach(function (fn) {
      describe('#' + fn, function () {
        it('should return a "not implemented" error', function () {
          var engine = new ExpeditiousEngine();

          // Pass the correct num of args...
          var args = new Array(engine[fn].length - 1);

          // ...and a final callback arg
          args = args.concat(function (err) {
            expect(err).to.exist;
            expect(err.toString()).to.contain(fn);
            expect(err.toString()).to.contain('not implemented');
          });

          engine[fn].apply(null, args);
        });
      });
    });

  describe('#getNamespaceFromKey', function () {
    it('should return an empty string', function () {
      var engine = new ExpeditiousEngine();
      var ns = ':testing';

      expect(engine.getNamespaceFromKey(ns)).to.equal('');
    });

    it('should return the namespace', function () {
      var engine = new ExpeditiousEngine();
      var ns = 'testing';

      expect(engine.getNamespaceFromKey(ns + ':more-stuff')).to.equal(ns);
    });

    it('should return the namespace from key with colon', function () {
      var engine = new ExpeditiousEngine();
      var ns = 'testing';

      expect(
        engine.getNamespaceFromKey(ns + ':more:and:more:stuff')
      ).to.equal(ns);
    });
  });

  describe('#getKeyWithoutNamespace', function () {
    it('should return the key from a namespaced key', function () {
      var engine = new ExpeditiousEngine();
      var ns = 'testing';
      var key = 'more-stuff';

      expect(engine.getKeyWithoutNamespace(ns + ':' + key)).to.equal(key);
    });

    it('should return the key from a namespaced key with colon', function () {
      var engine = new ExpeditiousEngine();
      var ns = 'testing';
      var key = 'more:stuff';

      expect(engine.getKeyWithoutNamespace(ns + ':' + key)).to.equal(key);
    });
  });

});
