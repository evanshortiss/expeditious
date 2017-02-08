'use strict';

const VError = require('verror');
const safejson = require('safejson');
const debug = require('debug');
const pkg = require('../package');

module.exports = function getReceptusHandlers (opts) {
  const handlers = {};
  const log = debug(`${pkg.name}@${pkg.version}-${opts.namespace}`);

  function generateCacheKey (resource) {
    log(
      'generating cache key for resource "%s" in namespace "%s"',
      resource,
      opts.namespace
    );
    return opts.namespace + ':' + (resource || '');
  }

  function wrapError (err, key) {
    if (err) {
      return new VError(err, 'engine failed to perform "%s" call', key);
    } else {
      return err;
    }
  }

  handlers.get = function get (params, callback) {
    log('get called with:', params);
    function onGetCallComplete (err, str) {
      if (!err && opts.objectMode) {
        safejson.parse(str, callback);
      } else {
        callback(wrapError(err, 'get'), str);
      }
    }

    opts.engine.get(
      generateCacheKey(params.key),
      onGetCallComplete
    );
  };

  handlers.set = function set (params, callback) {
    log('set called with:', params);
    function onSet (err, res) {
      if (callback) {
        callback(wrapError(err, 'set'), res);
      }
    }

    function onStringified (err, str) {
      if (err) {
        onSet(err, str);
      } else {
        opts.engine.set(
          generateCacheKey(params.key), str,
          params.ttl || opts.defaultTtl,
          onSet
        );
      }
    }

    if (opts.objectMode) {
      safejson.stringify(params.val, onStringified);
    } else {
      opts.engine.set(
        generateCacheKey(params.key), params.val,
        params.ttl || opts.defaultTtl,
        onSet
      );
    }
  };

  handlers.del = function del (params, callback) {
    log('del called with:', params);
    opts.engine.del(
      generateCacheKey(params.key),
      function onDel (err, res) {
        if (callback) {
          callback(wrapError(err, 'del'), res);
        }
      }
    );
  };

  handlers.flush = function flush (params, callback) {
    log('flush called with:', params);
    opts.engine.flush(
      opts.namespace,
      function onFlush (err, res) {
        if (callback) {
          callback(wrapError(err, 'flush'), res);
        }
      }
    );
  };

  handlers.keys = function keys (params, callback) {
    log('keys called with:', params);
    opts.engine.keys(
      opts.namespace,
      function onKeys (err, res) {
        callback(wrapError(err, 'keys'), res);
      }
    );
  };

  handlers.ttl = function ttl (params, callback) {
    log('ttl called with:', params);
    opts.engine.ttl(
      generateCacheKey(params.key),
      function onTtl (err, res) {
        callback(wrapError(err, 'ttl'), res);
      }
    );
  };

  handlers.isObjectMode = function isObjectMode () {
    return opts.objectMode;
  };

  handlers.getDefaultTtl = function isObjectMode () {
    return opts.defaultTtl;
  };

  return handlers;
};
