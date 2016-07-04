'use strict';

var VError = require('verror')
  , safejson = require('safejson');

module.exports = function getReceptusHandlers (opts) {
  var handlers = {};

  function generateCacheKey (resource) {
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
    opts.engine.keys(
      opts.namespace,
      function onKeys (err, res) {
        callback(wrapError(err, 'keys'), res);
      }
    );
  };

  handlers.ttl = function ttl (params, callback) {
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
