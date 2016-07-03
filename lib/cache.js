'use strict';

var assert = require('assert')
  , getHandlers = require('./handlers')
  , ExpeditiousEngine = require('./expeditious-engine');

module.exports = function getReceptusInstance (opts) {

  assert.equal(
    typeof opts,
    'object',
    'an options Object must be passed to expeditious, e.g expeditious(opts)'
  );

  assert.equal(
    typeof opts.engine,
    'object',
    'opts.engine is required and should be of type Object'
  );

  assert(
    !isNaN(opts.defaultTtl) && opts.defaultTtl > 0,
    'opts.defaultTtl is required and should be a positive Number'
  );

  assert(
    opts.objectMode === undefined || typeof opts.objectMode === 'boolean',
    'opts.objectMode must be a Boolean if provided'
  );

  assert(
    typeof opts.namespace === 'string' && opts.namespace.length > 0,
    'opts.namespace is required and should be of type String'
  );

  assert(
    opts.namespace.match(/^[a-zA-Z0-9]*$/),
    'opts.namespace can only contain alphanumeric characters'
  );



  // Verify engine compliance with the full API
  var tplEngine = new ExpeditiousEngine();
  for (var i in tplEngine) {
    if (!opts.engine[i]) {
      console.warn(
        'WARNING: engine supplied to expeditious has not implemented "%s" func',
        i
      );
    }
  }

  return getHandlers(opts);
};

module.exports.ExpeditiousEngine = ExpeditiousEngine;
